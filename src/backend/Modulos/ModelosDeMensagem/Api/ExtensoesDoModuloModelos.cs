using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using LavaMais.Crm.Modulos.ModelosDeMensagem.Aplicacao;
using LavaMais.Crm.Modulos.ModelosDeMensagem.Dominio;
using LavaMais.Crm.Modulos.ModelosDeMensagem.Infraestrutura;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace LavaMais.Crm.Modulos.ModelosDeMensagem.Api;

public static class ExtensoesDoModuloModelos
{
    public static IServiceCollection AdicionarModuloModelos(this IServiceCollection servicos, IConfiguration configuracao)
    {
        servicos.AdicionarContextoDoModulo<ContextoDeModelos>(configuracao, ContextoDeModelos.Historico, ContextoDeModelos.Schema);
        servicos.AddScoped<GerenciadorDeModelos>(); servicos.AddScoped<ConsultaDeModelos>(); return servicos;
    }

    public static IEndpointRouteBuilder MapearModuloModelos(this IEndpointRouteBuilder endpoints)
    {
        var grupo = endpoints.MapGroup("/api/v1/modelos-de-mensagem").RequireAuthorization(PoliticasDeAutorizacao.UsuarioAtivo).WithTags("Modelos de mensagem");
        grupo.MapGet("/", async (GerenciadorDeModelos g, CancellationToken ct) => (await g.Listar(ct)).Select(RespostaDoModelo.Criar));
        grupo.MapPost("/", async (CriarModelo dados, GerenciadorDeModelos g, CancellationToken ct) => { var modelo = await g.Criar(dados.Nome, ct); return Results.Created($"/api/v1/modelos-de-mensagem/{modelo.Id}", RespostaDoModelo.Criar(modelo)); })
            .RequireAuthorization(PoliticasDeAutorizacao.Administrador);
        grupo.MapPost("/{id:guid}/publicar", async (Guid id, DadosDaPublicacao dados, GerenciadorDeModelos g, CancellationToken ct) => Results.Ok(RespostaDaVersao.Criar(await g.Publicar(id, dados, ct))))
            .RequireAuthorization(PoliticasDeAutorizacao.Administrador);
        return endpoints;
    }

    public sealed record CriarModelo(string Nome);
    public sealed record RespostaDoModelo(Guid Id, string Nome, CanalDeMensagem Canal, SituacaoDoModelo Situacao, Guid? VersaoAtualId, IReadOnlyCollection<RespostaDaVersao> Versoes)
    { public static RespostaDoModelo Criar(ModeloDeMensagem modelo) => new(modelo.Id, modelo.Nome, modelo.Canal, modelo.Situacao, modelo.VersaoAtualId, modelo.Versoes.OrderBy(x => x.Numero).Select(RespostaDaVersao.Criar).ToArray()); }
    public sealed record RespostaDaVersao(Guid Id, int Numero, string ConteudoPreVisualizacao, IReadOnlyCollection<string> Variaveis, string ChaveTemplateNotificacao, DateTimeOffset DataPublicacao)
    { public static RespostaDaVersao Criar(VersaoDoModelo versao) => new(versao.Id, versao.Numero, versao.ConteudoPreVisualizacao, versao.Variaveis, versao.ChaveTemplateNotificacao, versao.DataPublicacao); }
}
