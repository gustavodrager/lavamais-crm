using System.Buffers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using LavaMais.Crm.Modulos.Integracoes.Dominio;
using LavaMais.Crm.Modulos.Integracoes.Infraestrutura;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace LavaMais.Crm.Modulos.Integracoes.Aplicacao;

public sealed class ProcessadorDeWebhookWhatsMiau(
    ContextoDeIntegracoes banco,
    IOptions<OpcoesDeNotificacoes> opcoes,
    TimeProvider relogio,
    ILogger<ProcessadorDeWebhookWhatsMiau> logger)
{
    private const int TamanhoMaximoDoCorpo = 256 * 1024;
    private readonly OpcoesDoWhatsMiau opcoes = opcoes.Value.WhatsMiau;

    public async Task Processar(string segredoRecebido, HttpRequest requisicao, CancellationToken ct)
    {
        if (!SegredoValido(segredoRecebido, opcoes.SegredoWebhook)) return;

        try
        {
            var corpo = await LerCorpo(requisicao, ct);
            if (corpo is null) return;

            using var json = JsonDocument.Parse(corpo);
            var raiz = json.RootElement;
            if (!raiz.TryGetProperty("event", out var evento)
                || !string.Equals(evento.GetString(), "messages.update", StringComparison.OrdinalIgnoreCase))
                return;

            if (raiz.TryGetProperty("instance", out var instancia)
                && !string.IsNullOrWhiteSpace(opcoes.NomeInstancia)
                && !string.Equals(instancia.GetString(), opcoes.NomeInstancia, StringComparison.Ordinal))
                return;

            if (!raiz.TryGetProperty("data", out var dados)) return;
            if (dados.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in dados.EnumerateArray()) await ProcessarAtualizacao(item, ct);
            }
            else if (dados.ValueKind == JsonValueKind.Object)
            {
                await ProcessarAtualizacao(dados, ct);
            }
        }
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {
            return;
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Webhook do WhatsMiau ignorado por falha no processamento");
        }
    }

    private async Task ProcessarAtualizacao(JsonElement dados, CancellationToken ct)
    {
        if (!dados.TryGetProperty("status", out var status)
            || !ConversorDeStatusWhatsMiau.TentarConverter(status.GetString(), out var situacao))
            return;

        var identificador = ObterTexto(dados, "keyId") ?? ObterTexto(dados, "messageId");
        if (string.IsNullOrWhiteSpace(identificador)) return;

        var notificacao = await banco.NotificacoesLocais
            .IgnoreQueryFilters()
            .SingleOrDefaultAsync(x => x.IdentificadorNoProvedor == identificador, ct);
        if (notificacao is null) return;

        notificacao.AtualizarEntrega(situacao, relogio.GetUtcNow());
        await banco.SaveChangesAsync(ct);
    }

    private static string? ObterTexto(JsonElement elemento, string propriedade) =>
        elemento.TryGetProperty(propriedade, out var valor) && valor.ValueKind == JsonValueKind.String
            ? valor.GetString()
            : null;

    private static bool SegredoValido(string recebido, string esperado)
    {
        if (string.IsNullOrEmpty(recebido) || string.IsNullOrEmpty(esperado)) return false;
        var hashRecebido = SHA256.HashData(Encoding.UTF8.GetBytes(recebido));
        var hashEsperado = SHA256.HashData(Encoding.UTF8.GetBytes(esperado));
        return CryptographicOperations.FixedTimeEquals(hashRecebido, hashEsperado);
    }

    private static async Task<byte[]?> LerCorpo(HttpRequest requisicao, CancellationToken ct)
    {
        if (requisicao.ContentLength > TamanhoMaximoDoCorpo) return null;

        var buffer = ArrayPool<byte>.Shared.Rent(8192);
        try
        {
            using var destino = new MemoryStream();
            while (true)
            {
                var restante = TamanhoMaximoDoCorpo + 1 - (int)destino.Length;
                if (restante <= 0) return null;
                var lidos = await requisicao.Body.ReadAsync(
                    buffer.AsMemory(0, Math.Min(buffer.Length, restante)),
                    ct);
                if (lidos == 0) break;
                await destino.WriteAsync(buffer.AsMemory(0, lidos), ct);
            }

            return destino.Length > TamanhoMaximoDoCorpo ? null : destino.ToArray();
        }
        finally
        {
            ArrayPool<byte>.Shared.Return(buffer);
        }
    }
}

public static class ConversorDeStatusWhatsMiau
{
    public static bool TentarConverter(string? status, out SituacaoDeEntregaLocal situacao)
    {
        situacao = status?.ToUpperInvariant() switch
        {
            "SERVER_ACK" => SituacaoDeEntregaLocal.Submetida,
            "DELIVERY_ACK" => SituacaoDeEntregaLocal.Entregue,
            "READ" or "PLAYED" => SituacaoDeEntregaLocal.Lida,
            "ERROR" or "ERROR_ACK" or "FAILED" => SituacaoDeEntregaLocal.NaoEntregue,
            _ => default
        };

        return status?.ToUpperInvariant() is
            "SERVER_ACK" or "DELIVERY_ACK" or "READ" or "PLAYED" or "ERROR" or "ERROR_ACK" or "FAILED";
    }
}
