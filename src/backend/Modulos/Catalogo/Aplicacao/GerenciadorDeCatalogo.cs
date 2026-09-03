using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Auditoria;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.MovimentacoesComerciais;
using LavaMais.Crm.Modulos.Catalogo.Dominio;
using LavaMais.Crm.Modulos.Catalogo.Infraestrutura;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using System.Data.Common;
using System.Text.Json;

namespace LavaMais.Crm.Modulos.Catalogo.Aplicacao;

public sealed class GerenciadorDeCatalogo(ContextoDeCatalogo banco, IContextoDoUsuario usuario, TimeProvider relogio, IRegistradorDeAuditoria auditoria)
{
    private static readonly JsonSerializerOptions OpcoesJson = new(JsonSerializerDefaults.Web);
    public Task<List<ItemDeCatalogo>> Listar(SituacaoDoItemDeCatalogo? situacao, CancellationToken ct)
    {
        var consulta = banco.Itens.AsNoTracking();
        if (situacao is not null) consulta = consulta.Where(x => x.Situacao == situacao);
        return consulta.OrderBy(x => x.Nome).ToListAsync(ct);
    }

    public async Task<ItemDeCatalogo> Criar(DadosDoItemDeCatalogo dados, CancellationToken ct)
    {
        var item = ItemDeCatalogo.Criar(usuario.TenantId, dados.Tipo, dados.Nome, dados.Descricao, dados.Categoria, dados.ValorReferencia, relogio.GetUtcNow());
        AplicarDadosDeOrigem(item, dados);
        item.AlterarSituacao(dados.Situacao, relogio.GetUtcNow());
        await ValidarNome(item.NomeNormalizado, null, ct);
        await ValidarCodigoExterno(item.CodigoExterno, null, ct);
        banco.Add(item);
        await SalvarComAuditoria("ItemDeCatalogoCriado", item.Id, new { item.Tipo, item.Situacao, origem = item.CodigoExterno is null ? "CadastroManual" : "Importacao" }, ct);
        return item;
    }

    public async Task Atualizar(Guid id, DadosDoItemDeCatalogo dados, CancellationToken ct)
    {
        var item = await banco.Itens.SingleOrDefaultAsync(x => x.Id == id, ct) ?? throw new ExcecaoDeRecursoNaoEncontrado("Item de catalogo nao encontrado.");
        item.Atualizar(dados.Tipo, dados.Nome, dados.Descricao, dados.Categoria, dados.ValorReferencia, relogio.GetUtcNow());
        AplicarDadosDeOrigem(item, dados);
        item.AlterarSituacao(dados.Situacao, relogio.GetUtcNow());
        await ValidarNome(item.NomeNormalizado, id, ct); await ValidarCodigoExterno(item.CodigoExterno, id, ct);
        await SalvarComAuditoria("ItemDeCatalogoAtualizado", item.Id, new { item.Tipo, item.Situacao }, ct);
    }

    public async Task<ResultadoDaImportacaoDeItem> ImportarOuAtualizar(DadosDoItemDeCatalogo dados, CancellationToken ct)
    {
        var codigo = string.IsNullOrWhiteSpace(dados.CodigoExterno) ? null : dados.CodigoExterno.Trim();
        var nome = dados.Nome.Trim().ToUpperInvariant();
        var candidatos = await banco.Itens.Where(x => (codigo != null && x.CodigoExterno == codigo) || x.NomeNormalizado == nome).Take(2).ToListAsync(ct);
        if (candidatos.Count > 1) throw new ExcecaoDeConflito("dados_origem_ambiguos", "O codigo externo e o nome identificam itens de catalogo diferentes.");
        var item = candidatos.SingleOrDefault();
        if (item is null) return new(await Criar(dados, ct), false);
        item.Atualizar(dados.Tipo, dados.Nome, dados.Descricao, dados.Categoria, dados.ValorReferencia, relogio.GetUtcNow());
        item.AlterarSituacao(dados.Situacao, relogio.GetUtcNow()); AplicarDadosDeOrigem(item, dados);
        await ValidarCodigoExterno(item.CodigoExterno, item.Id, ct);
        await SalvarComAuditoria("ItemDeCatalogoAtualizadoPorImportacao", item.Id, new { item.Tipo, item.Situacao, origem = "Importacao" }, ct);
        return new(item, true);
    }

    public void DescartarAlteracoesPendentes() => banco.ChangeTracker.Clear();

    private async Task SalvarComAuditoria(string tipo, Guid recursoId, object dados, CancellationToken ct)
    {
        await using var transacao = await banco.Database.BeginTransactionAsync(ct);
        await banco.SaveChangesAsync(ct);
        await auditoria.Registrar(new(tipo, "ItemDeCatalogo", recursoId, JsonSerializer.Serialize(dados, OpcoesJson), relogio.GetUtcNow()), transacao.GetDbTransaction(), ct);
        await transacao.CommitAsync(ct);
    }

    private void AplicarDadosDeOrigem(ItemDeCatalogo item, DadosDoItemDeCatalogo dados)
    {
        if (dados.CodigoExterno is not null || dados.DataCadastroOrigem is not null)
            item.DefinirDadosDeOrigem(dados.CodigoExterno, dados.DataCadastroOrigem, relogio.GetUtcNow());
    }

    private async Task ValidarNome(string nome, Guid? ignorarId, CancellationToken ct)
    {
        if (await banco.Itens.AnyAsync(x => x.NomeNormalizado == nome && x.Id != ignorarId, ct))
            throw new ExcecaoDeConflito("item_duplicado", "Ja existe um item de catalogo com este nome.");
    }
    private async Task ValidarCodigoExterno(string? codigo, Guid? ignorarId, CancellationToken ct)
    {
        if (codigo is not null && await banco.Itens.AnyAsync(x => x.CodigoExterno == codigo && x.Id != ignorarId, ct))
            throw new ExcecaoDeConflito("codigo_externo_duplicado", "Ja existe um item de catalogo com este codigo externo.");
    }
}

public sealed record DadosDoItemDeCatalogo(TipoDeItemDeCatalogo Tipo, string Nome, string? Descricao, string? Categoria, decimal? ValorReferencia, SituacaoDoItemDeCatalogo Situacao = SituacaoDoItemDeCatalogo.Ativo, string? CodigoExterno = null, DateTimeOffset? DataCadastroOrigem = null);
public sealed record ResultadoDaImportacaoDeItem(ItemDeCatalogo Item, bool Atualizado);

public sealed class ConsultaDeCatalogo(ContextoDeCatalogo banco) : IConsultaDeCatalogoParaMovimentacao
{
    public async Task<ItemDeCatalogoDisponivel?> ObterAtivo(Guid id, CancellationToken ct, DbTransaction? transacao = null)
    {
        if (transacao is not null) { banco.Database.SetDbConnection(transacao.Connection!, false); await banco.Database.UseTransactionAsync(transacao, ct); }
        return await banco.Itens.AsNoTracking().Where(x => x.Id == id && x.Situacao == SituacaoDoItemDeCatalogo.Ativo).Select(x => new ItemDeCatalogoDisponivel(x.Id, x.Nome)).SingleOrDefaultAsync(ct);
    }

    public async Task<OfertaDisponivelParaMovimentacao?> ObterOfertaAtiva(Guid id, CancellationToken ct) =>
        await banco.OfertasDeServico.AsNoTracking()
            .Where(x => x.Id == id && x.Situacao == SituacaoDoCatalogoDeLavanderia.Ativo
                && x.Artigo.Situacao == SituacaoDoCatalogoDeLavanderia.Ativo
                && x.Servico.Situacao == SituacaoDoCatalogoDeLavanderia.Ativo)
            .Select(x => new OfertaDisponivelParaMovimentacao(x.Id, x.ArtigoDeLavanderiaId, x.Artigo.Nome, x.ServicoDeLavanderiaId, x.Servico.Nome, x.PrecoUnitario))
            .SingleOrDefaultAsync(ct);

    public async Task<OfertaDisponivelParaMovimentacao?> ObterOfertaParaImportacao(Guid id, CancellationToken ct) =>
        await banco.OfertasDeServico.AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new OfertaDisponivelParaMovimentacao(x.Id, x.ArtigoDeLavanderiaId, x.Artigo.Nome, x.ServicoDeLavanderiaId, x.Servico.Nome, x.PrecoUnitario))
            .SingleOrDefaultAsync(ct);
}

public sealed record ItemDeCatalogoDisponivel(Guid Id, string Nome);
