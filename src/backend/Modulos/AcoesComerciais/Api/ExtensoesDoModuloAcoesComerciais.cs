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
        var grupo = endpoints.MapGroup("/api/v1/acoes-comerciais").RequireAuthorization(PoliticasDeAutorizacao.UsuarioAtivo).WithTags("Acoes comerciais");
        grupo.MapGet("/", async (GerenciadorDeAcoesComerciais g, CancellationToken ct) => (await g.Listar(ct)).Select(Resposta.Criar));
        grupo.MapGet("/{id:guid}", async (Guid id, GerenciadorDeAcoesComerciais g, CancellationToken ct) => DetalheResposta.Criar(await g.ObterDetalhe(id, ct) ?? throw new ExcecaoDeRecursoNaoEncontrado("Acao comercial nao encontrada.")));
        grupo.MapPost("/", async (DadosDoRascunho dados, GerenciadorDeAcoesComerciais g, CancellationToken ct) => { var acao = await g.Criar(dados, ct); return Results.Created($"/api/v1/acoes-comerciais/{acao.Id}", Resposta.Criar(acao)); }).RequireAuthorization(PoliticasDeAutorizacao.Gestor);
        grupo.MapPut("/{id:guid}", async (Guid id, DadosDoRascunho dados, GerenciadorDeAcoesComerciais g, CancellationToken ct) => { await g.Atualizar(id, dados, ct); return Results.NoContent(); }).RequireAuthorization(PoliticasDeAutorizacao.Gestor);
        grupo.MapPost("/{id:guid}/simular-publico", async (Guid id, int pagina, int tamanhoPagina, GerenciadorDeAcoesComerciais g, CancellationToken ct) => Results.Ok(await g.Simular(id, pagina, tamanhoPagina, ct))).RequireAuthorization(PoliticasDeAutorizacao.Gestor);
        grupo.MapPost("/{id:guid}/preparar", async (Guid id, PrepararAcao dados, GerenciadorDeAcoesComerciais g, CancellationToken ct) => { await g.Preparar(id, dados.Versao, ct); return Results.NoContent(); }).RequireAuthorization(PoliticasDeAutorizacao.Gestor);
        grupo.MapPost("/{id:guid}/cancelar", async (Guid id, CancelarAcao dados, GerenciadorDeAcoesComerciais g, CancellationToken ct) => { await g.Cancelar(id, dados.Motivo, dados.Versao, ct); return Results.NoContent(); }).RequireAuthorization(PoliticasDeAutorizacao.Gestor);
        grupo.MapPost("/{acaoId:guid}/destinatarios/{destinatarioId:guid}/enviar", async (Guid acaoId, Guid destinatarioId, EnviarDestinatario dados, GerenciadorDeAcoesComerciais g, IDisponibilidadeDeNotificacoes notificacoes, CancellationToken ct) =>
        {
            if (!notificacoes.Habilitado)
                return Results.Problem(statusCode: StatusCodes.Status503ServiceUnavailable, title: "Envio de notificacoes indisponivel", detail: "O envio de notificacoes nao esta habilitado neste ambiente.");
            return Results.Accepted((string?)null, await g.EnviarDestinatario(acaoId, destinatarioId, dados.Versao, ct));
        }).RequireAuthorization(PoliticasDeAutorizacao.EnvioIndividual);
        grupo.MapGet("/{id:guid}/destinatarios", async (Guid id, GerenciadorDeAcoesComerciais g, CancellationToken ct) => (await g.ListarDestinatarios(id, ct)).Select(DestinatarioResposta.Criar));

        endpoints.MapPut("/api/v1/acoes-comerciais/{id:guid}/destinatarios/{destinatarioId:guid}/resultado", async (Guid id, Guid destinatarioId, RegistrarResultado dados, GerenciadorDeAcoesComerciais g, CancellationToken ct) =>
        { await g.RegistrarResultado(id, destinatarioId, dados.Resultado, dados.ValorConvertido, dados.Versao, ct); return Results.NoContent(); })
            .RequireAuthorization(PoliticasDeAutorizacao.UsuarioAtivo).WithTags("Acoes comerciais");
        return endpoints;
    }

    public sealed record PrepararAcao(uint Versao);
    public sealed record CancelarAcao(string Motivo, uint Versao);
    public sealed record EnviarDestinatario(uint Versao);
    public sealed record RegistrarResultado(ResultadoComercial Resultado, decimal? ValorConvertido, uint Versao);

    public sealed record DestinatarioResposta(Guid Id, Guid ClienteId, string NomeCliente, string Destino, string ConteudoPreVisualizacao, SituacaoDoEnvio SituacaoEnvio, ResultadoComercial ResultadoComercial, decimal? ValorConvertido, DateTimeOffset? DataResultadoComercial, string? CodigoFalha, uint Versao)
    { public static DestinatarioResposta Criar(DestinatarioDaAcao d) => new(d.Id, d.ClienteId, d.NomeClienteSnapshot, d.DestinoSnapshot, d.ConteudoPreVisualizacaoSnapshot, d.SituacaoEnvio, d.ResultadoComercial, d.ValorConvertido, d.DataResultadoComercial, d.CodigoFalha, d.Versao); }

    public sealed record TotaisDaAcao(int Destinatarios, int Pendentes, int AguardandoSolicitacao, int Solicitados, int Enviados, int Entregues, int Lidos, int Falhos, int NaoInformados, int SemRetorno, int Responderam, int Interessados, int Convertidos, int SemInteresse, decimal ValorConvertido);
    public sealed record DetalheResposta(Resposta Acao, TotaisDaAcao Totais, IReadOnlyCollection<DestinatarioResposta> Destinatarios)
    {
        public static DetalheResposta Criar(AcaoComercial acao)
        {
            var d = acao.Destinatarios;
            var totais = new TotaisDaAcao(d.Count, d.Count(x => x.SituacaoEnvio == SituacaoDoEnvio.Pendente), d.Count(x => x.SituacaoEnvio == SituacaoDoEnvio.AguardandoSolicitacao), d.Count(x => x.SituacaoEnvio == SituacaoDoEnvio.Solicitado), d.Count(x => x.SituacaoEnvio == SituacaoDoEnvio.Enviado), d.Count(x => x.SituacaoEnvio == SituacaoDoEnvio.Entregue), d.Count(x => x.SituacaoEnvio == SituacaoDoEnvio.Lido), d.Count(x => x.SituacaoEnvio == SituacaoDoEnvio.Falhou), d.Count(x => x.ResultadoComercial == ResultadoComercial.NaoInformado), d.Count(x => x.ResultadoComercial == ResultadoComercial.SemRetorno), d.Count(x => x.ResultadoComercial == ResultadoComercial.Respondeu), d.Count(x => x.ResultadoComercial == ResultadoComercial.Interessado), d.Count(x => x.ResultadoComercial == ResultadoComercial.Convertido), d.Count(x => x.ResultadoComercial == ResultadoComercial.NaoTemInteresse), d.Sum(x => x.ValorConvertido ?? 0));
            return new(Resposta.Criar(acao), totais, d.OrderBy(x => x.NomeClienteSnapshot).Select(DestinatarioResposta.Criar).ToArray());
        }
    }

    public sealed record Resposta(
        Guid Id,
        string Nome,
        string? Objetivo,
        Guid? ItemDeCatalogoId,
        Guid? VersaoModeloId,
        CriteriosDeSegmentacao Criterios,
        SituacaoDaAcaoComercial Situacao,
        DateTimeOffset DataAtualizacao,
        uint Versao,
        int QuantidadeDestinatarios,
        int MensagensParaEnviar,
        int FalhasParaRevisar,
        int RetornosParaRegistrar,
        int ResultadosRegistrados)
    {
        private static readonly JsonSerializerOptions OpcoesJson = new(JsonSerializerDefaults.Web);
        public static Resposta Criar(AcaoComercial acao)
        {
            var destinatarios = acao.Destinatarios;
            var retornos = destinatarios.Count(x =>
                x.ResultadoComercial == ResultadoComercial.NaoInformado
                && x.SituacaoEnvio is SituacaoDoEnvio.Enviado or SituacaoDoEnvio.Entregue or SituacaoDoEnvio.Lido);
            return new(
                acao.Id,
                acao.Nome,
                acao.Objetivo,
                acao.ItemDeCatalogoId,
                acao.VersaoModeloId,
                JsonSerializer.Deserialize<CriteriosDeSegmentacao>(acao.CriteriosSegmentacaoJson, OpcoesJson)!,
                acao.Situacao,
                acao.DataAtualizacao,
                acao.Versao,
                acao.QuantidadeDestinatarios,
                destinatarios.Count(x => x.SituacaoEnvio == SituacaoDoEnvio.Pendente),
                destinatarios.Count(x => x.SituacaoEnvio == SituacaoDoEnvio.Falhou),
                retornos,
                destinatarios.Count(x => x.ResultadoComercial != ResultadoComercial.NaoInformado));
        }
    }
}
