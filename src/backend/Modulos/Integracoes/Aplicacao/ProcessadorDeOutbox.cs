using System.Text.Json;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Integracoes;
using LavaMais.Crm.Modulos.Integracoes.Dominio;
using LavaMais.Crm.Modulos.Integracoes.Infraestrutura;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace LavaMais.Crm.Modulos.Integracoes.Aplicacao;

public sealed class ProcessadorDeOutbox(ContextoDeIntegracoes banco, ClienteDoNotificationHub cliente, IProjecaoDeEnvios projecao, TimeProvider relogio)
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);
    public async Task<bool> ProcessarProxima(CancellationToken ct)
    {
        var agora = relogio.GetUtcNow(); var mensagem = await banco.Mensagens.IgnoreQueryFilters().Where(x => (x.Situacao == SituacaoDaOutbox.Pendente && x.DisponivelEm <= agora) || (x.Situacao == SituacaoDaOutbox.Processando && x.ProcessandoAte <= agora)).OrderBy(x => x.DataCriacao).FirstOrDefaultAsync(ct); if (mensagem is null) return false;
        mensagem.MarcarProcessando(agora); try { await banco.SaveChangesAsync(ct); } catch (DbUpdateConcurrencyException) { banco.ChangeTracker.Clear(); return true; }
        try
        {
            var conteudo = JsonSerializer.Deserialize<MensagemDeEnvioOutbox>(mensagem.ConteudoJson, Json)!; var notificacaoId = await cliente.Criar(conteudo.Solicitacao, ct);
            await using var tx = await banco.Database.BeginTransactionAsync(ct); mensagem.Concluir(relogio.GetUtcNow()); await banco.SaveChangesAsync(ct); await projecao.RegistrarSolicitacao(conteudo.TenantId, conteudo.DestinatarioId, notificacaoId, tx.GetDbTransaction(), ct); await tx.CommitAsync(ct);
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or InvalidOperationException)
        { mensagem.Reagendar(ex.Message, relogio.GetUtcNow()); await banco.SaveChangesAsync(ct); }
        return true;
    }

    public async Task Reconciliar(CancellationToken ct)
    { foreach (var item in await projecao.ListarPendentes(100, ct)) { try { var estado = await cliente.Obter(item.NotificacaoId, ct); await projecao.AtualizarEstado(item.TenantId, item.DestinatarioId, estado.Status, estado.FailureCode, ct); } catch (HttpRequestException) { } } }
}
