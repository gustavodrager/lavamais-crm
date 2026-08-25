using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using LavaMais.Crm.Modulos.Roteiros.Aplicacao;
using LavaMais.Crm.Modulos.Roteiros.Dominio;
using LavaMais.Crm.Modulos.Roteiros.Infraestrutura;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace LavaMais.Crm.Modulos.Roteiros.Api;
public static class ExtensoesDoModuloRoteiros
{
    public static IServiceCollection AdicionarModuloRoteiros(this IServiceCollection s, IConfiguration c) { s.AdicionarContextoDoModulo<ContextoDeRoteiros>(c, ContextoDeRoteiros.Historico, ContextoDeRoteiros.Schema); s.AddScoped<GerenciadorDeRoteiros>(); return s; }
    public static IEndpointRouteBuilder MapearModuloRoteiros(this IEndpointRouteBuilder e)
    {
        var g = e.MapGroup("/api/v1/roteiros").RequireAuthorization(PoliticasDeAutorizacao.UsuarioAtivo).WithTags("Roteiros");
        g.MapGet("/", async (DateOnly data, GerenciadorDeRoteiros x, CancellationToken ct) => { var r = await x.Obter(data, ct); return r is null ? Results.NotFound() : Results.Ok(Resposta.Criar(r)); });
        g.MapPost("/", async (CriarRoteiro d, GerenciadorDeRoteiros x, CancellationToken ct) => { var r = await x.Criar(d.Data, d.NomeMotorista, ct); return Results.Created($"/api/v1/roteiros?data={r.Data:yyyy-MM-dd}", Resposta.Criar(r)); });
        g.MapPost("/{id:guid}/paradas", async (Guid id, DadosDaParada d, GerenciadorDeRoteiros x, CancellationToken ct) => { await x.Adicionar(id, d, ct); return Results.NoContent(); });
        g.MapPut("/{id:guid}/paradas/{paradaId:guid}", async (Guid id, Guid paradaId, DadosDaParada d, GerenciadorDeRoteiros x, CancellationToken ct) => { await x.AtualizarParada(id, paradaId, d, ct); return Results.NoContent(); });
        g.MapDelete("/{id:guid}/paradas/{paradaId:guid}", async (Guid id, Guid paradaId, GerenciadorDeRoteiros x, CancellationToken ct) => { await x.RemoverParada(id, paradaId, ct); return Results.NoContent(); });
        g.MapPut("/{id:guid}/ordem", async (Guid id, AlterarOrdem d, GerenciadorDeRoteiros x, CancellationToken ct) => { await x.Reordenar(id, d.ParadaIds, ct); return Results.NoContent(); });
        g.MapPost("/{id:guid}/publicar", async (Guid id, GerenciadorDeRoteiros x, CancellationToken ct) => { await x.Publicar(id, ct); return Results.NoContent(); });
        g.MapPost("/paradas/{id:guid}/iniciar", async (Guid id, GerenciadorDeRoteiros x, CancellationToken ct) => { await x.IniciarParada(id, ct); return Results.NoContent(); });
        g.MapPost("/paradas/{id:guid}/concluir", async (Guid id, GerenciadorDeRoteiros x, CancellationToken ct) => { await x.ConcluirParada(id, ct); return Results.NoContent(); });
        g.MapPost("/paradas/{id:guid}/nao-realizar", async (Guid id, NaoRealizar d, GerenciadorDeRoteiros x, CancellationToken ct) => { await x.NaoRealizarParada(id, d.Motivo, ct); return Results.NoContent(); }); return e;
    }
    public sealed record CriarRoteiro(DateOnly Data, string NomeMotorista); public sealed record AlterarOrdem(IReadOnlyList<Guid> ParadaIds); public sealed record NaoRealizar(string Motivo);
    public sealed record Resposta(Guid Id, DateOnly Data, string NomeMotorista, SituacaoDoRoteiro Situacao, uint Versao, IReadOnlyList<RespostaParada> Paradas)
    { public static Resposta Criar(RoteiroDiario r) => new(r.Id, r.Data, r.NomeMotorista, r.Situacao, r.Versao, r.Paradas.OrderBy(x => x.Ordem).Select(RespostaParada.Criar).ToArray()); }
    public sealed record RespostaParada(Guid Id, Guid ClienteId, string NomeCliente, string Whatsapp, string EnderecoCompleto, TipoDaParada Tipo, string Periodo, string? Observacao, int Ordem, SituacaoDaParada Situacao, string? MotivoNaoRealizacao)
    { public static RespostaParada Criar(ParadaDoRoteiro p) => new(p.Id, p.ClienteId, p.NomeCliente, p.Whatsapp, p.EnderecoCompleto, p.Tipo, p.Periodo, p.Observacao, p.Ordem, p.Situacao, p.MotivoNaoRealizacao); }
}
