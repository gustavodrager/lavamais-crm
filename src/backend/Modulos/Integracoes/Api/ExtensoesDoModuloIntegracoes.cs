using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Integracoes;
using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using LavaMais.Crm.Modulos.Integracoes.Aplicacao;
using LavaMais.Crm.Modulos.Integracoes.Infraestrutura;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace LavaMais.Crm.Modulos.Integracoes.Api;

public static class ExtensoesDoModuloIntegracoes
{
    public static IServiceCollection AdicionarModuloIntegracoes(
        this IServiceCollection servicos,
        IConfiguration configuracao)
    {
        servicos.AdicionarContextoDoModulo<ContextoDeIntegracoes>(
            configuracao,
            ContextoDeIntegracoes.Historico,
            ContextoDeIntegracoes.Schema);

        servicos.AddSingleton<IValidateOptions<OpcoesDeNotificacoes>, ValidadorDeOpcoesDeNotificacoes>();
        servicos.AddOptions<OpcoesDeNotificacoes>()
            .Bind(configuracao.GetSection(OpcoesDeNotificacoes.Secao))
            .ValidateOnStart();
        servicos.AddSingleton<IDisponibilidadeDeNotificacoes, DisponibilidadeDeNotificacoes>();

        servicos.AddHttpClient<ClienteWhatsMiau>((provedor, http) =>
        {
            var opcoes = provedor.GetRequiredService<IOptions<OpcoesDeNotificacoes>>().Value.WhatsMiau;
            if (Uri.TryCreate(opcoes.BaseUrl.TrimEnd('/') + "/", UriKind.Absolute, out var baseUrl))
                http.BaseAddress = baseUrl;
            http.Timeout = TimeSpan.FromSeconds(30);
        });
        servicos.AddHttpClient<PortaCentralDeNotificacoes>((provedor, http) =>
        {
            var opcoes = provedor.GetRequiredService<IOptions<OpcoesDeNotificacoes>>().Value.Central;
            if (Uri.TryCreate(opcoes.BaseUrl, UriKind.Absolute, out var baseUrl))
                http.BaseAddress = baseUrl;
            http.Timeout = TimeSpan.FromSeconds(30);
        });

        servicos.AddScoped<PortaLocalDeNotificacoes>();
        servicos.AddScoped<IPortaDeNotificacoes>(provedor => provedor.GetRequiredService<PortaLocalDeNotificacoes>());
        servicos.AddScoped<IPortaDeNotificacoes>(provedor => provedor.GetRequiredService<PortaCentralDeNotificacoes>());
        servicos.AddScoped<IDespachanteDeNotificacoes, RoteadorDeNotificacoes>();
        servicos.AddScoped<ProcessadorDeWebhookWhatsMiau>();
        servicos.AddScoped<PublicadorDeOutbox>();
        servicos.AddScoped<IPublicadorDeOutbox>(provedor => provedor.GetRequiredService<PublicadorDeOutbox>());
        servicos.AddScoped<ProcessadorDeOutbox>();
        return servicos;
    }

    public static IEndpointRouteBuilder MapearModuloIntegracoes(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet(
                "/api/v1/capacidades",
                (IDisponibilidadeDeNotificacoes notificacoes) => Results.Ok(new
                {
                    envioNotificacoesHabilitado = notificacoes.Habilitado
                }))
            .RequireAuthorization(PoliticasDeAutorizacao.UsuarioAtivo)
            .WithTags("Capacidades");

        endpoints.MapPost(
                "/api/v1/webhooks/whatsmiau/{segredo}",
                async (string segredo, HttpRequest requisicao, ProcessadorDeWebhookWhatsMiau processador, CancellationToken ct) =>
                {
                    await processador.Processar(segredo, requisicao, ct);
                    return Results.Ok();
                })
            .AllowAnonymous()
            .ExcludeFromDescription();

        return endpoints;
    }
}
