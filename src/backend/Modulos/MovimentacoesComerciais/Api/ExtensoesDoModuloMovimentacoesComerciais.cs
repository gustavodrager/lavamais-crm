using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Clientes;
using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using LavaMais.Crm.Modulos.MovimentacoesComerciais.Aplicacao;
using LavaMais.Crm.Modulos.MovimentacoesComerciais.Dominio;
using LavaMais.Crm.Modulos.MovimentacoesComerciais.Infraestrutura;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace LavaMais.Crm.Modulos.MovimentacoesComerciais.Api;

public static class ExtensoesDoModuloMovimentacoesComerciais
{
    public static IServiceCollection AdicionarModuloMovimentacoesComerciais(this IServiceCollection servicos, IConfiguration configuracao)
    {
        servicos.AdicionarContextoDoModulo<ContextoDeMovimentacoesComerciais>(configuracao, ContextoDeMovimentacoesComerciais.Historico, ContextoDeMovimentacoesComerciais.Schema);
        servicos.AddScoped<GerenciadorDeMovimentacoesComerciais>();
        servicos.AddScoped<ConsultaDeSugestoesDeAcoes>();
        servicos.AddScoped<IConsultaDeMovimentacoesParaClientes, ConsultaDeMovimentacoesParaClientes>();
        return servicos;
    }

    public static IEndpointRouteBuilder MapearModuloMovimentacoesComerciais(this IEndpointRouteBuilder endpoints)
    {
        var grupo = endpoints.MapGroup("/api/v1/movimentacoes-comerciais").RequireAuthorization(PoliticasDeAutorizacao.UsuarioAtivo).WithTags("Movimentacoes comerciais");
        grupo.MapGet("/", async (Guid? clienteId, int? limite, GerenciadorDeMovimentacoesComerciais g, CancellationToken ct) => (await g.Listar(clienteId, limite ?? 30, ct)).Select(Resposta.Criar));
        grupo.MapGet("/{id:guid}", async (Guid id, GerenciadorDeMovimentacoesComerciais g, CancellationToken ct) =>
            RespostaDetalhada.Criar(await g.Obter(id, ct) ?? throw new ExcecaoDeRecursoNaoEncontrado("Movimentacao comercial nao encontrada.")));
        grupo.MapPost("/", async (DadosDaMovimentacao dados, GerenciadorDeMovimentacoesComerciais g, CancellationToken ct) => { var movimentacao = await g.Registrar(dados, ct); return Results.Created($"/api/v1/movimentacoes-comerciais/{movimentacao.Id}", Resposta.Criar(movimentacao)); });
        grupo.MapPost("/{id:guid}/cancelar", async (Guid id, CancelarMovimentacao dados, GerenciadorDeMovimentacoesComerciais g, CancellationToken ct) => { await g.Cancelar(id, dados.Motivo, dados.Versao, ct); return Results.NoContent(); }).RequireAuthorization(PoliticasDeAutorizacao.Gestor);
        endpoints.MapGet("/api/v1/sugestoes-de-acoes", async (ConsultaDeSugestoesDeAcoes consulta, CancellationToken ct) => await consulta.Listar(ct))
            .RequireAuthorization(PoliticasDeAutorizacao.Administrador).WithTags("Sugestoes de acoes");
        return endpoints;
    }

    public sealed record CancelarMovimentacao(string Motivo, uint Versao);
    public sealed record Resposta(Guid Id, Guid ClienteId, string NomeCliente, decimal ValorTotal, DateTimeOffset DataMovimentacao, string? CodigoExterno, string? Observacao, OrigemDaMovimentacao Origem, SituacaoDaMovimentacao Situacao, uint Versao, IReadOnlyCollection<RespostaDaLinha> Linhas)
    { public static Resposta Criar(MovimentacaoComercial x) => new(x.Id, x.ClienteId, x.NomeClienteSnapshot, x.ValorTotal, x.DataMovimentacao, x.CodigoExterno, x.Observacao, x.Origem, x.Situacao, x.Versao, x.Linhas.Select(RespostaDaLinha.Criar).ToArray()); }
    public sealed record RespostaDetalhada(Guid Id, Guid ClienteId, string NomeCliente, decimal ValorTotal, DateTimeOffset DataMovimentacao, string? CodigoExterno, string? Observacao, OrigemDaMovimentacao Origem, SituacaoDaMovimentacao Situacao, DateTimeOffset DataCriacao, DateTimeOffset? DataCancelamento, string? MotivoCancelamento, uint Versao, IReadOnlyCollection<RespostaDaLinha> Linhas)
    { public static RespostaDetalhada Criar(MovimentacaoComercial x) => new(x.Id, x.ClienteId, x.NomeClienteSnapshot, x.ValorTotal, x.DataMovimentacao, x.CodigoExterno, x.Observacao, x.Origem, x.Situacao, x.DataCriacao, x.DataCancelamento, x.MotivoCancelamento, x.Versao, x.Linhas.Select(RespostaDaLinha.Criar).ToArray()); }
    public sealed record RespostaDaLinha(Guid Id, Guid OfertaDeServicoId, Guid ArtigoDeLavanderiaId, string NomeArtigo, Guid ServicoDeLavanderiaId, string NomeServico, int Quantidade, decimal PrecoTabela, decimal PrecoUnitario, decimal Subtotal)
    { public static RespostaDaLinha Criar(LinhaDaMovimentacao x) => new(x.Id, x.OfertaDeServicoId, x.ArtigoDeLavanderiaId, x.NomeArtigoSnapshot, x.ServicoDeLavanderiaId, x.NomeServicoSnapshot, x.Quantidade, x.PrecoTabelaSnapshot, x.PrecoUnitarioPraticado, x.Subtotal); }
}
