using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using Microsoft.Extensions.Configuration;
using Npgsql;

namespace LavaMais.Crm.Testes.Unidade;

public sealed class ConfiguracaoPostgresTestes
{
    [Fact]
    public void Deve_converter_database_url_do_railway_para_o_formato_do_npgsql()
    {
        var configuracao = CriarConfiguracao(new Dictionary<string, string?>
        {
            [ConfiguracaoPostgres.NomeDaVariavelRailway] =
                "postgresql://usuario%40crm:senha%3Bsegura@postgres-32ac.railway.internal:5432/railway?sslmode=require"
        });

        var conexao = ConfiguracaoPostgres.ObterStringDeConexao(configuracao);
        var parametros = new NpgsqlConnectionStringBuilder(conexao);

        Assert.Equal("postgres-32ac.railway.internal", parametros.Host);
        Assert.Equal(5432, parametros.Port);
        Assert.Equal("railway", parametros.Database);
        Assert.Equal("usuario@crm", parametros.Username);
        Assert.Equal("senha;segura", parametros.Password);
        Assert.Equal(SslMode.Require, parametros.SslMode);
    }

    [Fact]
    public void Deve_priorizar_database_url_sobre_a_conexao_de_desenvolvimento()
    {
        var configuracao = CriarConfiguracao(new Dictionary<string, string?>
        {
            [ConfiguracaoPostgres.NomeDaVariavelRailway] =
                "postgresql://postgres:segredo@postgres.railway.internal:5432/railway",
            [$"ConnectionStrings:{ConfiguracaoPostgres.NomeDaConexao}"] =
                "Host=localhost;Database=lavamais_crm;Username=lavamais;Password=lavamais_local"
        });

        var conexao = ConfiguracaoPostgres.ObterStringDeConexao(configuracao);
        var parametros = new NpgsqlConnectionStringBuilder(conexao);

        Assert.Equal("postgres.railway.internal", parametros.Host);
        Assert.Equal("railway", parametros.Database);
    }

    [Fact]
    public void Deve_manter_compatibilidade_com_a_string_de_conexao_do_npgsql()
    {
        var configuracao = CriarConfiguracao(new Dictionary<string, string?>
        {
            [$"ConnectionStrings:{ConfiguracaoPostgres.NomeDaConexao}"] =
                "Host=localhost;Port=5433;Database=lavamais_crm;Username=lavamais;Password=lavamais_local"
        });

        var conexao = ConfiguracaoPostgres.ObterStringDeConexao(configuracao);
        var parametros = new NpgsqlConnectionStringBuilder(conexao);

        Assert.Equal("localhost", parametros.Host);
        Assert.Equal(5433, parametros.Port);
        Assert.Equal("lavamais_crm", parametros.Database);
    }

    [Fact]
    public void Deve_falhar_sem_expor_segredos_quando_a_conexao_for_invalida()
    {
        var configuracao = CriarConfiguracao(new Dictionary<string, string?>
        {
            [ConfiguracaoPostgres.NomeDaVariavelRailway] = "postgresql://usuario:segredo-super-secreto@/railway"
        });

        var excecao = Assert.Throws<InvalidOperationException>(() =>
            ConfiguracaoPostgres.ObterStringDeConexao(configuracao));

        Assert.DoesNotContain("segredo-super-secreto", excecao.ToString());
    }

    [Fact]
    public void Deve_exigir_configuracao_externa_quando_nao_houver_conexao()
    {
        var configuracao = CriarConfiguracao([]);

        var excecao = Assert.Throws<InvalidOperationException>(() =>
            ConfiguracaoPostgres.ObterStringDeConexao(configuracao));

        Assert.Contains(ConfiguracaoPostgres.NomeDaVariavelRailway, excecao.Message);
    }

    private static IConfiguration CriarConfiguracao(Dictionary<string, string?> valores) =>
        new ConfigurationBuilder().AddInMemoryCollection(valores).Build();
}
