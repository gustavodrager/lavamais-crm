using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Auditoria;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using LavaMais.Crm.Modulos.Auditoria.Aplicacao;
using LavaMais.Crm.Modulos.Auditoria.Infraestrutura;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace LavaMais.Crm.Modulos.Auditoria.Api;

public static class ExtensoesDoModuloAuditoria
{
    public static IServiceCollection AdicionarModuloAuditoria(this IServiceCollection servicos, IConfiguration configuracao)
    {
        servicos.AdicionarContextoDoModulo<ContextoDeAuditoria>(configuracao, ContextoDeAuditoria.Historico, ContextoDeAuditoria.Schema);
        servicos.AddScoped<RegistradorDeAuditoria>(); servicos.AddScoped<IRegistradorDeAuditoria>(p => p.GetRequiredService<RegistradorDeAuditoria>()); return servicos;
    }
    public static IEndpointRouteBuilder MapearModuloAuditoria(this IEndpointRouteBuilder endpoints)
    {
        var grupo = endpoints.MapGroup("/api/v1/auditoria").RequireAuthorization(PoliticasDeAutorizacao.Administrador).WithTags("Auditoria");
        grupo.MapGet("/", async (string? recurso, Guid? recursoId, RegistradorDeAuditoria g, CancellationToken ct) => await g.Listar(recurso, recursoId, ct));
        grupo.MapGet("/{id:guid}", async (Guid id, RegistradorDeAuditoria g, CancellationToken ct) => await g.Obter(id, ct) ?? throw new ExcecaoDeRecursoNaoEncontrado("Registro de auditoria nao encontrado.")); return endpoints;
    }
}
