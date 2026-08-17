using System.Text.Json;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using LavaMais.Crm.Modulos.AcoesComerciais.Aplicacao;
using LavaMais.Crm.Modulos.AcoesComerciais.Dominio;
using LavaMais.Crm.Modulos.AcoesComerciais.Infraestrutura;
using LavaMais.Crm.Modulos.Segmentacao.Dominio;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace LavaMais.Crm.Modulos.AcoesComerciais.Api;

public static class ExtensoesDoModuloAcoesComerciais
{
    public static IServiceCollection AdicionarModuloAcoesComerciais(this IServiceCollection servicos, IConfiguration configuracao)
    { servicos.AdicionarContextoDoModulo<ContextoDeAcoesComerciais>(configuracao, ContextoDeAcoesComerciais.Historico, ContextoDeAcoesComerciais.Schema); servicos.AddScoped<GerenciadorDeAcoesComerciais>(); return servicos; }

    public static IEndpointRouteBuilder MapearModuloAcoesComerciais(this IEndpointRouteBuilder endpoints)
    {
        var grupo = endpoints.MapGroup("/api/v1/acoes-comerciais").RequireAuthorization(PoliticasDeAutorizacao.Gestor).WithTags("Acoes comerciais");
        grupo.MapGet("/", async (GerenciadorDeAcoesComerciais g, CancellationToken ct) => (await g.Listar(ct)).Select(Resposta.Criar));
        grupo.MapGet("/{id:guid}", async (Guid id, GerenciadorDeAcoesComerciais g, CancellationToken ct) => Resposta.Criar(await g.Obter(id, ct) ?? throw new ExcecaoDeRecursoNaoEncontrado("Acao comercial nao encontrada.")));
        grupo.MapPost("/", async (DadosDoRascunho dados, GerenciadorDeAcoesComerciais g, CancellationToken ct) => { var acao = await g.Criar(dados, ct); return Results.Created($"/api/v1/acoes-comerciais/{acao.Id}", Resposta.Criar(acao)); });
        grupo.MapPut("/{id:guid}", async (Guid id, DadosDoRascunho dados, GerenciadorDeAcoesComerciais g, CancellationToken ct) => { await g.Atualizar(id, dados, ct); return Results.NoContent(); });
        grupo.MapPost("/{id:guid}/simular-publico", async (Guid id, int pagina, int tamanhoPagina, GerenciadorDeAcoesComerciais g, CancellationToken ct) => Results.Ok(await g.Simular(id, pagina, tamanhoPagina, ct)));
        return endpoints;
    }

    public sealed record Resposta(Guid Id, string Nome, string? Objetivo, Guid ItemDeCatalogoId, Guid? VersaoModeloId, CriteriosDeSegmentacao Criterios, SituacaoDaAcaoComercial Situacao, DateTimeOffset DataAtualizacao)
    {
        private static readonly JsonSerializerOptions OpcoesJson = new(JsonSerializerDefaults.Web);
        public static Resposta Criar(AcaoComercial acao) => new(acao.Id, acao.Nome, acao.Objetivo, acao.ItemDeCatalogoId, acao.VersaoModeloId,
            JsonSerializer.Deserialize<CriteriosDeSegmentacao>(acao.CriteriosSegmentacaoJson, OpcoesJson)!, acao.Situacao, acao.DataAtualizacao);
    }
}
