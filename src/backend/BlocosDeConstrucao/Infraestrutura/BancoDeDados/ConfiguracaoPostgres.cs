using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;

namespace LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;

public static class ConfiguracaoPostgres
{
    public const string NomeDaConexao = "Crm";

    public static IServiceCollection AdicionarPostgres(this IServiceCollection servicos, IConfiguration configuracao)
    {
        var conexao = configuracao.GetConnectionString(NomeDaConexao);

        if (string.IsNullOrWhiteSpace(conexao))
        {
            throw new InvalidOperationException($"A string de conexao 'ConnectionStrings:{NomeDaConexao}' nao foi configurada.");
        }

        servicos.AddSingleton(_ => NpgsqlDataSource.Create(conexao));
        return servicos;
    }

    public static IServiceCollection AdicionarContextoDoModulo<TContexto>(
        this IServiceCollection servicos,
        IConfiguration configuracao,
        string tabelaDeHistoricoDasMigrations,
        string schema)
        where TContexto : DbContext
    {
        var conexao = configuracao.GetConnectionString(NomeDaConexao)
            ?? throw new InvalidOperationException($"A string de conexao 'ConnectionStrings:{NomeDaConexao}' nao foi configurada.");

        servicos.AddDbContext<TContexto>(opcoes => opcoes.UseNpgsql(
            conexao,
            postgres => postgres.MigrationsHistoryTable(tabelaDeHistoricoDasMigrations, schema)));

        return servicos;
    }
}
