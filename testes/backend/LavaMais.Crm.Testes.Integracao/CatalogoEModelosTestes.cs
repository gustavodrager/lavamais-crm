using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.Modulos.Catalogo.Aplicacao;
using LavaMais.Crm.Modulos.Catalogo.Dominio;
using LavaMais.Crm.Modulos.Catalogo.Infraestrutura;
using LavaMais.Crm.Modulos.ModelosDeMensagem.Aplicacao;
using LavaMais.Crm.Modulos.ModelosDeMensagem.Infraestrutura;
using Microsoft.EntityFrameworkCore;

namespace LavaMais.Crm.Testes.Integracao;

public sealed class CatalogoEModelosTestes(PostgresCompartilhado postgres)
{
    [Fact]
    [Trait("Categoria", "RequerDocker")]
    public async Task Deve_isolar_catalogo_por_tenant_e_permitir_nome_repetido_entre_tenants()
    {
        var ct = TestContext.Current.CancellationToken;
        var tenantA = new Contexto(Guid.NewGuid()); var tenantB = new Contexto(Guid.NewGuid());
        var opcoes = OpcoesCatalogo(postgres.Conexao);
        await using var bancoA = new ContextoDeCatalogo(opcoes, tenantA); await bancoA.Database.MigrateAsync(ct);
        await using var bancoB = new ContextoDeCatalogo(opcoes, tenantB);
        var dados = new DadosDoItemDeCatalogo(TipoDeItemDeCatalogo.Servico, "Lavagem de edredom", "Lavagem especializada", "Edredons", 80m);

        await new GerenciadorDeCatalogo(bancoA, tenantA, TimeProvider.System).Criar(dados, ct);
        await new GerenciadorDeCatalogo(bancoB, tenantB, TimeProvider.System).Criar(dados, ct);

        Assert.Single(await bancoA.Itens.AsNoTracking().ToListAsync(ct));
        Assert.Single(await bancoB.Itens.AsNoTracking().ToListAsync(ct));
        await Assert.ThrowsAsync<ExcecaoDeConflito>(() => new GerenciadorDeCatalogo(bancoA, tenantA, TimeProvider.System).Criar(dados, ct));
    }

    [Fact]
    [Trait("Categoria", "RequerDocker")]
    public async Task Deve_respeitar_situacao_inativa_ao_criar_item_de_referencia()
    {
        var ct = TestContext.Current.CancellationToken;
        var contexto = new Contexto(Guid.NewGuid());
        await using var banco = new ContextoDeCatalogo(OpcoesCatalogo(postgres.Conexao), contexto); await banco.Database.MigrateAsync(ct);
        var gerenciador = new GerenciadorDeCatalogo(banco, contexto, TimeProvider.System);

        var item = await gerenciador.Criar(new(
            TipoDeItemDeCatalogo.Produto,
            "Essence - item historico",
            null,
            "Referencia historica Essence",
            null,
            SituacaoDoItemDeCatalogo.Inativo,
            "ESSENCE-TESTE"), ct);

        Assert.Equal(SituacaoDoItemDeCatalogo.Inativo, item.Situacao);
        Assert.Equal(SituacaoDoItemDeCatalogo.Inativo, (await banco.Itens.AsNoTracking().SingleAsync(ct)).Situacao);
    }

    [Fact]
    [Trait("Categoria", "RequerDocker")]
    public async Task Deve_criar_ofertas_sinteticas_inativas_de_forma_idempotente()
    {
        var ct = TestContext.Current.CancellationToken;
        var contexto = new Contexto(Guid.NewGuid());
        await using var banco = new ContextoDeCatalogo(OpcoesCatalogo(postgres.Conexao), contexto); await banco.Database.MigrateAsync(ct);
        var gerenciador = new GerenciadorDoCatalogoDeLavanderia(banco, contexto, TimeProvider.System);
        DefinicaoDeProdutoSinteticoDoEssence[] definicoes =
        [
            new("CAMISA", "Camisa", 12.50m),
            new("CALCA", "Calca", 15m)
        ];

        var primeira = await gerenciador.ObterOuCriarOfertasSinteticasDoEssence(definicoes, ct);
        var segunda = await gerenciador.ObterOuCriarOfertasSinteticasDoEssence(definicoes, ct);
        var prefixoLongo = new string('X', 160);
        var colisao = await Assert.ThrowsAsync<ArgumentException>(() => gerenciador.ObterOuCriarOfertasSinteticasDoEssence(
            [new("LONGO-A", $"{prefixoLongo}A", 1m), new("LONGO-B", $"{prefixoLongo}B", 1m)],
            ct));

        Assert.Equal(primeira["CAMISA"].OfertaId, segunda["CAMISA"].OfertaId);
        Assert.Contains("apos a normalizacao", colisao.Message);
        Assert.Equal(2, await banco.ArtigosDeLavanderia.CountAsync(x => x.Categoria == "Composicao sintetica HML", ct));
        Assert.Equal(2, await banco.OfertasDeServico.CountAsync(x => x.ServicoDeLavanderiaId == primeira["CAMISA"].ServicoId, ct));
        Assert.All(await banco.ArtigosDeLavanderia.Where(x => x.Categoria == "Composicao sintetica HML").ToListAsync(ct),
            artigo => Assert.Equal(SituacaoDoCatalogoDeLavanderia.Inativo, artigo.Situacao));
        Assert.Empty(await gerenciador.ListarOfertas(ct));
    }

    [Fact]
    [Trait("Categoria", "RequerDocker")]
    public async Task Deve_publicar_versoes_imutaveis_com_template_tecnico()
    {
        var ct = TestContext.Current.CancellationToken;
        var contexto = new Contexto(Guid.NewGuid()); var opcoes = OpcoesModelos(postgres.Conexao);
        await using var banco = new ContextoDeModelos(opcoes, contexto); await banco.Database.MigrateAsync(ct);
        var gerenciador = new GerenciadorDeModelos(banco, contexto, TimeProvider.System);
        var modelo = await gerenciador.Criar("Oferta de servico", ct);

        var primeira = await gerenciador.Publicar(modelo.Id, new("Ola {{nomeCliente}}, conheca {{itemCatalogo}}.", ["nomeCliente", "itemCatalogo"], "crm_oferta_v1"), ct);
        var segunda = await gerenciador.Publicar(modelo.Id, new("Ola {{nomeCliente}}, temos uma novidade.", ["nomeCliente"], "crm_oferta_v2"), ct);
        var persistido = await banco.Modelos.AsNoTracking().Include(x => x.Versoes).SingleAsync(ct);

        Assert.Equal(1, primeira.Numero); Assert.Equal(2, segunda.Numero);
        Assert.Equal("crm_oferta_v1", persistido.Versoes.Single(x => x.Numero == 1).ChaveTemplateNotificacao);
        Assert.Equal(segunda.Id, persistido.VersaoAtualId);
    }

    [Fact]
    public void Deve_rejeitar_variavel_nao_controlada()
    {
        var modelo = LavaMais.Crm.Modulos.ModelosDeMensagem.Dominio.ModeloDeMensagem.Criar(Guid.NewGuid(), "Modelo", TimeProvider.System.GetUtcNow());
        Assert.Throws<ExcecaoDeRegraDeNegocio>(() => modelo.Publicar("Conteudo", ["linkLivre"], "template", TimeProvider.System.GetUtcNow()));
    }

    private static DbContextOptions<ContextoDeCatalogo> OpcoesCatalogo(string conexao) => new DbContextOptionsBuilder<ContextoDeCatalogo>().UseNpgsql(conexao, p => p.MigrationsHistoryTable(ContextoDeCatalogo.Historico, ContextoDeCatalogo.Schema)).Options;
    private static DbContextOptions<ContextoDeModelos> OpcoesModelos(string conexao) => new DbContextOptionsBuilder<ContextoDeModelos>().UseNpgsql(conexao, p => p.MigrationsHistoryTable(ContextoDeModelos.Historico, ContextoDeModelos.Schema)).Options;
    private sealed class Contexto(Guid tenantId) : IContextoDoUsuario { public bool Autenticado => true; public Guid TenantId { get; } = tenantId; public string UsuarioIdentidadeId => "gerente-teste"; }
}
