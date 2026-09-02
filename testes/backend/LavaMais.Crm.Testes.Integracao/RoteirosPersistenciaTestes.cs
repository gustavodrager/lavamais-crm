using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.Modulos.Roteiros.Dominio;
using LavaMais.Crm.Modulos.Roteiros.Infraestrutura;
using Microsoft.EntityFrameworkCore;

namespace LavaMais.Crm.Testes.Integracao;

public sealed class RoteirosPersistenciaTestes(PostgresCompartilhado postgres)
{
    [Fact]
    [Trait("Categoria", "RequerDocker")]
    public async Task Deve_isolar_por_tenant_preservar_snapshots_e_detectar_concorrencia()
    {
        var ct = TestContext.Current.CancellationToken;
        var tenantA = Guid.NewGuid();
        var tenantB = Guid.NewGuid();
        var data = new DateOnly(2026, 9, 2);
        var opcoes = new DbContextOptionsBuilder<ContextoDeRoteiros>()
            .UseNpgsql(postgres.Conexao, p => p.MigrationsHistoryTable(
                ContextoDeRoteiros.Historico,
                ContextoDeRoteiros.Schema))
            .Options;

        await using (var preparacao = new ContextoDeRoteiros(opcoes, new UsuarioDeTeste(tenantA)))
        {
            await preparacao.Database.MigrateAsync(ct);
            await preparacao.Paradas.IgnoreQueryFilters().ExecuteDeleteAsync(ct);
            await preparacao.Roteiros.IgnoreQueryFilters().ExecuteDeleteAsync(ct);

            var roteiro = CriarRoteiro(tenantA, data, "Ana Martins");
            preparacao.Add(roteiro);
            await preparacao.SaveChangesAsync(ct);
        }

        await using (var outroTenant = new ContextoDeRoteiros(opcoes, new UsuarioDeTeste(tenantB)))
        {
            Assert.Empty(await outroTenant.Roteiros.AsNoTracking().ToListAsync(ct));
            outroTenant.Add(CriarRoteiro(tenantB, data, "Cliente do outro tenant"));
            await outroTenant.SaveChangesAsync(ct);
        }

        await using (var verificacao = new ContextoDeRoteiros(opcoes, new UsuarioDeTeste(tenantA)))
        {
            var roteiro = await verificacao.Roteiros.AsNoTracking().Include(x => x.Paradas).SingleAsync(ct);
            var parada = Assert.Single(roteiro.Paradas);
            Assert.Equal("Ana Martins", parada.NomeCliente);
            Assert.Equal("5513999999999", parada.Whatsapp);
            Assert.Equal("Av. Presidente Kennedy, 1240", parada.EnderecoCompleto);
        }

        await using var primeiraSessao = new ContextoDeRoteiros(opcoes, new UsuarioDeTeste(tenantA));
        await using var segundaSessao = new ContextoDeRoteiros(opcoes, new UsuarioDeTeste(tenantA));
        var primeira = await primeiraSessao.Roteiros.SingleAsync(ct);
        var segunda = await segundaSessao.Roteiros.SingleAsync(ct);
        primeira.AlterarMotorista("Carlos A", DateTimeOffset.UtcNow);
        segunda.AlterarMotorista("Carlos B", DateTimeOffset.UtcNow);

        await primeiraSessao.SaveChangesAsync(ct);
        await Assert.ThrowsAsync<DbUpdateConcurrencyException>(() => segundaSessao.SaveChangesAsync(ct));
    }

    private static RoteiroDiario CriarRoteiro(Guid tenantId, DateOnly data, string nomeCliente)
    {
        var agora = DateTimeOffset.UtcNow;
        var roteiro = RoteiroDiario.Criar(tenantId, data, "Carlos", agora);
        roteiro.Adicionar(
            Guid.NewGuid(),
            nomeCliente,
            "5513999999999",
            "Av. Presidente Kennedy, 1240",
            TipoDaParada.Entrega,
            "10h–12h",
            null,
            agora);
        return roteiro;
    }

    private sealed record UsuarioDeTeste(Guid TenantId) : IContextoDoUsuario
    {
        public bool Autenticado => true;
        public string UsuarioIdentidadeId => "usuario-de-teste";
    }
}
