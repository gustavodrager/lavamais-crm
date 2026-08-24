using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace LavaMais.Crm.Api;

public sealed class OpcoesDaHomologacaoSemAutenticacao
{
    public const string Secao = "HomologacaoSemAutenticacao";
    public const string Esquema = "HomologacaoSemAutenticacao";

    public bool Habilitado { get; set; }
    public Guid TenantId { get; set; }
    public string UsuarioId { get; set; } = "homologacao";
    public string Papel { get; set; } = "Administrador";
}

public sealed class AutenticacaoDeHomologacaoHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> opcoes,
    IOptions<OpcoesDaHomologacaoSemAutenticacao> homologacao,
    ILoggerFactory logger,
    UrlEncoder encoder) : AuthenticationHandler<AuthenticationSchemeOptions>(opcoes, logger, encoder)
{
    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var configuracao = homologacao.Value;
        var claims = new[]
        {
            new Claim("sub", configuracao.UsuarioId),
            new Claim("tenant_id", configuracao.TenantId.ToString()),
            new Claim("papel_crm", configuracao.Papel)
        };
        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, OpcoesDaHomologacaoSemAutenticacao.Esquema));
        var ticket = new AuthenticationTicket(principal, OpcoesDaHomologacaoSemAutenticacao.Esquema);
        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
