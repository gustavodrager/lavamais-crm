using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Roteiros;
using LavaMais.Crm.Modulos.Roteiros.Dominio;
using LavaMais.Crm.Modulos.Roteiros.Infraestrutura;
using Microsoft.EntityFrameworkCore;

namespace LavaMais.Crm.Modulos.Roteiros.Aplicacao;
public sealed class GerenciadorDeRoteiros(ContextoDeRoteiros banco, IConsultaDeClienteParaRoteiro clientes, IContextoDoUsuario usuario, TimeProvider relogio)
{
    public Task<RoteiroDiario?> Obter(DateOnly data, CancellationToken ct) => banco.Roteiros.AsNoTracking().Include(x => x.Paradas).SingleOrDefaultAsync(x => x.Data == data, ct);
    public async Task<RoteiroDiario> Criar(DateOnly data, string motorista, CancellationToken ct) { if (await banco.Roteiros.AnyAsync(x => x.Data == data, ct)) throw new ExcecaoDeConflito("roteiro_duplicado", "Ja existe roteiro nesta data."); var x = RoteiroDiario.Criar(usuario.TenantId, data, motorista, relogio.GetUtcNow()); banco.Add(x); await banco.SaveChangesAsync(ct); return x; }
    public async Task Adicionar(Guid roteiroId, DadosDaParada dados, CancellationToken ct) { var roteiro = await Carregar(roteiroId, ct); var cliente = await clientes.ObterAtivo(dados.ClienteId, ct) ?? throw new ExcecaoDeRegraDeNegocio("cliente_indisponivel", "Cliente nao encontrado ou inativo."); roteiro.Adicionar(cliente.Id, cliente.Nome, cliente.Whatsapp, cliente.EnderecoCompleto, dados.Tipo, dados.Periodo, dados.Observacao, relogio.GetUtcNow()); await banco.SaveChangesAsync(ct); }
    public async Task Reordenar(Guid id, IReadOnlyList<Guid> paradas, CancellationToken ct) { var roteiro = await Carregar(id, ct); roteiro.Reordenar(paradas, relogio.GetUtcNow()); await banco.SaveChangesAsync(ct); }
    public async Task AtualizarParada(Guid roteiroId, Guid paradaId, DadosDaParada dados, CancellationToken ct) { var roteiro = await Carregar(roteiroId, ct); roteiro.AtualizarParada(paradaId, dados.Tipo, dados.Periodo, dados.Observacao, relogio.GetUtcNow()); await banco.SaveChangesAsync(ct); }
    public async Task RemoverParada(Guid roteiroId, Guid paradaId, CancellationToken ct) { var roteiro = await Carregar(roteiroId, ct); roteiro.RemoverParada(paradaId, relogio.GetUtcNow()); await banco.SaveChangesAsync(ct); }
    public async Task Publicar(Guid id, CancellationToken ct) { var roteiro = await Carregar(id, ct); roteiro.Publicar(relogio.GetUtcNow()); await banco.SaveChangesAsync(ct); }
    public Task IniciarParada(Guid id, CancellationToken ct) => AlterarParada(id, (p, agora) => p.Iniciar(agora), ct);
    public Task ConcluirParada(Guid id, CancellationToken ct) => AlterarParada(id, (p, agora) => p.Concluir(agora), ct);
    public Task NaoRealizarParada(Guid id, string motivo, CancellationToken ct) => AlterarParada(id, (p, agora) => p.NaoRealizar(motivo, agora), ct);
    private async Task AlterarParada(Guid paradaId, Action<ParadaDoRoteiro, DateTimeOffset> acao, CancellationToken ct) { var roteiro = await banco.Roteiros.Include(x => x.Paradas).SingleOrDefaultAsync(x => x.Paradas.Any(p => p.Id == paradaId), ct) ?? throw new ExcecaoDeRecursoNaoEncontrado("Parada nao encontrada."); var agora = relogio.GetUtcNow(); acao(roteiro.Paradas.Single(x => x.Id == paradaId), agora); roteiro.AtualizarSituacao(agora); await banco.SaveChangesAsync(ct); }
    private async Task<RoteiroDiario> Carregar(Guid id, CancellationToken ct) => await banco.Roteiros.Include(x => x.Paradas).SingleOrDefaultAsync(x => x.Id == id, ct) ?? throw new ExcecaoDeRecursoNaoEncontrado("Roteiro nao encontrado.");
}
public sealed record DadosDaParada(Guid ClienteId, TipoDaParada Tipo, string Periodo, string? Observacao);
