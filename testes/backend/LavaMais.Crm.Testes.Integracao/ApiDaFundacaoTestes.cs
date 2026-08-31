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
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

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
        Assert.Equal("nosniff", resposta.Headers.GetValues("X-Content-Type-Options").Single());
        Assert.Equal("DENY", resposta.Headers.GetValues("X-Frame-Options").Single());
        Assert.Contains("no-store", resposta.Headers.CacheControl?.ToString());
    }

    [Fact]
    public async Task Deve_substituir_correlation_id_acima_do_limite()
    {
        await using var fabrica = CriarFabrica();
        using var cliente = fabrica.CreateClient();
        using var requisicao = new HttpRequestMessage(HttpMethod.Get, "/saude/vivo");
        requisicao.Headers.Add("X-Correlation-Id", new string('a', 129));

        using var resposta = await cliente.SendAsync(requisicao, TestContext.Current.CancellationToken);

        var correlacao = resposta.Headers.GetValues("X-Correlation-Id").Single();
        Assert.True(Guid.TryParse(correlacao, out _));
    }

    [Fact]
    public async Task Deve_publicar_documento_openapi()
    {
        await using var fabrica = CriarFabrica();
        using var cliente = fabrica.CreateClient();

        using var resposta = await cliente.GetAsync("/openapi/v1.json", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, resposta.StatusCode);
        Assert.Equal("application/json", resposta.Content.Headers.ContentType?.MediaType);
        var contrato = await resposta.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);
        Assert.Contains("/api/v1/acoes-comerciais/{acaoId}/destinatarios/{destinatarioId}/enviar", contrato);
        Assert.Contains("/api/v1/capacidades", contrato);
        Assert.DoesNotContain("/api/v1/webhooks/whatsmiau", contrato);
        Assert.DoesNotContain("/api/v1/acoes-comerciais/{id}/iniciar", contrato);
    }

    [Fact]
    public void Deve_permitir_envio_individual_para_operacao_e_remover_inicio_coletivo()
    {
        using var fabrica = CriarFabrica();
        var rotas = fabrica.Services.GetRequiredService<EndpointDataSource>().Endpoints.OfType<RouteEndpoint>().ToArray();

        var envio = Assert.Single(rotas, x => x.RoutePattern.RawText == "/api/v1/acoes-comerciais/{acaoId:guid}/destinatarios/{destinatarioId:guid}/enviar");

        Assert.Contains(envio.Metadata.GetOrderedMetadata<IAuthorizeData>(), x => x.Policy == PoliticasDeAutorizacao.EnvioIndividual);
        Assert.DoesNotContain(rotas, x => x.RoutePattern.RawText == "/api/v1/acoes-comerciais/{id:guid}/iniciar");
    }

    [Fact]
    public void Deve_aplicar_perfis_nas_configuracoes_comerciais()
    {
        using var fabrica = CriarFabrica();
        var rotas = fabrica.Services.GetRequiredService<EndpointDataSource>().Endpoints.OfType<RouteEndpoint>().ToArray();

        AssertPolitica(HttpMethods.Post, "/api/v1/itens-de-catalogo/", PoliticasDeAutorizacao.Gestor);
        AssertPolitica(HttpMethods.Put, "/api/v1/itens-de-catalogo/{id:guid}", PoliticasDeAutorizacao.Gestor);
        AssertPolitica(HttpMethods.Post, "/api/v1/etiquetas/", PoliticasDeAutorizacao.Gestor);
        AssertPolitica(HttpMethods.Post, "/api/v1/modelos-de-mensagem/", PoliticasDeAutorizacao.Gestor);
        AssertPolitica(HttpMethods.Post, "/api/v1/modelos-de-mensagem/{id:guid}/publicar", PoliticasDeAutorizacao.Gestor);
        return;

        void AssertPolitica(string metodo, string rota, string politica)
        {
            var endpoint = Assert.Single(rotas, endpoint =>
                endpoint.RoutePattern.RawText == rota
                && endpoint.Metadata.GetMetadata<HttpMethodMetadata>()?.HttpMethods.Contains(metodo) == true);
            Assert.Contains(endpoint.Metadata.GetOrderedMetadata<IAuthorizeData>(), autorizacao => autorizacao.Policy == politica);
        }
    }

    [Theory]
    [InlineData("/api/v1/usuarios-crm")]
    [InlineData("/api/v1/itens-de-catalogo")]
    [InlineData("/api/v1/modelos-de-mensagem")]
    [InlineData("/api/v1/acoes-comerciais")]
    [InlineData("/api/v1/auditoria")]
    [InlineData("/api/v1/capacidades")]
    public async Task Deve_exigir_autenticacao_nos_endpoints_empresariais(string rota)
    {
        await using var fabrica = CriarFabrica();
        using var cliente = fabrica.CreateClient();

        using var resposta = await cliente.GetAsync(rota, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, resposta.StatusCode);
    }

    [Fact]
    public async Task Webhook_deve_responder_ok_sem_revelar_segredo_valido()
    {
        await using var fabrica = CriarFabrica();
        using var cliente = fabrica.CreateClient();
        using var conteudo = new StringContent("{\"event\":\"messages.update\"}", System.Text.Encoding.UTF8, "application/json");

        using var resposta = await cliente.PostAsync(
            "/api/v1/webhooks/whatsmiau/segredo-incorreto",
            conteudo,
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, resposta.StatusCode);
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
