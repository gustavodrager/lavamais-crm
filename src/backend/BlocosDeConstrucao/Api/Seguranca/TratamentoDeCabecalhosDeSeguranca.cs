namespace LavaMais.Crm.BlocosDeConstrucao.Api.Seguranca;

public sealed class TratamentoDeCabecalhosDeSeguranca(RequestDelegate proximo)
{
    public async Task InvokeAsync(HttpContext contexto)
    {
        contexto.Response.OnStarting(() =>
        {
            contexto.Response.Headers.TryAdd("X-Content-Type-Options", "nosniff");
            contexto.Response.Headers.TryAdd("X-Frame-Options", "DENY");
            contexto.Response.Headers.TryAdd("Referrer-Policy", "no-referrer");
            contexto.Response.Headers.TryAdd("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
            contexto.Response.Headers.TryAdd("Cache-Control", "no-store");
            return Task.CompletedTask;
        });
        await proximo(contexto);
    }
}
