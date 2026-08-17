using LavaMais.Crm.Modulos.Integracoes.Aplicacao;

namespace LavaMais.Crm.Worker;
public sealed class WorkerDeIntegracoes(IServiceScopeFactory escopos, ILogger<WorkerDeIntegracoes> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try { using var escopo = escopos.CreateScope(); var processador = escopo.ServiceProvider.GetRequiredService<ProcessadorDeOutbox>(); var processou = await processador.ProcessarProxima(stoppingToken); if (!processou) { await processador.Reconciliar(stoppingToken); await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken); } }
            catch (Exception ex) when (ex is not OperationCanceledException) { logger.LogError(ex, "Falha no ciclo do Worker de integracoes"); await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken); }
        }
    }
}
