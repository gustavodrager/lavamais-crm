using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.MovimentacoesComerciais;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;
using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using LavaMais.Crm.Modulos.Clientes.Aplicacao;
using LavaMais.Crm.Modulos.Clientes.Dominio;
using LavaMais.Crm.Modulos.Clientes.Infraestrutura;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace LavaMais.Crm.Modulos.Clientes.Api;

public static class ExtensoesDoModuloClientes
{
    public static IServiceCollection AdicionarModuloClientes(this IServiceCollection servicos, IConfiguration configuracao)
    {
        servicos.AdicionarContextoDoModulo<ContextoDeClientes>(configuracao, ContextoDeClientes.TabelaDeHistoricoDasMigrations, ContextoDeClientes.Schema);
        servicos.AddScoped<GerenciadorDeClientes>(); servicos.AddScoped<ConsultaDeClientesParaSegmentacao>(); servicos.AddScoped<IConsultaDeClienteParaMovimentacao, ConsultaDeClienteParaMovimentacao>(); return servicos;
    }

    public static IEndpointRouteBuilder MapearModuloClientes(this IEndpointRouteBuilder endpoints)
    {
        var clientes = endpoints.MapGroup("/api/v1/clientes").RequireAuthorization(PoliticasDeAutorizacao.UsuarioAtivo).WithTags("Clientes");
        clientes.MapGet("/", async (string? busca, int pagina, int tamanhoPagina, GerenciadorDeClientes g, CancellationToken ct) =>
        {
            var resultado = await g.Listar(busca, pagina, tamanhoPagina == 0 ? 20 : tamanhoPagina, ct);
            return Results.Ok(new { itens = resultado.Itens.Select(RespostaDeCliente.Criar), total = resultado.Total, pagina = Math.Max(1, pagina), tamanhoPagina = tamanhoPagina == 0 ? 20 : Math.Clamp(tamanhoPagina, 1, 100) });
        });
        clientes.MapGet("/{id:guid}", async (Guid id, GerenciadorDeClientes g, CancellationToken ct) =>
        {
            var cliente = await g.Obter(id, ct) ?? throw new ExcecaoDeRecursoNaoEncontrado("Cliente nao encontrado.");
            return Results.Ok(RespostaDeCliente.Criar(cliente));
        });
        clientes.MapPost("/", async (DadosDoCliente dados, GerenciadorDeClientes g, CancellationToken ct) =>
        { var cliente = await g.Criar(dados, ct); return Results.Created($"/api/v1/clientes/{cliente.Id}", RespostaDeCliente.Criar(cliente)); });
        clientes.MapPut("/{id:guid}", async (Guid id, DadosDoCliente dados, GerenciadorDeClientes g, CancellationToken ct) => { await g.Atualizar(id, dados, ct); return Results.NoContent(); });
        clientes.MapPost("/{id:guid}/inativar", async (Guid id, GerenciadorDeClientes g, CancellationToken ct) => { await g.Inativar(id, ct); return Results.NoContent(); });

        var etiquetas = endpoints.MapGroup("/api/v1/etiquetas").RequireAuthorization(PoliticasDeAutorizacao.UsuarioAtivo).WithTags("Clientes");
        etiquetas.MapGet("/", async (GerenciadorDeClientes g, CancellationToken ct) => (await g.ListarEtiquetas(ct)).Select(x => new { x.Id, x.Nome }));
        etiquetas.MapPost("/", async (CriarEtiqueta requisicao, GerenciadorDeClientes g, CancellationToken ct) => { var e = await g.CriarEtiqueta(requisicao.Nome, ct); return Results.Created($"/api/v1/etiquetas/{e.Id}", new { e.Id, e.Nome }); })
            .RequireAuthorization(PoliticasDeAutorizacao.Gestor);
        return endpoints;
    }

    public sealed record CriarEtiqueta(string Nome);
    public sealed record RespostaDeCliente(Guid Id, string Nome, string? NomeFantasia, string? Tipo, string Whatsapp, string? Email, DateOnly? DataNascimento, SituacaoDoCliente Situacao, bool PermiteMarketingWhatsapp, DadosDoEndereco? Endereco, IReadOnlyCollection<Guid> EtiquetaIds, string? CodigoExterno, DateTimeOffset? DataCadastroOrigem)
    {
        public static RespostaDeCliente Criar(Cliente c)
        {
            var whatsapp = c.Contatos.Single(x => x.Tipo == TipoDeContato.Whatsapp).ValorNormalizado;
            var email = c.Contatos.SingleOrDefault(x => x.Tipo == TipoDeContato.Email)?.ValorNormalizado;
            var permissao = c.Permissoes.SingleOrDefault(x => x.Canal == TipoDeContato.Whatsapp && x.Finalidade == "Marketing")?.Permitida ?? false;
            var endereco = c.Endereco is null ? null : new DadosDoEndereco(c.Endereco.Logradouro, c.Endereco.Numero, c.Endereco.Complemento, c.Endereco.Bairro, c.Endereco.Cidade, c.Endereco.Estado, c.Endereco.Cep);
            return new(c.Id, c.Nome, c.NomeFantasia, c.Tipo, whatsapp, email, c.DataNascimento, c.Situacao, permissao, endereco, c.Etiquetas.Select(x => x.EtiquetaId).ToArray(), c.CodigoExterno, c.DataCadastroOrigem);
        }
    }
}
