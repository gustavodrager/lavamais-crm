using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.Modulos.Catalogo.Aplicacao;
using LavaMais.Crm.Modulos.Catalogo.Infraestrutura;
using Microsoft.EntityFrameworkCore;

namespace LavaMais.Crm.Testes.Integracao;

public sealed class CatalogoDeLavanderiaTestes(PostgresCompartilhado postgres)
{
    [Fact]
    [Trait("Categoria", "RequerDocker")]
    public async Task Deve_carregar_catalogo_amplo_sem_duplicar_e_isolar_por_tenant()
    {
        var ct = TestContext.Current.CancellationToken;
        var tenant = Guid.NewGuid();
        var opcoes = new DbContextOptionsBuilder<ContextoDeCatalogo>()
            .UseNpgsql(postgres.Conexao, postgres => postgres.MigrationsHistoryTable(ContextoDeCatalogo.Historico, ContextoDeCatalogo.Schema))
            .Options;

        await using (var banco = new ContextoDeCatalogo(opcoes, new UsuarioDeTeste(tenant)))
        {
            await banco.Database.MigrateAsync(ct);
            var gerenciador = new GerenciadorDoCatalogoDeLavanderia(banco, new UsuarioDeTeste(tenant), TimeProvider.System);

            var primeiraCarga = await gerenciador.CarregarCatalogoInicial(ct);
            var segundaCarga = await gerenciador.CarregarCatalogoInicial(ct);

            Assert.True(primeiraCarga.ArtigosCriados >= 50);
            Assert.Equal(12, primeiraCarga.ServicosCriados);
            Assert.True(primeiraCarga.OfertasCriadas >= 150);
            Assert.Equal(new ResultadoDaCargaInicial(0, 0, 0), segundaCarga);
            Assert.Contains(await gerenciador.ListarServicos(ct), x => x.Nome == "Lavagem e passadoria");
            Assert.All(await gerenciador.ListarOfertas(ct), x => Assert.True(x.PrecoUnitario >= 0));
        }

        await using var outroTenant = new ContextoDeCatalogo(opcoes, new UsuarioDeTeste(Guid.NewGuid()));
        Assert.Empty(await outroTenant.ArtigosDeLavanderia.AsNoTracking().ToListAsync(ct));
        Assert.Empty(await outroTenant.OfertasDeServico.AsNoTracking().ToListAsync(ct));
    }

    private sealed record UsuarioDeTeste(Guid TenantId) : IContextoDoUsuario
    {
        public bool Autenticado => true;
        public string UsuarioIdentidadeId => "usuario-de-teste";
    }
}
