using System.Text.Json;
using LavaMais.Crm.BlocosDeConstrucao.Api.Correlacao;
using LavaMais.Crm.BlocosDeConstrucao.Api.Erros;
using LavaMais.Crm.BlocosDeConstrucao.Api.Observabilidade;
using LavaMais.Crm.BlocosDeConstrucao.Api.Seguranca;
using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace LavaMais.Crm.BlocosDeConstrucao.Api;

public static class ExtensoesDaFundacao
{
    public static IServiceCollection AdicionarFundacaoDaApi(this IServiceCollection servicos, IConfiguration configuracao)
    {
        servicos.AdicionarPostgres(configuracao);
        servicos.AddProblemDetails(opcoes => opcoes.CustomizeProblemDetails = contexto =>
        {
            contexto.ProblemDetails.Extensions.TryAdd("correlationId", contexto.HttpContext.TraceIdentifier);
        });
        servicos.AddExceptionHandler<TratadorGlobalDeExcecoes>();
        servicos.AddHealthChecks()
            .AddCheck("processo", () => HealthCheckResult.Healthy(), tags: ["vivo"])
            .AddCheck<VerificacaoDeSaudeDoPostgres>("postgres", tags: ["pronto"]);
        return servicos;
    }

    public static WebApplication UsarFundacaoDaApi(this WebApplication aplicacao)
    {
        aplicacao.UseMiddleware<TratamentoDeCorrelacao>();
        aplicacao.UseMiddleware<TratamentoDeObservabilidade>();
        aplicacao.UseMiddleware<TratamentoDeCabecalhosDeSeguranca>();
        aplicacao.UseExceptionHandler();
        aplicacao.MapHealthChecks("/saude/vivo", new HealthCheckOptions { Predicate = registro => registro.Tags.Contains("vivo") });
        aplicacao.MapHealthChecks("/saude/pronto", new HealthCheckOptions
        {
            Predicate = registro => registro.Tags.Contains("pronto"),
            ResponseWriter = EscreverRespostaDeSaude
        });
        return aplicacao;
    }

    private static Task EscreverRespostaDeSaude(HttpContext contexto, HealthReport relatorio)
    {
        contexto.Response.ContentType = "application/json";
        var resposta = JsonSerializer.Serialize(new
        {
            situacao = relatorio.Status.ToString(),
            verificacoes = relatorio.Entries.Select(item => new { nome = item.Key, situacao = item.Value.Status.ToString() })
        }, new JsonSerializerOptions(JsonSerializerDefaults.Web));
        return contexto.Response.WriteAsync(resposta);
    }
}
