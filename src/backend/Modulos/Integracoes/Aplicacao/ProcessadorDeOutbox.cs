using System.Text.Json;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Integracoes;
using LavaMais.Crm.Modulos.Integracoes.Dominio;
using LavaMais.Crm.Modulos.Integracoes.Infraestrutura;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace LavaMais.Crm.Modulos.Integracoes.Aplicacao;

public sealed class ProcessadorDeOutbox(
    ContextoDeIntegracoes banco,
    IDespachanteDeNotificacoes notificacoes,
    IProjecaoDeEnvios projecao,
    TimeProvider relogio)
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    public async Task<bool> ProcessarProxima(CancellationToken ct)
    {
        var agora = relogio.GetUtcNow();
        var mensagem = await banco.Mensagens
            .IgnoreQueryFilters()
            .Where(x =>
                (x.Situacao == SituacaoDaOutbox.Pendente && x.DisponivelEm <= agora)
                || (x.Situacao == SituacaoDaOutbox.Processando && x.ProcessandoAte <= agora))
            .OrderBy(x => x.DataCriacao)
            .FirstOrDefaultAsync(ct);
        if (mensagem is null) return false;

        mensagem.MarcarProcessando(agora);
        try
        {
            await banco.SaveChangesAsync(ct);
        }
        catch (DbUpdateConcurrencyException)
        {
            banco.ChangeTracker.Clear();
            return true;
        }

        MensagemDeEnvioOutbox conteudo;
        try
        {
            conteudo = JsonSerializer.Deserialize<MensagemDeEnvioOutbox>(mensagem.ConteudoJson, Json)
                ?? throw new JsonException("O conteudo da outbox esta vazio.");
        }
        catch (JsonException ex)
        {
            mensagem.Falhar($"conteudo_outbox_invalido: {ex.Message}", relogio.GetUtcNow());
            await banco.SaveChangesAsync(ct);
            return true;
        }

        try
        {
            Validar(conteudo.Solicitacao);
            var referencia = await notificacoes.Criar(conteudo.TenantId, conteudo.Solicitacao, ct);
            await Concluir(mensagem, conteudo, referencia, ct);
        }
        catch (ExcecaoDeNotificacaoTransitoria ex)
        {
            mensagem.Reagendar(ex.Message, relogio.GetUtcNow());
            await banco.SaveChangesAsync(ct);
        }
        catch (ExcecaoDeNotificacaoPermanente ex)
        {
            await Falhar(mensagem, conteudo, ex.Codigo, ex.Message, ct);
        }

        return true;
    }

    private static void Validar(SolicitacaoDeNotificacao? solicitacao)
    {
        if (solicitacao is null
            || string.IsNullOrWhiteSpace(solicitacao.Canal)
            || string.IsNullOrWhiteSpace(solicitacao.ChaveModelo)
            || string.IsNullOrWhiteSpace(solicitacao.ChaveIdempotencia)
            || string.IsNullOrWhiteSpace(solicitacao.NomeDestinatario)
            || string.IsNullOrWhiteSpace(solicitacao.TelefoneDestinatario)
            || string.IsNullOrWhiteSpace(solicitacao.Conteudo)
            || solicitacao.Parametros is null)
            throw new ExcecaoDeNotificacaoPermanente(
                "conteudo_outbox_incompativel",
                "A solicitacao persistida na outbox e invalida ou pertence a um contrato anterior.");
    }

    public async Task Reconciliar(CancellationToken ct)
    {
        foreach (var item in await projecao.ListarPendentes(100, ct))
        {
            EstadoConsolidadoDaNotificacao estado;
            try
            {
                estado = await notificacoes.Obter(item.Referencia, ct);
            }
            catch (ExcecaoDeNotificacaoTransitoria)
            {
                continue;
            }
            catch (ExcecaoDeNotificacaoPermanente ex)
            {
                estado = new EstadoConsolidadoDaNotificacao(
                    SituacaoTecnicaDaNotificacao.Falhou,
                    ex.Codigo);
            }

            await projecao.AtualizarEstado(item.TenantId, item.DestinatarioId, estado, ct);
        }
    }

    private async Task Concluir(
        MensagemDaOutbox mensagem,
        MensagemDeEnvioOutbox conteudo,
        ReferenciaDeNotificacao referencia,
        CancellationToken ct)
    {
        await using var transacao = await banco.Database.BeginTransactionAsync(ct);
        mensagem.Concluir(relogio.GetUtcNow());
        await banco.SaveChangesAsync(ct);
        await projecao.RegistrarSolicitacao(
            conteudo.TenantId,
            conteudo.DestinatarioId,
            referencia,
            transacao.GetDbTransaction(),
            ct);
        await transacao.CommitAsync(ct);
    }

    private async Task Falhar(
        MensagemDaOutbox mensagem,
        MensagemDeEnvioOutbox conteudo,
        string codigo,
        string erro,
        CancellationToken ct)
    {
        await using var transacao = await banco.Database.BeginTransactionAsync(ct);
        mensagem.Falhar(erro, relogio.GetUtcNow());
        await banco.SaveChangesAsync(ct);
        await projecao.RegistrarFalhaNaSolicitacao(
            conteudo.TenantId,
            conteudo.DestinatarioId,
            codigo,
            transacao.GetDbTransaction(),
            ct);
        await transacao.CommitAsync(ct);
    }
}
