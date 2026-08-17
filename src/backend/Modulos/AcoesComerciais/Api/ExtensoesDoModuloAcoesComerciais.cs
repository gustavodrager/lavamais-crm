using System.Text.Json;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Integracoes;
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
    { servicos.AdicionarContextoDoModulo<ContextoDeAcoesComerciais>(configuracao, ContextoDeAcoesComerciais.Historico, ContextoDeAcoesComerciais.Schema); servicos.AddScoped<GerenciadorDeAcoesComerciais>(); servicos.AddScoped<IProjecaoDeEnvios>(p => p.GetRequiredService<GerenciadorDeAcoesComerciais>()); return servicos; }

    public static IEndpointRouteBuilder MapearModuloAcoesComerciais(this IEndpointRouteBuilder endpoints)
    {
        var grupo = endpoints.MapGroup("/api/v1/acoes-comerciais").RequireAuthorization(PoliticasDeAutorizacao.Gestor).WithTags("Acoes comerciais");
        grupo.MapGet("/", async (GerenciadorDeAcoesComerciais g, CancellationToken ct) => (await g.Listar(ct)).Select(Resposta.Criar));
        grupo.MapGet("/{id:guid}", async (Guid id, GerenciadorDeAcoesComerciais g, CancellationToken ct) => Resposta.Criar(await g.Obter(id, ct) ?? throw new ExcecaoDeRecursoNaoEncontrado("Acao comercial nao encontrada.")));
        grupo.MapPost("/", async (DadosDoRascunho dados, GerenciadorDeAcoesComerciais g, CancellationToken ct) => { var acao = await g.Criar(dados, ct); return Results.Created($"/api/v1/acoes-comerciais/{acao.Id}", Resposta.Criar(acao)); });
        grupo.MapPut("/{id:guid}", async (Guid id, DadosDoRascunho dados, GerenciadorDeAcoesComerciais g, CancellationToken ct) => { await g.Atualizar(id, dados, ct); return Results.NoContent(); });
        grupo.MapPost("/{id:guid}/simular-publico", async (Guid id, int pagina, int tamanhoPagina, GerenciadorDeAcoesComerciais g, CancellationToken ct) => Results.Ok(await g.Simular(id, pagina, tamanhoPagina, ct)));
        grupo.MapPost("/{id:guid}/preparar", async (Guid id, PrepararAcao dados, GerenciadorDeAcoesComerciais g, CancellationToken ct) => { await g.Preparar(id, dados.Versao, ct); return Results.NoContent(); });
        grupo.MapPost("/{id:guid}/iniciar", async (Guid id, IniciarAcao dados, GerenciadorDeAcoesComerciais g, CancellationToken ct) => { await g.Iniciar(id, dados.Versao, ct); return Results.NoContent(); });
        grupo.MapGet("/{id:guid}/destinatarios", async (Guid id, GerenciadorDeAcoesComerciais g, CancellationToken ct) => (await g.ListarDestinatarios(id, ct)).Select(x => new { x.Id, x.ClienteId, x.NomeClienteSnapshot, x.DestinoSnapshot, x.ConteudoPreVisualizacaoSnapshot, x.SituacaoEnvio }));
        return endpoints;
    }

    public sealed record PrepararAcao(uint Versao);
    public sealed record IniciarAcao(uint Versao);

    public sealed record Resposta(Guid Id, string Nome, string? Objetivo, Guid ItemDeCatalogoId, Guid? VersaoModeloId, CriteriosDeSegmentacao Criterios, SituacaoDaAcaoComercial Situacao, DateTimeOffset DataAtualizacao, uint Versao)
    {
        private static readonly JsonSerializerOptions OpcoesJson = new(JsonSerializerDefaults.Web);
        public static Resposta Criar(AcaoComercial acao) => new(acao.Id, acao.Nome, acao.Objetivo, acao.ItemDeCatalogoId, acao.VersaoModeloId,
            JsonSerializer.Deserialize<CriteriosDeSegmentacao>(acao.CriteriosSegmentacaoJson, OpcoesJson)!, acao.Situacao, acao.DataAtualizacao, acao.Versao);
    }
}
