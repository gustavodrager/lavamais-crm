using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using LavaMais.Crm.Modulos.Roteiros.Aplicacao;
using LavaMais.Crm.Modulos.Roteiros.Dominio;
using LavaMais.Crm.Modulos.Roteiros.Infraestrutura;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Mvc;
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
        g.MapPost("/", async ([FromBody] CriarRoteiro d, GerenciadorDeRoteiros x, CancellationToken ct) => { var r = await x.Criar(d.Data, d.NomeMotorista, ct); return Results.Created($"/api/v1/roteiros?data={r.Data:yyyy-MM-dd}", Resposta.Criar(r)); });
        g.MapPut("/{id:guid}", async (Guid id, [FromBody] AtualizarRoteiro d, GerenciadorDeRoteiros x, CancellationToken ct) => { await x.AtualizarMotorista(id, d.NomeMotorista, d.Versao, ct); return Results.NoContent(); });
        g.MapDelete("/{id:guid}", async (Guid id, [FromBody] ComandoDeVersao d, GerenciadorDeRoteiros x, CancellationToken ct) => { await x.Excluir(id, d.Versao, ct); return Results.NoContent(); });
        g.MapPost("/{id:guid}/paradas", async (Guid id, [FromBody] DadosDaParada d, GerenciadorDeRoteiros x, CancellationToken ct) => { await x.Adicionar(id, d.Dados, d.Versao, ct); return Results.NoContent(); });
        g.MapPut("/{id:guid}/paradas/{paradaId:guid}", async (Guid id, Guid paradaId, [FromBody] DadosDaParada d, GerenciadorDeRoteiros x, CancellationToken ct) => { await x.AtualizarParada(id, paradaId, d.Dados, d.Versao, ct); return Results.NoContent(); });
        g.MapDelete("/{id:guid}/paradas/{paradaId:guid}", async (Guid id, Guid paradaId, [FromBody] ComandoDeVersao d, GerenciadorDeRoteiros x, CancellationToken ct) => { await x.RemoverParada(id, paradaId, d.Versao, ct); return Results.NoContent(); });
        g.MapPut("/{id:guid}/ordem", async (Guid id, [FromBody] AlterarOrdem d, GerenciadorDeRoteiros x, CancellationToken ct) => { await x.Reordenar(id, d.ParadaIds, d.Versao, ct); return Results.NoContent(); });
        g.MapPost("/{id:guid}/publicar", async (Guid id, [FromBody] ComandoDeVersao d, GerenciadorDeRoteiros x, CancellationToken ct) => { await x.Publicar(id, d.Versao, ct); return Results.NoContent(); });
        g.MapPost("/paradas/{id:guid}/iniciar", async (Guid id, [FromBody] ComandoDeVersao d, GerenciadorDeRoteiros x, CancellationToken ct) => { await x.IniciarParada(id, d.Versao, ct); return Results.NoContent(); });
        g.MapPost("/paradas/{id:guid}/concluir", async (Guid id, [FromBody] ComandoDeVersao d, GerenciadorDeRoteiros x, CancellationToken ct) => { await x.ConcluirParada(id, d.Versao, ct); return Results.NoContent(); });
        g.MapPost("/paradas/{id:guid}/adiar", async (Guid id, [FromBody] ComandoDeVersao d, GerenciadorDeRoteiros x, CancellationToken ct) => { await x.AdiarParada(id, d.Versao, ct); return Results.NoContent(); });
        g.MapPost("/paradas/{id:guid}/nao-realizar", async (Guid id, [FromBody] NaoRealizar d, GerenciadorDeRoteiros x, CancellationToken ct) => { await x.NaoRealizarParada(id, d.Motivo, d.Versao, ct); return Results.NoContent(); }); return e;
    }
    public sealed record CriarRoteiro(DateOnly Data, string NomeMotorista); public sealed record AtualizarRoteiro(string NomeMotorista, uint Versao); public sealed record ComandoDeVersao(uint Versao); public sealed record DadosDaParada(Guid ClienteId, TipoDaParada Tipo, string Periodo, string? Observacao, uint Versao) { public LavaMais.Crm.Modulos.Roteiros.Aplicacao.DadosDaParada Dados => new(ClienteId, Tipo, Periodo, Observacao); } public sealed record AlterarOrdem(IReadOnlyList<Guid> ParadaIds, uint Versao); public sealed record NaoRealizar(string Motivo, uint Versao);
    public sealed record Resposta(Guid Id, DateOnly Data, string NomeMotorista, SituacaoDoRoteiro Situacao, uint Versao, IReadOnlyList<RespostaParada> Paradas)
    { public static Resposta Criar(RoteiroDiario r) => new(r.Id, r.Data, r.NomeMotorista, r.Situacao, r.Versao, r.Paradas.OrderBy(x => x.Ordem).Select(RespostaParada.Criar).ToArray()); }
    public sealed record RespostaParada(Guid Id, Guid ClienteId, string NomeCliente, string Whatsapp, string EnderecoCompleto, TipoDaParada Tipo, string Periodo, string? Observacao, int Ordem, SituacaoDaParada Situacao, string? MotivoNaoRealizacao, DateTimeOffset? DataInicio, DateTimeOffset? DataConclusao)
    { public static RespostaParada Criar(ParadaDoRoteiro p) => new(p.Id, p.ClienteId, p.NomeCliente, p.Whatsapp, p.EnderecoCompleto, p.Tipo, p.Periodo, p.Observacao, p.Ordem, p.Situacao, p.MotivoNaoRealizacao, p.DataInicio, p.DataConclusao); }
}
