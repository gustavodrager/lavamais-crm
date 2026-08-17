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
