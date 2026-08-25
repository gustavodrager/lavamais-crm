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
        if (dados.Linhas is null || dados.Linhas.Count == 0) throw new ExcecaoDeRegraDeNegocio("linhas_obrigatorias", "Informe ao menos uma linha.");
        if (dados.Linhas.Select(x => x.OfertaDeServicoId).Distinct().Count() != dados.Linhas.Count) throw new ExcecaoDeRegraDeNegocio("oferta_duplicada", "Uma oferta deve aparecer apenas uma vez.");
        var linhas = new List<LinhaPreparada>();
        foreach (var linha in dados.Linhas)
        {
            var oferta = await catalogo.ObterOfertaAtiva(linha.OfertaDeServicoId, ct) ?? throw new ExcecaoDeRegraDeNegocio("oferta_indisponivel", "A oferta informada nao esta ativa ou nao pertence ao tenant.");
            linhas.Add(new(oferta.Id, oferta.ArtigoId, oferta.NomeArtigo, oferta.ServicoId, oferta.NomeServico, linha.Quantidade, oferta.PrecoUnitario, linha.PrecoUnitario ?? oferta.PrecoUnitario));
        }
        var codigo = string.IsNullOrWhiteSpace(dados.CodigoExterno) ? null : dados.CodigoExterno.Trim();
        if (codigo is not null && await banco.Movimentacoes.AnyAsync(x => x.CodigoExterno == codigo, ct)) throw new ExcecaoDeConflito("codigo_externo_duplicado", "Ja existe uma movimentacao com este codigo do Essence.");
        var agora = relogio.GetUtcNow();
        var movimentacao = MovimentacaoComercial.Registrar(usuario.TenantId, cliente.Id, cliente.Nome, linhas, dados.DataMovimentacao ?? agora, codigo, dados.Observacao, OrigemDaMovimentacao.Recepcao, usuario.UsuarioIdentidadeId, agora);
        banco.Add(movimentacao); await banco.SaveChangesAsync(ct); return movimentacao;
    }

    public Task<List<MovimentacaoComercial>> Listar(Guid? clienteId, int limite, CancellationToken ct)
    {
        IQueryable<MovimentacaoComercial> consulta = banco.Movimentacoes.AsNoTracking().Include(x => x.Linhas);
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

public sealed record DadosDaMovimentacao(Guid ClienteId, IReadOnlyCollection<DadosDaLinha> Linhas, DateTimeOffset? DataMovimentacao, string? CodigoExterno, string? Observacao);
public sealed record DadosDaLinha(Guid OfertaDeServicoId, int Quantidade, decimal? PrecoUnitario);
