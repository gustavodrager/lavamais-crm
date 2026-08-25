using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
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
        servicos.AddScoped<GerenciadorDeMovimentacoesComerciais>(); return servicos;
    }

    public static IEndpointRouteBuilder MapearModuloMovimentacoesComerciais(this IEndpointRouteBuilder endpoints)
    {
        var grupo = endpoints.MapGroup("/api/v1/movimentacoes-comerciais").RequireAuthorization(PoliticasDeAutorizacao.UsuarioAtivo).WithTags("Movimentacoes comerciais");
        grupo.MapGet("/", async (Guid? clienteId, int? limite, GerenciadorDeMovimentacoesComerciais g, CancellationToken ct) => (await g.Listar(clienteId, limite ?? 30, ct)).Select(Resposta.Criar));
        grupo.MapPost("/", async (DadosDaMovimentacao dados, GerenciadorDeMovimentacoesComerciais g, CancellationToken ct) => { var movimentacao = await g.Registrar(dados, ct); return Results.Created($"/api/v1/movimentacoes-comerciais/{movimentacao.Id}", Resposta.Criar(movimentacao)); });
        grupo.MapPost("/{id:guid}/cancelar", async (Guid id, CancelarMovimentacao dados, GerenciadorDeMovimentacoesComerciais g, CancellationToken ct) => { await g.Cancelar(id, dados.Motivo, dados.Versao, ct); return Results.NoContent(); }).RequireAuthorization(PoliticasDeAutorizacao.Gestor);
        return endpoints;
    }

    public sealed record CancelarMovimentacao(string Motivo, uint Versao);
    public sealed record Resposta(Guid Id, Guid ClienteId, string NomeCliente, Guid ItemDeCatalogoId, string NomeItem, decimal ValorTotal, DateTimeOffset DataMovimentacao, string? CodigoExterno, string? Observacao, OrigemDaMovimentacao Origem, SituacaoDaMovimentacao Situacao, uint Versao)
    { public static Resposta Criar(MovimentacaoComercial x) => new(x.Id, x.ClienteId, x.NomeClienteSnapshot, x.ItemDeCatalogoId, x.NomeItemSnapshot, x.ValorTotal, x.DataMovimentacao, x.CodigoExterno, x.Observacao, x.Origem, x.Situacao, x.Versao); }
}
