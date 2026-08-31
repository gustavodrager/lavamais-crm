using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Integracoes;
using LavaMais.Crm.Modulos.Integracoes.Aplicacao;

namespace LavaMais.Crm.Worker;

public sealed class WorkerDeIntegracoes(
    IServiceScopeFactory escopos,
    IDisponibilidadeDeNotificacoes notificacoes,
    ILogger<WorkerDeIntegracoes> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            if (!notificacoes.Habilitado)
            {
                await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
                continue;
            }

            try { using var escopo = escopos.CreateScope(); var processador = escopo.ServiceProvider.GetRequiredService<ProcessadorDeOutbox>(); var processou = await processador.ProcessarProxima(stoppingToken); if (!processou) { await processador.Reconciliar(stoppingToken); await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken); } }
            catch (Exception ex) when (ex is not OperationCanceledException) { logger.LogError(ex, "Falha no ciclo do Worker de integracoes"); await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken); }
        }
    }
}
