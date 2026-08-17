using Testcontainers.PostgreSql;

[assembly: AssemblyFixture(typeof(LavaMais.Crm.Testes.Integracao.PostgresCompartilhado))]

namespace LavaMais.Crm.Testes.Integracao;

public sealed class PostgresCompartilhado : IAsyncLifetime
{
    private readonly PostgreSqlContainer container = new PostgreSqlBuilder("postgres:17-alpine")
        .WithDatabase("lavamais_crm_testes").WithUsername("lavamais").WithPassword("senha_de_teste").Build();

    public string Conexao => container.GetConnectionString();
    public ValueTask InitializeAsync() => new(container.StartAsync());
    public ValueTask DisposeAsync() => container.DisposeAsync();
}
