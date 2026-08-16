using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.Modulos.Catalogo.Dominio;
using LavaMais.Crm.Modulos.Catalogo.Infraestrutura;
using Microsoft.EntityFrameworkCore;

namespace LavaMais.Crm.Modulos.Catalogo.Aplicacao;

public sealed class GerenciadorDeCatalogo(ContextoDeCatalogo banco, IContextoDoUsuario usuario, TimeProvider relogio)
{
    public Task<List<ItemDeCatalogo>> Listar(SituacaoDoItemDeCatalogo? situacao, CancellationToken ct)
    {
        var consulta = banco.Itens.AsNoTracking();
        if (situacao is not null) consulta = consulta.Where(x => x.Situacao == situacao);
        return consulta.OrderBy(x => x.Nome).ToListAsync(ct);
    }

    public async Task<ItemDeCatalogo> Criar(DadosDoItemDeCatalogo dados, CancellationToken ct)
    {
        var item = ItemDeCatalogo.Criar(usuario.TenantId, dados.Tipo, dados.Nome, dados.Descricao, dados.Categoria, dados.ValorReferencia, relogio.GetUtcNow());
        await ValidarNome(item.NomeNormalizado, null, ct);
        banco.Add(item); await banco.SaveChangesAsync(ct); return item;
    }

    public async Task Atualizar(Guid id, DadosDoItemDeCatalogo dados, CancellationToken ct)
    {
        var item = await banco.Itens.SingleOrDefaultAsync(x => x.Id == id, ct) ?? throw new ExcecaoDeRecursoNaoEncontrado("Item de catalogo nao encontrado.");
        item.Atualizar(dados.Tipo, dados.Nome, dados.Descricao, dados.Categoria, dados.ValorReferencia, relogio.GetUtcNow());
        item.AlterarSituacao(dados.Situacao, relogio.GetUtcNow());
        await ValidarNome(item.NomeNormalizado, id, ct); await banco.SaveChangesAsync(ct);
    }

    private async Task ValidarNome(string nome, Guid? ignorarId, CancellationToken ct)
    {
        if (await banco.Itens.AnyAsync(x => x.NomeNormalizado == nome && x.Id != ignorarId, ct))
            throw new ExcecaoDeConflito("item_duplicado", "Ja existe um item de catalogo com este nome.");
    }
}

public sealed record DadosDoItemDeCatalogo(TipoDeItemDeCatalogo Tipo, string Nome, string? Descricao, string? Categoria, decimal? ValorReferencia, SituacaoDoItemDeCatalogo Situacao = SituacaoDoItemDeCatalogo.Ativo);
