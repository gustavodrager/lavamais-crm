using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using LavaMais.Crm.Modulos.Catalogo.Aplicacao;
using LavaMais.Crm.Modulos.Catalogo.Dominio;
using LavaMais.Crm.Modulos.Catalogo.Infraestrutura;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace LavaMais.Crm.Modulos.Catalogo.Api;

public static class ExtensoesDoModuloCatalogo
{
    public static IServiceCollection AdicionarModuloCatalogo(this IServiceCollection servicos, IConfiguration configuracao)
    {
        servicos.AdicionarContextoDoModulo<ContextoDeCatalogo>(configuracao, ContextoDeCatalogo.Historico, ContextoDeCatalogo.Schema);
        servicos.AddScoped<GerenciadorDeCatalogo>(); return servicos;
    }

    public static IEndpointRouteBuilder MapearModuloCatalogo(this IEndpointRouteBuilder endpoints)
    {
        var grupo = endpoints.MapGroup("/api/v1/itens-de-catalogo").RequireAuthorization(PoliticasDeAutorizacao.UsuarioAtivo).WithTags("Catalogo");
        grupo.MapGet("/", async (SituacaoDoItemDeCatalogo? situacao, GerenciadorDeCatalogo g, CancellationToken ct) => (await g.Listar(situacao, ct)).Select(Resposta.Criar));
        grupo.MapPost("/", async (DadosDoItemDeCatalogo dados, GerenciadorDeCatalogo g, CancellationToken ct) => { var item = await g.Criar(dados, ct); return Results.Created($"/api/v1/itens-de-catalogo/{item.Id}", Resposta.Criar(item)); });
        grupo.MapPut("/{id:guid}", async (Guid id, DadosDoItemDeCatalogo dados, GerenciadorDeCatalogo g, CancellationToken ct) => { await g.Atualizar(id, dados, ct); return Results.NoContent(); });
        return endpoints;
    }

    public sealed record Resposta(Guid Id, TipoDeItemDeCatalogo Tipo, string Nome, string? Descricao, string? Categoria, decimal? ValorReferencia, SituacaoDoItemDeCatalogo Situacao)
    { public static Resposta Criar(ItemDeCatalogo item) => new(item.Id, item.Tipo, item.Nome, item.Descricao, item.Categoria, item.ValorReferencia, item.Situacao); }
}
