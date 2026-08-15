using Npgsql;
using Testcontainers.PostgreSql;

namespace LavaMais.Crm.Testes.Integracao;

public sealed class PostgresTestes
{
    [Fact]
    [Trait("Categoria", "RequerDocker")]
    public async Task Deve_conectar_ao_postgres_real()
    {
        await using var postgres = new PostgreSqlBuilder("postgres:17-alpine")
            .WithDatabase("lavamais_crm_testes")
            .WithUsername("lavamais")
            .WithPassword("senha_de_teste")
            .Build();

        var cancellationToken = TestContext.Current.CancellationToken;
        await postgres.StartAsync(cancellationToken);
        await using var conexao = new NpgsqlConnection(postgres.GetConnectionString());
        await conexao.OpenAsync(cancellationToken);
        await using var comando = new NpgsqlCommand("SELECT 1", conexao);

        var resultado = await comando.ExecuteScalarAsync(cancellationToken);

        Assert.Equal(1, resultado);
    }
}
