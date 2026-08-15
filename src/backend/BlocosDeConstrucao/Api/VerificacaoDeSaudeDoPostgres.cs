using Microsoft.Extensions.Diagnostics.HealthChecks;
using Npgsql;

namespace LavaMais.Crm.BlocosDeConstrucao.Api;

public sealed class VerificacaoDeSaudeDoPostgres(NpgsqlDataSource fonteDeDados) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await using var comando = fonteDeDados.CreateCommand("SELECT 1");
            await comando.ExecuteScalarAsync(cancellationToken);
            return HealthCheckResult.Healthy();
        }
        catch (Exception excecao)
        {
            return HealthCheckResult.Unhealthy("Nao foi possivel acessar o PostgreSQL.", excecao);
        }
    }
}
