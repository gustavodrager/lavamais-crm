using System.Data;
using System.Text.Json;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Auditoria;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Roteiros;
using LavaMais.Crm.Modulos.Roteiros.Dominio;
using LavaMais.Crm.Modulos.Roteiros.Infraestrutura;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace LavaMais.Crm.Modulos.Roteiros.Aplicacao;

public sealed class GerenciadorDeRoteiros(
    ContextoDeRoteiros banco,
    IConsultaDeClienteParaRoteiro clientes,
    IContextoDoUsuario usuario,
    IRegistradorDeAuditoria auditoria,
    TimeProvider relogio)
{
    private static readonly JsonSerializerOptions OpcoesJson = new(JsonSerializerDefaults.Web);

    public Task<RoteiroDiario?> Obter(DateOnly data, CancellationToken ct) =>
        banco.Roteiros.AsNoTracking().Include(x => x.Paradas).SingleOrDefaultAsync(x => x.Data == data, ct);

    public async Task<RoteiroDiario> Criar(DateOnly data, string motorista, CancellationToken ct)
    {
        await using var transacao = await banco.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted, ct);
        if (await banco.Roteiros.AnyAsync(x => x.Data == data, ct)) throw new ExcecaoDeConflito("roteiro_duplicado", "Ja existe roteiro nesta data.");
        var agora = relogio.GetUtcNow();
        var roteiro = RoteiroDiario.Criar(usuario.TenantId, data, motorista, agora);
        banco.Add(roteiro);
        await banco.SaveChangesAsync(ct);
        await RegistrarAuditoria("RoteiroCriado", "RoteiroDiario", roteiro.Id, new { data, motorista }, transacao, agora, ct);
        await transacao.CommitAsync(ct);
        return roteiro;
    }

    public async Task AtualizarMotorista(Guid roteiroId, string motorista, uint versaoEsperada, CancellationToken ct)
    {
        await using var transacao = await banco.Database.BeginTransactionAsync(ct);
        var roteiro = await Carregar(roteiroId, ct); ValidarVersao(roteiro, versaoEsperada);
        var agora = relogio.GetUtcNow(); roteiro.AlterarMotorista(motorista, agora); await SalvarComConcorrencia(ct);
        await RegistrarAuditoria("RoteiroMotoristaAlterado", "RoteiroDiario", roteiro.Id, new { motorista }, transacao, agora, ct); await transacao.CommitAsync(ct);
    }

    public async Task Excluir(Guid roteiroId, uint versaoEsperada, CancellationToken ct)
    {
        await using var transacao = await banco.Database.BeginTransactionAsync(ct);
        var roteiro = await Carregar(roteiroId, ct); ValidarVersao(roteiro, versaoEsperada);
        if (roteiro.Situacao != SituacaoDoRoteiro.EmPreparacao || roteiro.Paradas.Any(x => x.Situacao != SituacaoDaParada.Pendente)) throw new ExcecaoDeConflito("roteiro_em_uso", "Somente um roteiro vazio ou em preparacao pode ser excluido.");
        banco.Remove(roteiro); await SalvarComConcorrencia(ct);
        await RegistrarAuditoria("RoteiroExcluido", "RoteiroDiario", roteiro.Id, new { roteiro.Data }, transacao, relogio.GetUtcNow(), ct); await transacao.CommitAsync(ct);
    }

    public async Task Adicionar(Guid roteiroId, DadosDaParada dados, uint versaoEsperada, CancellationToken ct)
    {
        await using var transacao = await banco.Database.BeginTransactionAsync(ct);
        var roteiro = await Carregar(roteiroId, ct);
        ValidarVersao(roteiro, versaoEsperada);
        var cliente = await clientes.ObterAtivo(dados.ClienteId, ct) ?? throw new ExcecaoDeRegraDeNegocio("cliente_indisponivel", "Cliente nao encontrado ou sem endereco operacional.");
        var agora = relogio.GetUtcNow();
        var parada = roteiro.Adicionar(cliente.Id, cliente.Nome, cliente.Whatsapp, cliente.EnderecoCompleto, dados.Tipo, dados.Periodo, dados.Observacao, agora);
        await SalvarComConcorrencia(ct);
        await RegistrarAuditoria("ParadaAdicionada", "ParadaDoRoteiro", parada.Id, new { roteiroId, parada.Tipo }, transacao, agora, ct);
        await transacao.CommitAsync(ct);
    }

    public async Task Reordenar(Guid id, IReadOnlyList<Guid> paradas, uint versaoEsperada, CancellationToken ct)
    {
        await using var transacao = await banco.Database.BeginTransactionAsync(ct);
        var roteiro = await Carregar(id, ct);
        ValidarVersao(roteiro, versaoEsperada);
        var agora = relogio.GetUtcNow();
        roteiro.Reordenar(paradas, agora);
        await SalvarComConcorrencia(ct);
        await RegistrarAuditoria("RoteiroReordenado", "RoteiroDiario", roteiro.Id, new { quantidade = paradas.Count }, transacao, agora, ct);
        await transacao.CommitAsync(ct);
    }

    public async Task AtualizarParada(Guid roteiroId, Guid paradaId, DadosDaParada dados, uint versaoEsperada, CancellationToken ct)
    {
        await using var transacao = await banco.Database.BeginTransactionAsync(ct);
        var roteiro = await Carregar(roteiroId, ct);
        ValidarVersao(roteiro, versaoEsperada);
        var agora = relogio.GetUtcNow();
        roteiro.AtualizarParada(paradaId, dados.Tipo, dados.Periodo, dados.Observacao, agora);
        await SalvarComConcorrencia(ct);
        await RegistrarAuditoria("ParadaAtualizada", "ParadaDoRoteiro", paradaId, new { roteiroId }, transacao, agora, ct);
        await transacao.CommitAsync(ct);
    }

    public async Task RemoverParada(Guid roteiroId, Guid paradaId, uint versaoEsperada, CancellationToken ct)
    {
        await using var transacao = await banco.Database.BeginTransactionAsync(ct);
        var roteiro = await Carregar(roteiroId, ct);
        ValidarVersao(roteiro, versaoEsperada);
        roteiro.RemoverParada(paradaId, relogio.GetUtcNow());
        await SalvarComConcorrencia(ct);
        await RegistrarAuditoria("ParadaRemovida", "ParadaDoRoteiro", paradaId, new { roteiroId }, transacao, relogio.GetUtcNow(), ct);
        await transacao.CommitAsync(ct);
    }

    public async Task Publicar(Guid id, uint versaoEsperada, CancellationToken ct)
    {
        await using var transacao = await banco.Database.BeginTransactionAsync(ct);
        var roteiro = await Carregar(id, ct);
        ValidarVersao(roteiro, versaoEsperada);
        var agora = relogio.GetUtcNow();
        roteiro.Publicar(agora);
        await SalvarComConcorrencia(ct);
        await RegistrarAuditoria("RoteiroPublicado", "RoteiroDiario", roteiro.Id, new { quantidade = roteiro.Paradas.Count }, transacao, agora, ct);
        await transacao.CommitAsync(ct);
    }

    public Task IniciarParada(Guid id, uint versaoEsperada, CancellationToken ct) => AlterarParada(id, versaoEsperada, "ParadaIniciada", (p, agora) => p.Iniciar(agora), ct);
    public Task ConcluirParada(Guid id, uint versaoEsperada, CancellationToken ct) => AlterarParada(id, versaoEsperada, "ParadaConcluida", (p, agora) => p.Concluir(agora), ct);
    public Task NaoRealizarParada(Guid id, string motivo, uint versaoEsperada, CancellationToken ct) => AlterarParada(id, versaoEsperada, "ParadaNaoRealizada", (p, agora) => p.NaoRealizar(motivo, agora), ct);

    public async Task AdiarParada(Guid id, uint versaoEsperada, CancellationToken ct)
    {
        await using var transacao = await banco.Database.BeginTransactionAsync(ct);
        var roteiro = await CarregarPorParada(id, ct);
        ValidarVersao(roteiro, versaoEsperada);
        var agora = relogio.GetUtcNow();
        roteiro.Adiar(id, agora);
        await SalvarComConcorrencia(ct);
        await RegistrarAuditoria("ParadaAdiada", "ParadaDoRoteiro", id, new { roteiroId = roteiro.Id }, transacao, agora, ct);
        await transacao.CommitAsync(ct);
    }

    private async Task AlterarParada(Guid paradaId, uint versaoEsperada, string evento, Action<ParadaDoRoteiro, DateTimeOffset> acao, CancellationToken ct)
    {
        await using var transacao = await banco.Database.BeginTransactionAsync(ct);
        var roteiro = await CarregarPorParada(paradaId, ct);
        ValidarVersao(roteiro, versaoEsperada);
        if (roteiro.Situacao == SituacaoDoRoteiro.EmPreparacao) throw new ExcecaoDeConflito("roteiro_nao_publicado", "Publique o roteiro antes de executar uma parada.");
        var agora = relogio.GetUtcNow();
        acao(roteiro.Paradas.Single(x => x.Id == paradaId), agora);
        roteiro.AtualizarSituacao(agora);
        await SalvarComConcorrencia(ct);
        await RegistrarAuditoria(evento, "ParadaDoRoteiro", paradaId, new { roteiroId = roteiro.Id }, transacao, agora, ct);
        await transacao.CommitAsync(ct);
    }

    private async Task<RoteiroDiario> Carregar(Guid id, CancellationToken ct)
    {
        var roteiro = await banco.Roteiros.Include(x => x.Paradas).SingleOrDefaultAsync(x => x.Id == id, ct) ?? throw new ExcecaoDeRecursoNaoEncontrado("Roteiro nao encontrado.");
        roteiro.OrdenarParadasPorOrdem();
        return roteiro;
    }

    private async Task<RoteiroDiario> CarregarPorParada(Guid paradaId, CancellationToken ct)
    {
        var roteiro = await banco.Roteiros.Include(x => x.Paradas).SingleOrDefaultAsync(x => x.Paradas.Any(p => p.Id == paradaId), ct) ?? throw new ExcecaoDeRecursoNaoEncontrado("Parada nao encontrada.");
        roteiro.OrdenarParadasPorOrdem();
        return roteiro;
    }

    private static void ValidarVersao(RoteiroDiario roteiro, uint versaoEsperada)
    {
        if (roteiro.Versao != versaoEsperada) throw new ExcecaoDeConflito("versao_desatualizada", "O roteiro foi alterado por outro usuario. Atualize a tela.");
    }

    private async Task SalvarComConcorrencia(CancellationToken ct)
    {
        try { await banco.SaveChangesAsync(ct); }
        catch (DbUpdateConcurrencyException) { throw new ExcecaoDeConflito("versao_desatualizada", "O roteiro foi alterado por outro usuario. Atualize a tela."); }
    }

    private Task RegistrarAuditoria(string tipo, string recurso, Guid recursoId, object dados, Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction transacao, DateTimeOffset agora, CancellationToken ct) =>
        auditoria.Registrar(new(tipo, recurso, recursoId, JsonSerializer.Serialize(dados, OpcoesJson), agora), transacao.GetDbTransaction(), ct);
}

public sealed record DadosDaParada(Guid ClienteId, TipoDaParada Tipo, string Periodo, string? Observacao);
