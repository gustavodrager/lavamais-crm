using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.Modulos.Autorizacao.Aplicacao;
using LavaMais.Crm.Modulos.Autorizacao.Dominio;
using LavaMais.Crm.Modulos.Autorizacao.Infraestrutura;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace LavaMais.Crm.Modulos.Autorizacao.Api;

public static class ExtensoesDoModuloAutorizacao
{
    public static IServiceCollection AdicionarModuloAutorizacao(this IServiceCollection servicos, IConfiguration configuracao)
    {
        servicos.AdicionarContextoDoModulo<ContextoDeAutorizacao>(
            configuracao,
            ContextoDeAutorizacao.TabelaDeHistoricoDasMigrations,
            ContextoDeAutorizacao.Schema);
        servicos.AddSingleton(TimeProvider.System);
        servicos.AddScoped<GerenciadorDeUsuariosCrm>();
        servicos.AddScoped<IAutorizacaoDaIdentidade, AutorizacaoDaIdentidade>();
        servicos.AddScoped<IAuthorizationHandler, TratadorDePapelDoCrm>();
        var identidadeLocal = configuracao.GetValue("IdentidadeLocal:Habilitada", true);
        servicos.AddAuthorization(opcoes =>
        {
            if (identidadeLocal)
            {
                opcoes.AddPolicy(PoliticasDeAutorizacao.UsuarioAtivo, politica => politica.RequireAuthenticatedUser());
                opcoes.AddPolicy(PoliticasDeAutorizacao.Administrador, politica =>
                    politica.RequireAuthenticatedUser().RequireClaim("papel_crm", "Administrador"));
                opcoes.AddPolicy(PoliticasDeAutorizacao.Gestor, politica =>
                    politica.RequireAuthenticatedUser().RequireClaim("papel_crm", "Administrador", "Gerente"));
                opcoes.AddPolicy(PoliticasDeAutorizacao.EnvioIndividual, politica =>
                    politica.RequireAuthenticatedUser().RequireClaim("papel_crm", "Administrador", "Gerente", "Operador"));
                return;
            }

            opcoes.AddPolicy(PoliticasDeAutorizacao.UsuarioAtivo, politica => politica.RequireAuthenticatedUser().AddRequirements(new RequisitoDePapelDoCrm(null)));
            opcoes.AddPolicy(PoliticasDeAutorizacao.Administrador, politica => politica.RequireAuthenticatedUser().AddRequirements(new RequisitoDePapelDoCrm(PapelDoCrm.Administrador)));
            opcoes.AddPolicy(PoliticasDeAutorizacao.Gestor, politica => politica.RequireAuthenticatedUser().AddRequirements(new RequisitoDePapelDoCrm(PapelDoCrm.Administrador, PapelDoCrm.Gerente)));
            opcoes.AddPolicy(PoliticasDeAutorizacao.EnvioIndividual, politica => politica.RequireAuthenticatedUser().AddRequirements(new RequisitoDePapelDoCrm(null)));
        });
        return servicos;
    }

    public static IEndpointRouteBuilder MapearModuloAutorizacao(this IEndpointRouteBuilder endpoints)
    {
        var grupo = endpoints.MapGroup("/api/v1/usuarios-crm")
            .RequireAuthorization(PoliticasDeAutorizacao.Administrador)
            .WithTags("Autorizacao");

        grupo.MapGet("/", async (GerenciadorDeUsuariosCrm gerenciador, CancellationToken cancellationToken) =>
            (await gerenciador.Listar(cancellationToken)).Select(RespostaDeUsuarioCrm.Criar));

        grupo.MapPost("/", async (CriarUsuarioCrm requisicao, GerenciadorDeUsuariosCrm gerenciador, CancellationToken cancellationToken) =>
        {
            var usuario = await gerenciador.Criar(requisicao.UsuarioIdentidadeId, requisicao.Papel, cancellationToken);
            return Results.Created($"/api/v1/usuarios-crm/{usuario.Id}", RespostaDeUsuarioCrm.Criar(usuario));
        });

        grupo.MapPut("/{id:guid}/papel", async (Guid id, AlterarPapelDoUsuarioCrm requisicao, GerenciadorDeUsuariosCrm gerenciador, CancellationToken cancellationToken) =>
        {
            await gerenciador.AlterarPapel(id, requisicao.Papel, cancellationToken);
            return Results.NoContent();
        });

        grupo.MapPost("/{id:guid}/inativar", async (Guid id, GerenciadorDeUsuariosCrm gerenciador, CancellationToken cancellationToken) =>
        {
            await gerenciador.Inativar(id, cancellationToken);
            return Results.NoContent();
        });

        return endpoints;
    }

    public sealed record CriarUsuarioCrm(string UsuarioIdentidadeId, PapelDoCrm Papel);
    public sealed record AlterarPapelDoUsuarioCrm(PapelDoCrm Papel);
    public sealed record RespostaDeUsuarioCrm(Guid Id, string UsuarioIdentidadeId, PapelDoCrm Papel, SituacaoDoUsuarioCrm Situacao)
    {
        public static RespostaDeUsuarioCrm Criar(UsuarioCrm usuario) =>
            new(usuario.Id, usuario.UsuarioIdentidadeId, usuario.Papel, usuario.Situacao);
    }
}
