using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.Modulos.Autorizacao.Dominio;
using LavaMais.Crm.Modulos.Autorizacao.Infraestrutura;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace LavaMais.Crm.Modulos.Autorizacao.Aplicacao;

public sealed class TratadorDePapelDoCrm(ContextoDeAutorizacao banco, IContextoDoUsuario usuarioAtual)
    : AuthorizationHandler<RequisitoDePapelDoCrm>
{
    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, RequisitoDePapelDoCrm requirement)
    {
        if (!usuarioAtual.Autenticado) return;
        if (!Guid.TryParse(context.User.FindFirst("tenant_id")?.Value, out _)) return;
        if (string.IsNullOrWhiteSpace(context.User.FindFirst("sub")?.Value)) return;

        var usuario = await banco.UsuariosCrm.AsNoTracking().SingleOrDefaultAsync(
            item => item.UsuarioIdentidadeId == usuarioAtual.UsuarioIdentidadeId && item.Situacao == SituacaoDoUsuarioCrm.Ativo);

        if (usuario is not null && (requirement.Papel is null || usuario.Papel == requirement.Papel || usuario.Papel == requirement.PapelAlternativo))
            context.Succeed(requirement);
    }
}
