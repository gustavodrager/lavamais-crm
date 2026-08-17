using Npgsql;

namespace LavaMais.Crm.Testes.Integracao;

public sealed class PostgresTestes(PostgresCompartilhado postgres)
{
    [Fact]
    [Trait("Categoria", "RequerDocker")]
    public async Task Deve_conectar_ao_postgres_real()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        await using var conexao = new NpgsqlConnection(postgres.Conexao);
        await conexao.OpenAsync(cancellationToken);
        await using var comando = new NpgsqlCommand("SELECT 1", conexao);

        var resultado = await comando.ExecuteScalarAsync(cancellationToken);

        Assert.Equal(1, resultado);
    }
}
