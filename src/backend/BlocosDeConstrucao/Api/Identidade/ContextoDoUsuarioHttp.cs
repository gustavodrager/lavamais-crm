using System.Security.Claims;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;

namespace LavaMais.Crm.BlocosDeConstrucao.Api.Identidade;

public sealed class ContextoDoUsuarioHttp(IHttpContextAccessor acessor) : IContextoDoUsuario
{
    private ClaimsPrincipal? Principal => acessor.HttpContext?.User;

    public bool Autenticado => Principal?.Identity?.IsAuthenticated == true;

    public Guid TenantId => Guid.TryParse(Principal?.FindFirstValue("tenant_id"), out var tenantId)
        ? tenantId
        : throw new InvalidOperationException("O usuario autenticado nao possui tenant_id valido.");

    public string UsuarioIdentidadeId => Principal?.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? Principal?.FindFirstValue("sub")
        ?? throw new InvalidOperationException("O usuario autenticado nao possui sub.");
}
