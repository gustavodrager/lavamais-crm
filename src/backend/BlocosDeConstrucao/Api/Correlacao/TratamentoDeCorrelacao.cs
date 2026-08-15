using Microsoft.Extensions.Primitives;

namespace LavaMais.Crm.BlocosDeConstrucao.Api.Correlacao;

public sealed class TratamentoDeCorrelacao(RequestDelegate proximo, ILogger<TratamentoDeCorrelacao> logger)
{
    public const string NomeDoCabecalho = "X-Correlation-Id";

    public async Task InvokeAsync(HttpContext contexto)
    {
        var identificador = ObterIdentificador(contexto.Request.Headers[NomeDoCabecalho]);
        contexto.TraceIdentifier = identificador;
        contexto.Response.Headers[NomeDoCabecalho] = identificador;

        using (logger.BeginScope(new Dictionary<string, object> { ["CorrelationId"] = identificador }))
        {
            await proximo(contexto);
        }
    }

    private static string ObterIdentificador(StringValues valor) =>
        valor.Count == 1 && !string.IsNullOrWhiteSpace(valor[0]) && valor[0]!.Length <= 128
            ? valor[0]!
            : Guid.NewGuid().ToString("D");
}
