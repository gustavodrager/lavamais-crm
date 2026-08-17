using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.Modulos.Autorizacao.Dominio;
using LavaMais.Crm.Modulos.Autorizacao.Infraestrutura;
using Microsoft.EntityFrameworkCore;

namespace LavaMais.Crm.Testes.Integracao;

public sealed class IsolamentoDeAutorizacaoTestes(PostgresCompartilhado postgres)
{
    [Fact]
    [Trait("Categoria", "RequerDocker")]
    public async Task Deve_isolar_usuarios_por_tenant()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        var tenantA = Guid.NewGuid();
        var tenantB = Guid.NewGuid();
        var opcoes = CriarOpcoes(postgres.Conexao);

        await using (var bancoTenantA = new ContextoDeAutorizacao(opcoes, new ContextoDeTeste(tenantA, "usuario-a")))
        {
            await bancoTenantA.Database.MigrateAsync(cancellationToken);
            bancoTenantA.Add(UsuarioCrm.Criar(tenantA, "mesmo-sub", PapelDoCrm.Administrador, DateTimeOffset.UtcNow));
            await bancoTenantA.SaveChangesAsync(cancellationToken);
        }

        await using (var bancoTenantB = new ContextoDeAutorizacao(opcoes, new ContextoDeTeste(tenantB, "usuario-b")))
        {
            Assert.Empty(await bancoTenantB.UsuariosCrm.AsNoTracking().ToListAsync(cancellationToken));
            bancoTenantB.Add(UsuarioCrm.Criar(tenantB, "mesmo-sub", PapelDoCrm.Operador, DateTimeOffset.UtcNow));
            await bancoTenantB.SaveChangesAsync(cancellationToken);
        }

        await using var verificacao = new ContextoDeAutorizacao(opcoes, new ContextoDeTeste(tenantA, "usuario-a"));
        var usuarioVisivel = await verificacao.UsuariosCrm.SingleAsync(cancellationToken);
        Assert.Equal(tenantA, usuarioVisivel.TenantId);
        Assert.Equal(PapelDoCrm.Administrador, usuarioVisivel.Papel);
    }

    private static DbContextOptions<ContextoDeAutorizacao> CriarOpcoes(string conexao) =>
        new DbContextOptionsBuilder<ContextoDeAutorizacao>()
            .UseNpgsql(conexao, postgres => postgres.MigrationsHistoryTable(
                ContextoDeAutorizacao.TabelaDeHistoricoDasMigrations,
                ContextoDeAutorizacao.Schema))
            .Options;

    private sealed record ContextoDeTeste(Guid TenantId, string UsuarioIdentidadeId) : IContextoDoUsuario
    {
        public bool Autenticado => true;
    }
}
