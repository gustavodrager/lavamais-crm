using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Integracoes;
using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using LavaMais.Crm.Modulos.Integracoes.Aplicacao;
using LavaMais.Crm.Modulos.Integracoes.Infraestrutura;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
namespace LavaMais.Crm.Modulos.Integracoes.Api;

public static class ExtensoesDoModuloIntegracoes
{
    public static IServiceCollection AdicionarModuloIntegracoes(this IServiceCollection s, IConfiguration c) { s.AdicionarContextoDoModulo<ContextoDeIntegracoes>(c, ContextoDeIntegracoes.Historico, ContextoDeIntegracoes.Schema); s.Configure<OpcoesDoNotificationHub>(c.GetSection("NotificationHub")); s.AddHttpClient<ClienteDoNotificationHub>((p, h) => { var o = p.GetRequiredService<Microsoft.Extensions.Options.IOptions<OpcoesDoNotificationHub>>().Value; if (Uri.TryCreate(o.BaseUrl, UriKind.Absolute, out var u)) h.BaseAddress = u; }); s.AddScoped<PublicadorDeOutbox>(); s.AddScoped<IPublicadorDeOutbox>(p => p.GetRequiredService<PublicadorDeOutbox>()); s.AddScoped<ProcessadorDeOutbox>(); return s; }
}
