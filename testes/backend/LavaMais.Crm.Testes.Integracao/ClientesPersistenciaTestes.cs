using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.Modulos.Clientes.Dominio;
using LavaMais.Crm.Modulos.Clientes.Infraestrutura;
using Microsoft.EntityFrameworkCore;
using Testcontainers.PostgreSql;

namespace LavaMais.Crm.Testes.Integracao;

public sealed class ClientesPersistenciaTestes
{
    [Fact]
    [Trait("Categoria", "RequerDocker")]
    public async Task Deve_isolar_clientes_e_permitir_mesmo_whatsapp_em_tenants_diferentes()
    {
        var ct = TestContext.Current.CancellationToken;
        await using var postgres = new PostgreSqlBuilder("postgres:17-alpine").WithDatabase("clientes_testes").WithUsername("lavamais").WithPassword("senha_de_teste").Build();
        await postgres.StartAsync(ct);
        var opcoes = CriarOpcoes(postgres.GetConnectionString());
        var tenantA = Guid.NewGuid(); var tenantB = Guid.NewGuid();

        await using (var banco = new ContextoDeClientes(opcoes, new Contexto(tenantA)))
        {
            await banco.Database.MigrateAsync(ct);
            banco.Add(CriarCliente(tenantA, "Cliente A")); await banco.SaveChangesAsync(ct);
        }
        await using (var banco = new ContextoDeClientes(opcoes, new Contexto(tenantB)))
        {
            Assert.Empty(await banco.Clientes.ToListAsync(ct));
            banco.Add(CriarCliente(tenantB, "Cliente B")); await banco.SaveChangesAsync(ct);
        }
        await using var verificacao = new ContextoDeClientes(opcoes, new Contexto(tenantA));
        Assert.Equal("Cliente A", (await verificacao.Clientes.SingleAsync(ct)).Nome);
    }

    [Fact]
    [Trait("Categoria", "RequerDocker")]
    public async Task Deve_liberar_whatsapp_apos_inativacao()
    {
        var ct = TestContext.Current.CancellationToken;
        await using var postgres = new PostgreSqlBuilder("postgres:17-alpine").WithDatabase("clientes_inativacao").WithUsername("lavamais").WithPassword("senha_de_teste").Build();
        await postgres.StartAsync(ct);
        var tenant = Guid.NewGuid(); var opcoes = CriarOpcoes(postgres.GetConnectionString());
        await using var banco = new ContextoDeClientes(opcoes, new Contexto(tenant)); await banco.Database.MigrateAsync(ct);
        var anterior = CriarCliente(tenant, "Anterior"); banco.Add(anterior); await banco.SaveChangesAsync(ct);
        anterior.Inativar(DateTimeOffset.UtcNow); await banco.SaveChangesAsync(ct);
        banco.Add(CriarCliente(tenant, "Novo")); await banco.SaveChangesAsync(ct);
        Assert.Equal(2, await banco.Clientes.CountAsync(ct));
    }

    private static Cliente CriarCliente(Guid tenant, string nome)
    {
        var agora = DateTimeOffset.UtcNow; var cliente = Cliente.Criar(tenant, nome, "(13) 99777-6655", agora);
        cliente.Atualizar(nome, "(13) 99777-6655", null, null, null, null, true, null, [], agora); return cliente;
    }
    private static DbContextOptions<ContextoDeClientes> CriarOpcoes(string conexao) => new DbContextOptionsBuilder<ContextoDeClientes>().UseNpgsql(conexao, p => p.MigrationsHistoryTable(ContextoDeClientes.TabelaDeHistoricoDasMigrations, ContextoDeClientes.Schema)).Options;
    private sealed class Contexto(Guid tenantId) : IContextoDoUsuario { public bool Autenticado => true; public Guid TenantId { get; } = tenantId; public string UsuarioIdentidadeId => "teste"; }
}
