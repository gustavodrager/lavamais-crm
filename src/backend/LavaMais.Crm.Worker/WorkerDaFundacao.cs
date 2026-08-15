namespace LavaMais.Crm.Worker;

public sealed class WorkerDaFundacao(ILogger<WorkerDaFundacao> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("CRM Worker iniciado");
        await Task.Delay(Timeout.InfiniteTimeSpan, stoppingToken);
    }
}
