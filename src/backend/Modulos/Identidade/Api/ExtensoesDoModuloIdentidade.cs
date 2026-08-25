using System.Security.Claims;
using System.Text.Encodings.Web;
using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.Modulos.Identidade.Aplicacao;
using LavaMais.Crm.Modulos.Identidade.Infraestrutura;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Threading.RateLimiting;

namespace LavaMais.Crm.Modulos.Identidade.Api;

public static class ExtensoesDoModuloIdentidade
{
    public const string Esquema = "IdentidadeLocal";
    public static IServiceCollection AdicionarModuloIdentidade(this IServiceCollection servicos, IConfiguration configuracao)
    {
        servicos.AdicionarContextoDoModulo<ContextoDeIdentidade>(configuracao, ContextoDeIdentidade.Historico, ContextoDeIdentidade.Schema);
        servicos.Configure<OpcoesDeIdentidadeLocal>(configuracao.GetSection("IdentidadeLocal"));
        servicos.AddSingleton(TimeProvider.System); servicos.AddScoped<ServicoDeIdentidade>();
        servicos.AddAuthentication(Esquema).AddScheme<AuthenticationSchemeOptions, AutenticacaoLocalHandler>(Esquema, _ => { });
        servicos.AddRateLimiter(o => o.AddFixedWindowLimiter("login", x => { x.PermitLimit = 5; x.Window = TimeSpan.FromMinutes(1); x.QueueLimit = 0; }));
        return servicos;
    }
    public static IEndpointRouteBuilder MapearModuloIdentidade(this IEndpointRouteBuilder endpoints)
    {
        var grupo = endpoints.MapGroup("/api/v1/autenticacao").WithTags("Autenticacao");
        grupo.MapGet("/primeiro-acesso", async (ServicoDeIdentidade s, CancellationToken ct) => Results.Ok(new { disponivel = await s.PrimeiroAcessoDisponivel(ct) })).AllowAnonymous();
        grupo.MapPost("/primeiro-acesso", async (Credenciais r, ServicoDeIdentidade s, CancellationToken ct) => Results.Ok(await s.PrimeiroAcesso(r.Telefone, r.Senha, ct))).AllowAnonymous().RequireRateLimiting("login");
        grupo.MapPost("/entrar", async (Credenciais r, ServicoDeIdentidade s, CancellationToken ct) => Results.Ok(await s.Entrar(r.Telefone, r.Senha, ct))).AllowAnonymous().RequireRateLimiting("login");
        grupo.MapPost("/sair", async (HttpContext h, ServicoDeIdentidade s, CancellationToken ct) => { var token = h.Request.Headers.Authorization.ToString().Replace("Bearer ", "", StringComparison.OrdinalIgnoreCase); await s.Revogar(token, ct); return Results.NoContent(); }).RequireAuthorization();
        return endpoints;
    }
    public sealed record Credenciais(string Telefone, string Senha);
}

public sealed class AutenticacaoLocalHandler(IOptionsMonitor<AuthenticationSchemeOptions> opcoes, ContextoDeIdentidade banco, IAutorizacaoDaIdentidade autorizacao, TimeProvider relogio, ILoggerFactory logger, UrlEncoder encoder) : AuthenticationHandler<AuthenticationSchemeOptions>(opcoes, logger, encoder)
{
    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var cabecalho = Request.Headers.Authorization.ToString(); if (!cabecalho.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase)) return AuthenticateResult.NoResult();
        var hash = ServicoDeIdentidade.Hash(cabecalho[7..].Trim()); var agora = relogio.GetUtcNow();
        var sessao = await banco.Sessoes.AsNoTracking().SingleOrDefaultAsync(x => x.TokenHash == hash && x.DataRevogacao == null && x.ExpiraEm > agora);
        if (sessao is null) return AuthenticateResult.Fail("Sessao invalida ou expirada.");
        var usuario = await banco.Usuarios.AsNoTracking().SingleOrDefaultAsync(x => x.Id == sessao.UsuarioId && x.Ativo);
        if (usuario is null) return AuthenticateResult.Fail("Usuario inexistente ou inativo.");
        var papel = await autorizacao.ObterPapelAtivo(usuario.TenantId, usuario.Id.ToString(), Context.RequestAborted);
        if (papel is null) return AuthenticateResult.Fail("Usuario sem autorizacao ativa no CRM.");
        var claims = new[] { new Claim("sub", usuario.Id.ToString()), new Claim("tenant_id", usuario.TenantId.ToString()), new Claim("papel_crm", papel), new Claim("telefone", usuario.Telefone), new Claim("nome", usuario.Nome) };
        return AuthenticateResult.Success(new AuthenticationTicket(new ClaimsPrincipal(new ClaimsIdentity(claims, ExtensoesDoModuloIdentidade.Esquema)), ExtensoesDoModuloIdentidade.Esquema));
    }
}
