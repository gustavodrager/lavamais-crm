using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using System.Text.Encodings.Web;

namespace LavaMais.Crm.Testes.Integracao;

public sealed class ApiDaFundacaoTestes
{
    [Fact]
    public async Task Deve_expor_verificacao_de_vida_e_correlation_id()
    {
        await using var fabrica = CriarFabrica();
        using var cliente = fabrica.CreateClient();
        using var requisicao = new HttpRequestMessage(HttpMethod.Get, "/saude/vivo");
        requisicao.Headers.Add("X-Correlation-Id", "correlacao-do-teste");

        using var resposta = await cliente.SendAsync(requisicao, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, resposta.StatusCode);
        Assert.Equal("correlacao-do-teste", resposta.Headers.GetValues("X-Correlation-Id").Single());
    }

    [Fact]
    public async Task Deve_publicar_documento_openapi()
    {
        await using var fabrica = CriarFabrica();
        using var cliente = fabrica.CreateClient();

        using var resposta = await cliente.GetAsync("/openapi/v1.json", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, resposta.StatusCode);
        Assert.Equal("application/json", resposta.Content.Headers.ContentType?.MediaType);
    }

    [Theory]
    [InlineData("/api/v1/usuarios-crm")]
    [InlineData("/api/v1/itens-de-catalogo")]
    [InlineData("/api/v1/modelos-de-mensagem")]
    public async Task Deve_exigir_autenticacao_nos_endpoints_empresariais(string rota)
    {
        await using var fabrica = CriarFabrica();
        using var cliente = fabrica.CreateClient();

        using var resposta = await cliente.GetAsync(rota, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, resposta.StatusCode);
    }

    [Fact]
    public async Task Deve_negar_usuario_autenticado_sem_tenant()
    {
        await using var fabrica = CriarFabrica();
        using var cliente = fabrica.CreateClient();
        cliente.DefaultRequestHeaders.Add("X-Test-Sub", "usuario-sem-tenant");

        using var resposta = await cliente.GetAsync("/api/v1/usuarios-crm", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, resposta.StatusCode);
    }

    private static WebApplicationFactory<Program> CriarFabrica() =>
        new WebApplicationFactory<Program>().WithWebHostBuilder(construtor =>
        {
            construtor.ConfigureAppConfiguration((_, configuracao) => configuracao.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:Crm"] = "Host=localhost;Port=1;Database=teste;Username=teste;Password=teste;Timeout=1"
            }));
            construtor.ConfigureTestServices(servicos => servicos.AddAuthentication(opcoes =>
            {
                opcoes.DefaultAuthenticateScheme = AutenticacaoDeTesteHandler.Esquema;
                opcoes.DefaultChallengeScheme = AutenticacaoDeTesteHandler.Esquema;
                opcoes.DefaultForbidScheme = AutenticacaoDeTesteHandler.Esquema;
            }).AddScheme<AuthenticationSchemeOptions, AutenticacaoDeTesteHandler>(AutenticacaoDeTesteHandler.Esquema, _ => { }));
        });

    private sealed class AutenticacaoDeTesteHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> opcoes,
        ILoggerFactory logger,
        UrlEncoder encoder) : AuthenticationHandler<AuthenticationSchemeOptions>(opcoes, logger, encoder)
    {
        public const string Esquema = "AutenticacaoDeTeste";

        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            if (!Request.Headers.TryGetValue("X-Test-Sub", out var sub))
                return Task.FromResult(AuthenticateResult.NoResult());

            var claims = new List<Claim> { new("sub", sub.ToString()) };
            if (Request.Headers.TryGetValue("X-Test-Tenant", out var tenant))
                claims.Add(new Claim("tenant_id", tenant.ToString()));

            var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, Esquema));
            return Task.FromResult(AuthenticateResult.Success(new AuthenticationTicket(principal, Esquema)));
        }
    }
}
