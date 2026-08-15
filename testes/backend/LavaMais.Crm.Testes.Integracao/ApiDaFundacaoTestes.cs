using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

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

    private static WebApplicationFactory<Program> CriarFabrica() =>
        new WebApplicationFactory<Program>().WithWebHostBuilder(construtor => construtor.ConfigureAppConfiguration((_, configuracao) =>
            configuracao.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:Crm"] = "Host=localhost;Port=1;Database=teste;Username=teste;Password=teste;Timeout=1"
            })));
}
