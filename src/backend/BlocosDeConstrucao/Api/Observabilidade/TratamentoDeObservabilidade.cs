using System.Diagnostics;

namespace LavaMais.Crm.BlocosDeConstrucao.Api.Observabilidade;

public sealed class TratamentoDeObservabilidade(RequestDelegate proximo, ILogger<TratamentoDeObservabilidade> logger)
{
    public async Task InvokeAsync(HttpContext contexto)
    {
        var inicio = Stopwatch.GetTimestamp();
        using var atividade = ObservabilidadeDoCrm.Atividades.StartActivity("http.request", ActivityKind.Server);
        atividade?.SetTag("http.request.method", contexto.Request.Method);
        atividade?.SetTag("url.path", contexto.Request.Path.Value);

        try
        {
            await proximo(contexto);
        }
        finally
        {
            var duracao = Stopwatch.GetElapsedTime(inicio).TotalMilliseconds;
            var etiquetas = new TagList
            {
                { "http.request.method", contexto.Request.Method },
                { "http.response.status_code", contexto.Response.StatusCode }
            };
            ObservabilidadeDoCrm.Requisicoes.Add(1, etiquetas);
            ObservabilidadeDoCrm.DuracaoDasRequisicoes.Record(duracao, etiquetas);
            atividade?.SetTag("http.response.status_code", contexto.Response.StatusCode);
            logger.LogInformation(
                "Requisicao HTTP concluida {Metodo} {Caminho} {StatusCode} em {DuracaoMs} ms",
                contexto.Request.Method,
                contexto.Request.Path.Value,
                contexto.Response.StatusCode,
                duracao);
        }
    }
}
