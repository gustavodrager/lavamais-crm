using System.Text.Json;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using LavaMais.Crm.Modulos.Importacoes.Aplicacao;
using LavaMais.Crm.Modulos.Importacoes.Infraestrutura;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace LavaMais.Crm.Modulos.Importacoes.Api;

public static class ExtensoesDoModuloImportacoes
{
    public static IServiceCollection AdicionarModuloImportacoes(this IServiceCollection s, IConfiguration c)
    { s.AdicionarContextoDoModulo<ContextoDeImportacoes>(c, ContextoDeImportacoes.Historico, ContextoDeImportacoes.Schema); s.AddScoped<GerenciadorDeImportacoes>(); return s; }

    public static IEndpointRouteBuilder MapearModuloImportacoes(this IEndpointRouteBuilder endpoints)
    {
        var grupo = endpoints.MapGroup("/api/v1/importacoes/clientes").RequireAuthorization(PoliticasDeAutorizacao.Administrador).WithTags("Importacoes");
        grupo.MapPost("/pre-visualizar", async (IFormFile arquivo, string mapeamento, GerenciadorDeImportacoes g, CancellationToken ct) =>
        {
            var mapa = JsonSerializer.Deserialize<MapeamentoCsv>(mapeamento, new JsonSerializerOptions(JsonSerializerDefaults.Web)) ?? throw new ExcecaoDeRegraDeNegocio("mapeamento_invalido", "O mapeamento e obrigatorio.");
            await using var fluxo = arquivo.OpenReadStream(); return Results.Ok(await g.PreVisualizar(arquivo.FileName, fluxo, arquivo.Length, mapa, ct));
        }).DisableAntiforgery();
        grupo.MapPost("/", async (ConfirmarImportacao r, GerenciadorDeImportacoes g, CancellationToken ct) => Results.Ok(Resposta.Criar(await g.Confirmar(r.ReferenciaArquivo, r.Mapeamento, ct))));
        grupo.MapGet("/{id:guid}", async (Guid id, GerenciadorDeImportacoes g, CancellationToken ct) =>
        { var item = await g.Obter(id, ct) ?? throw new ExcecaoDeRecursoNaoEncontrado("Importacao nao encontrada."); return Results.Ok(Resposta.Criar(item)); });
        return endpoints;
    }
    public sealed record ConfirmarImportacao(Guid ReferenciaArquivo, MapeamentoCsv Mapeamento);
    public sealed record Resposta(Guid Id, string Situacao, int TotalLinhas, int TotalInseridas, int TotalRejeitadas, object Linhas)
    { public static Resposta Criar(Dominio.ImportacaoDeClientes i) => new(i.Id, i.Situacao.ToString(), i.TotalLinhas, i.TotalInseridas, i.TotalRejeitadas, i.Linhas.Select(l => new { l.Numero, resultado = l.Resultado.ToString(), l.ClienteId, l.Erro })); }
}
