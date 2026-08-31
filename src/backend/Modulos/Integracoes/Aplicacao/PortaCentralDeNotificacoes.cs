using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Integracoes;
using Microsoft.Extensions.Options;

namespace LavaMais.Crm.Modulos.Integracoes.Aplicacao;

public sealed class PortaCentralDeNotificacoes(
    HttpClient http,
    IOptions<OpcoesDeNotificacoes> opcoes) : IPortaDeNotificacoes
{
    private readonly OpcoesDaCentralDeNotificacoes opcoes = opcoes.Value.Central;

    public ServicoDeNotificacao Servico => ServicoDeNotificacao.Central;

    public async Task<ReferenciaDeNotificacao> Criar(
        Guid tenantId,
        SolicitacaoDeNotificacao solicitacao,
        CancellationToken ct)
    {
        var contrato = new SolicitacaoDaCentral(
            opcoes.Origem,
            solicitacao.Canal,
            solicitacao.ChaveModelo,
            solicitacao.ChaveIdempotencia,
            solicitacao.NomeDestinatario,
            solicitacao.TelefoneDestinatario,
            solicitacao.Parametros);
        using var requisicao = CriarRequisicao(HttpMethod.Post, "/api/v1/notifications");
        requisicao.Content = JsonContent.Create(contrato);
        using var resposta = await Enviar(requisicao, ct);
        ValidarResposta(resposta);

        try
        {
            await using var corpo = await resposta.Content.ReadAsStreamAsync(ct);
            using var json = await JsonDocument.ParseAsync(corpo, cancellationToken: ct);
            if (json.RootElement.TryGetProperty("id", out var id) && !string.IsNullOrWhiteSpace(id.GetString()))
                return new ReferenciaDeNotificacao(Servico, id.GetString()!);
        }
        catch (JsonException ex)
        {
            throw new ExcecaoDeNotificacaoPermanente(
                "resposta_central_invalida",
                "A Central de Notificacoes retornou uma resposta invalida.",
                ex);
        }

        throw new ExcecaoDeNotificacaoPermanente(
            "resposta_sem_identificador",
            "A Central de Notificacoes nao retornou o identificador da notificacao.");
    }

    public async Task<EstadoConsolidadoDaNotificacao> Obter(string id, CancellationToken ct)
    {
        using var requisicao = CriarRequisicao(
            HttpMethod.Get,
            $"/api/v1/notifications/{Uri.EscapeDataString(id)}");
        using var resposta = await Enviar(requisicao, ct);
        ValidarResposta(resposta);

        EstadoDaCentral? estado;
        try
        {
            estado = await resposta.Content.ReadFromJsonAsync<EstadoDaCentral>(cancellationToken: ct);
        }
        catch (JsonException ex)
        {
            throw new ExcecaoDeNotificacaoPermanente(
                "resposta_central_invalida",
                "A Central de Notificacoes retornou um estado invalido.",
                ex);
        }

        if (estado is null || string.IsNullOrWhiteSpace(estado.Status))
            throw new ExcecaoDeNotificacaoPermanente(
                "resposta_central_invalida",
                "A Central de Notificacoes nao retornou o estado da notificacao.");

        return Consolidar(estado);
    }

    private HttpRequestMessage CriarRequisicao(HttpMethod metodo, string caminho)
    {
        var requisicao = new HttpRequestMessage(metodo, caminho);
        requisicao.Headers.Add("X-Api-Key", opcoes.ApiKey);
        return requisicao;
    }

    private async Task<HttpResponseMessage> Enviar(HttpRequestMessage requisicao, CancellationToken ct)
    {
        try
        {
            return await http.SendAsync(requisicao, HttpCompletionOption.ResponseHeadersRead, ct);
        }
        catch (OperationCanceledException) when (!ct.IsCancellationRequested)
        {
            throw new ExcecaoDeNotificacaoTransitoria("A Central de Notificacoes excedeu o tempo limite.");
        }
        catch (HttpRequestException ex)
        {
            throw new ExcecaoDeNotificacaoTransitoria("Nao foi possivel acessar a Central de Notificacoes.", ex);
        }
    }

    private static void ValidarResposta(HttpResponseMessage resposta)
    {
        if (resposta.IsSuccessStatusCode) return;
        if (resposta.StatusCode is HttpStatusCode.RequestTimeout or HttpStatusCode.TooManyRequests
            || (int)resposta.StatusCode >= 500)
            throw new ExcecaoDeNotificacaoTransitoria(
                $"A Central de Notificacoes respondeu com HTTP {(int)resposta.StatusCode}.");

        var codigo = resposta.StatusCode == HttpStatusCode.NotFound
            ? "notificacao_central_nao_encontrada"
            : "central_rejeitou_solicitacao";
        throw new ExcecaoDeNotificacaoPermanente(
            codigo,
            $"A Central de Notificacoes rejeitou a operacao com HTTP {(int)resposta.StatusCode}.");
    }

    private static EstadoConsolidadoDaNotificacao Consolidar(EstadoDaCentral estado)
    {
        var entrega = estado.DeliveryStatus?.ToUpperInvariant();
        if (entrega == "READ") return new(SituacaoTecnicaDaNotificacao.Lida);
        if (entrega == "DELIVERED") return new(SituacaoTecnicaDaNotificacao.Entregue);
        if (entrega == "UNDELIVERABLE") return new(SituacaoTecnicaDaNotificacao.Falhou, estado.FailureCode);

        return estado.Status.ToUpperInvariant() switch
        {
            "FAILED" => new(SituacaoTecnicaDaNotificacao.Falhou, estado.FailureCode),
            "SENT" => new(SituacaoTecnicaDaNotificacao.Enviada),
            "PROCESSING" => new(SituacaoTecnicaDaNotificacao.Processando),
            _ when entrega == "SUBMITTED" => new(SituacaoTecnicaDaNotificacao.Enviada),
            _ => new(SituacaoTecnicaDaNotificacao.Pendente)
        };
    }

    private sealed record SolicitacaoDaCentral(
        [property: JsonPropertyName("source")] string Origem,
        [property: JsonPropertyName("channel")] string Canal,
        [property: JsonPropertyName("templateKey")] string ChaveModelo,
        [property: JsonPropertyName("idempotencyKey")] string ChaveIdempotencia,
        [property: JsonPropertyName("recipientName")] string NomeDestinatario,
        [property: JsonPropertyName("recipientPhone")] string TelefoneDestinatario,
        [property: JsonPropertyName("payload")] IReadOnlyDictionary<string, string> Parametros);

    private sealed record EstadoDaCentral(
        string Status,
        string? DeliveryStatus,
        string? FailureCode);
}
