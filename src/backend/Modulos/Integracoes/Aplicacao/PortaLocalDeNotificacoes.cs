using System.Text.Json;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Integracoes;
using LavaMais.Crm.Modulos.Integracoes.Dominio;
using LavaMais.Crm.Modulos.Integracoes.Infraestrutura;
using Microsoft.EntityFrameworkCore;

namespace LavaMais.Crm.Modulos.Integracoes.Aplicacao;

public sealed class PortaLocalDeNotificacoes(
    ContextoDeIntegracoes banco,
    ClienteWhatsMiau cliente,
    TimeProvider relogio) : IPortaDeNotificacoes
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    public ServicoDeNotificacao Servico => ServicoDeNotificacao.Local;

    public async Task<ReferenciaDeNotificacao> Criar(
        Guid tenantId,
        SolicitacaoDeNotificacao solicitacao,
        CancellationToken ct)
    {
        var notificacao = await banco.NotificacoesLocais
            .IgnoreQueryFilters()
            .SingleOrDefaultAsync(
                x => x.TenantId == tenantId && x.ChaveIdempotencia == solicitacao.ChaveIdempotencia,
                ct);

        if (notificacao is null)
        {
            notificacao = NotificacaoLocal.Criar(
                tenantId,
                solicitacao,
                JsonSerializer.Serialize(solicitacao.Parametros, Json),
                relogio.GetUtcNow());
            banco.Add(notificacao);
            await banco.SaveChangesAsync(ct);
        }

        var referencia = new ReferenciaDeNotificacao(Servico, notificacao.Id.ToString());
        if (notificacao.Finalizada) return referencia;
        if (notificacao.Situacao == SituacaoDaNotificacaoLocal.Enviando)
        {
            notificacao.RegistrarFalha(
                "resultado_envio_indeterminado",
                "Uma tentativa anterior foi interrompida antes de confirmar o resultado no WhatsMiau.",
                relogio.GetUtcNow());
            await banco.SaveChangesAsync(ct);
            return referencia;
        }

        notificacao.RegistrarTentativa(relogio.GetUtcNow());
        await banco.SaveChangesAsync(ct);

        try
        {
            var identificador = await cliente.EnviarTexto(
                notificacao.TelefoneDestinatario,
                notificacao.ConteudoSnapshot,
                ct);
            notificacao.RegistrarEnvio(identificador, relogio.GetUtcNow());
            await banco.SaveChangesAsync(ct);
            return referencia;
        }
        catch (ExcecaoDeNotificacaoTransitoria ex)
        {
            notificacao.RegistrarErroTemporario(ex.Message, relogio.GetUtcNow());
            await banco.SaveChangesAsync(ct);
            throw;
        }
        catch (ExcecaoDeNotificacaoPermanente ex)
        {
            notificacao.RegistrarFalha(ex.Codigo, ex.Message, relogio.GetUtcNow());
            await banco.SaveChangesAsync(ct);
            return referencia;
        }
    }

    public async Task<EstadoConsolidadoDaNotificacao> Obter(string id, CancellationToken ct)
    {
        if (!Guid.TryParse(id, out var notificacaoId))
            throw new ExcecaoDeNotificacaoPermanente(
                "identificador_local_invalido",
                "O identificador da notificacao local e invalido.");

        var notificacao = await banco.NotificacoesLocais
            .IgnoreQueryFilters()
            .AsNoTracking()
            .SingleOrDefaultAsync(x => x.Id == notificacaoId, ct)
            ?? throw new ExcecaoDeNotificacaoPermanente(
                "notificacao_local_nao_encontrada",
                "A notificacao local nao foi encontrada.");

        return notificacao.Consolidar();
    }
}
