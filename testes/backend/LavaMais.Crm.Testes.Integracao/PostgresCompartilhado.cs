using Testcontainers.PostgreSql;

[assembly: AssemblyFixture(typeof(LavaMais.Crm.Testes.Integracao.PostgresCompartilhado))]

namespace LavaMais.Crm.Testes.Integracao;

public sealed class PostgresCompartilhado : IAsyncLifetime
{
    private readonly PostgreSqlContainer? container;
    private readonly string? conexaoFornecida = Environment.GetEnvironmentVariable("TESTES_POSTGRES_CONNECTION_STRING");

    public PostgresCompartilhado()
    {
        if (string.IsNullOrWhiteSpace(conexaoFornecida))
            container = new PostgreSqlBuilder("postgres:17-alpine")
                .WithDatabase("lavamais_crm_testes").WithUsername("lavamais").WithPassword("senha_de_teste").Build();
    }

    public string Conexao => conexaoFornecida ?? container!.GetConnectionString();
    public ValueTask InitializeAsync() => container is null ? ValueTask.CompletedTask : new(container.StartAsync());
    public ValueTask DisposeAsync() => container?.DisposeAsync() ?? ValueTask.CompletedTask;
}
