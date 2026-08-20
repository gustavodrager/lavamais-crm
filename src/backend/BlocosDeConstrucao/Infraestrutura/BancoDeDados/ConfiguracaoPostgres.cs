using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;

namespace LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;

public static class ConfiguracaoPostgres
{
    public const string NomeDaConexao = "Crm";
    public const string NomeDaVariavelRailway = "DATABASE_URL";

    private const string ConexaoLocalParaFerramentas =
        "Host=localhost;Port=5432;Database=lavamais_crm;Username=lavamais;Password=lavamais_local";

    public static IServiceCollection AdicionarPostgres(this IServiceCollection servicos, IConfiguration configuracao)
    {
        var conexao = ObterStringDeConexao(configuracao);

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
        var conexao = ObterStringDeConexao(configuracao);

        servicos.AddDbContext<TContexto>(opcoes => opcoes.UseNpgsql(
            conexao,
            postgres => postgres.MigrationsHistoryTable(tabelaDeHistoricoDasMigrations, schema)));

        return servicos;
    }

    public static string ObterStringDeConexao(IConfiguration configuracao)
    {
        var urlDoRailway = configuracao[NomeDaVariavelRailway];
        var conexao = string.IsNullOrWhiteSpace(urlDoRailway)
            ? configuracao.GetConnectionString(NomeDaConexao)
            : urlDoRailway;

        return NormalizarStringDeConexao(conexao);
    }

    public static string ObterStringDeConexaoParaFerramentas()
    {
        var urlDoRailway = Environment.GetEnvironmentVariable(NomeDaVariavelRailway);
        var conexao = string.IsNullOrWhiteSpace(urlDoRailway)
            ? Environment.GetEnvironmentVariable($"ConnectionStrings__{NomeDaConexao}") ?? ConexaoLocalParaFerramentas
            : urlDoRailway;

        return NormalizarStringDeConexao(conexao);
    }

    private static string NormalizarStringDeConexao(string? conexao)
    {
        if (string.IsNullOrWhiteSpace(conexao))
        {
            throw new InvalidOperationException(
                $"Configure '{NomeDaVariavelRailway}' ou 'ConnectionStrings:{NomeDaConexao}'.");
        }

        try
        {
            return EhUrlPostgres(conexao)
                ? ConverterUrlPostgres(conexao)
                : new NpgsqlConnectionStringBuilder(conexao).ConnectionString;
        }
        catch (Exception excecao) when (excecao is ArgumentException or FormatException)
        {
            throw new InvalidOperationException(
                "A configuracao da conexao PostgreSQL e invalida. Nenhum valor sensivel foi registrado.");
        }
    }

    private static bool EhUrlPostgres(string conexao) =>
        conexao.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase)
        || conexao.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase);

    private static string ConverterUrlPostgres(string conexao)
    {
        var uri = new Uri(conexao, UriKind.Absolute);
        var credenciais = uri.UserInfo.Split(':', 2);
        var banco = uri.AbsolutePath.Trim('/');

        if (string.IsNullOrWhiteSpace(uri.Host)
            || credenciais.Length != 2
            || string.IsNullOrWhiteSpace(credenciais[0])
            || string.IsNullOrWhiteSpace(banco))
        {
            throw new FormatException("A URL PostgreSQL nao possui host, credenciais e banco validos.");
        }

        var construtor = new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.Port > 0 ? uri.Port : 5432,
            Database = Uri.UnescapeDataString(banco),
            Username = Uri.UnescapeDataString(credenciais[0]),
            Password = Uri.UnescapeDataString(credenciais[1])
        };

        AplicarParametrosDaUrl(uri, construtor);
        return construtor.ConnectionString;
    }

    private static void AplicarParametrosDaUrl(Uri uri, NpgsqlConnectionStringBuilder construtor)
    {
        foreach (var parametro in uri.Query.TrimStart('?').Split('&', StringSplitOptions.RemoveEmptyEntries))
        {
            var partes = parametro.Split('=', 2);
            var nome = Uri.UnescapeDataString(partes[0]);
            var valor = partes.Length == 2 ? Uri.UnescapeDataString(partes[1]) : string.Empty;

            if (nome.Equals("sslmode", StringComparison.OrdinalIgnoreCase))
            {
                construtor.SslMode = valor.ToLowerInvariant() switch
                {
                    "disable" => SslMode.Disable,
                    "allow" => SslMode.Allow,
                    "prefer" => SslMode.Prefer,
                    "require" => SslMode.Require,
                    "verify-ca" => SslMode.VerifyCA,
                    "verify-full" => SslMode.VerifyFull,
                    _ => throw new FormatException("O parametro sslmode da URL PostgreSQL e invalido.")
                };
            }
        }
    }
}
