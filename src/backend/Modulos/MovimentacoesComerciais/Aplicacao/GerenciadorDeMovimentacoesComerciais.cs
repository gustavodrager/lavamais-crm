using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.MovimentacoesComerciais;
using LavaMais.Crm.Modulos.MovimentacoesComerciais.Dominio;
using LavaMais.Crm.Modulos.MovimentacoesComerciais.Infraestrutura;
using Microsoft.EntityFrameworkCore;

namespace LavaMais.Crm.Modulos.MovimentacoesComerciais.Aplicacao;

public sealed class GerenciadorDeMovimentacoesComerciais(ContextoDeMovimentacoesComerciais banco, IConsultaDeClienteParaMovimentacao clientes, IConsultaDeCatalogoParaMovimentacao catalogo, IContextoDoUsuario usuario, TimeProvider relogio)
{
    public async Task<MovimentacaoComercial> Registrar(DadosDaMovimentacao dados, CancellationToken ct)
    {
        var cliente = await clientes.ObterAtivo(dados.ClienteId, ct) ?? throw new ExcecaoDeRegraDeNegocio("cliente_indisponivel", "O cliente informado nao esta ativo ou nao pertence ao tenant.");
        var servico = await catalogo.ObterServicoAtivo(dados.ItemDeCatalogoId, ct) ?? throw new ExcecaoDeRegraDeNegocio("servico_indisponivel", "O servico informado nao esta ativo ou nao pertence ao tenant.");
        var codigo = string.IsNullOrWhiteSpace(dados.CodigoExterno) ? null : dados.CodigoExterno.Trim();
        if (codigo is not null && await banco.Movimentacoes.AnyAsync(x => x.CodigoExterno == codigo, ct)) throw new ExcecaoDeConflito("codigo_externo_duplicado", "Ja existe uma movimentacao com este codigo do Essence.");
        var agora = relogio.GetUtcNow();
        var movimentacao = MovimentacaoComercial.Registrar(usuario.TenantId, cliente.Id, cliente.Nome, servico.Id, servico.Nome, dados.ValorTotal, dados.DataMovimentacao ?? agora, codigo, dados.Observacao, OrigemDaMovimentacao.Recepcao, usuario.UsuarioIdentidadeId, agora);
        banco.Add(movimentacao); await banco.SaveChangesAsync(ct); return movimentacao;
    }

    public Task<List<MovimentacaoComercial>> Listar(Guid? clienteId, int limite, CancellationToken ct)
    {
        var consulta = banco.Movimentacoes.AsNoTracking();
        if (clienteId is not null) consulta = consulta.Where(x => x.ClienteId == clienteId);
        return consulta.OrderByDescending(x => x.DataMovimentacao).Take(Math.Clamp(limite, 1, 100)).ToListAsync(ct);
    }

    public async Task Cancelar(Guid id, string motivo, uint versaoEsperada, CancellationToken ct)
    {
        var movimentacao = await banco.Movimentacoes.SingleOrDefaultAsync(x => x.Id == id, ct) ?? throw new ExcecaoDeRecursoNaoEncontrado("Movimentacao comercial nao encontrada.");
        if (movimentacao.Versao != versaoEsperada) throw new ExcecaoDeConflito("versao_desatualizada", "A movimentacao comercial foi alterada por outro usuario.");
        movimentacao.Cancelar(motivo, usuario.UsuarioIdentidadeId, relogio.GetUtcNow());
        try { await banco.SaveChangesAsync(ct); }
        catch (DbUpdateConcurrencyException) { throw new ExcecaoDeConflito("versao_desatualizada", "A movimentacao comercial foi alterada por outro usuario."); }
    }
}

public sealed record DadosDaMovimentacao(Guid ClienteId, Guid ItemDeCatalogoId, decimal ValorTotal, DateTimeOffset? DataMovimentacao, string? CodigoExterno, string? Observacao);
