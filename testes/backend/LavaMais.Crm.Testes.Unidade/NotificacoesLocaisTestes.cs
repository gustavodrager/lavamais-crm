using System.Net;
using System.Text;
using LavaMais.Crm.BlocosDeConstrucao.Api.Observabilidade;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Integracoes;
using LavaMais.Crm.Modulos.Integracoes.Aplicacao;
using LavaMais.Crm.Modulos.Integracoes.Dominio;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace LavaMais.Crm.Testes.Unidade;

public sealed class NotificacoesLocaisTestes
{
    [Fact]
    public async Task Deve_enviar_texto_pelo_contrato_do_whatsmiau()
    {
        var manipulador = new ManipuladorFalso(HttpStatusCode.OK, "{\"key\":{\"id\":\"mensagem-123\"}}");
        using var http = new HttpClient(manipulador) { BaseAddress = new Uri("https://api.whatsmiau.dev/v2/") };
        var opcoes = Options.Create(new OpcoesDeNotificacoes
        {
            Modo = ModoDeNotificacoes.Local,
            WhatsMiau = new OpcoesDoWhatsMiau
            {
                BaseUrl = http.BaseAddress.ToString(),
                ApiKey = "chave-teste",
                NomeInstancia = "LavaMais CRM",
                SegredoWebhook = "segredo-de-webhook-comprido"
            }
        });

        var id = await new ClienteWhatsMiau(http, opcoes).EnviarTexto(
            "+55 (13) 99999-9999",
            "Ola, cliente!",
            TestContext.Current.CancellationToken);

        Assert.Equal("mensagem-123", id);
        Assert.Equal("https://api.whatsmiau.dev/v2/message/sendText/LavaMais%20CRM", manipulador.Url);
        Assert.Equal("chave-teste", manipulador.ApiKey);
        Assert.Contains("\"number\":\"5513999999999\"", manipulador.Corpo);
        Assert.Contains("\"text\":\"Ola, cliente!\"", manipulador.Corpo);
    }

    [Fact]
    public async Task Deve_priorizar_entrega_ao_consultar_a_central()
    {
        using var http = new HttpClient(new ManipuladorDaCentral())
        {
            BaseAddress = new Uri("https://central.test")
        };
        var opcoes = Options.Create(new OpcoesDeNotificacoes
        {
            Modo = ModoDeNotificacoes.Central,
            Central = new OpcoesDaCentralDeNotificacoes
            {
                BaseUrl = http.BaseAddress.ToString(),
                ApiKey = "chave-central",
                Origem = "lavamais-crm"
            }
        });

        var estado = await new PortaCentralDeNotificacoes(http, opcoes).Obter(
            "notificacao-1",
            TestContext.Current.CancellationToken);

        Assert.Equal(SituacaoTecnicaDaNotificacao.Entregue, estado.Situacao);
    }

    [Theory]
    [InlineData("SERVER_ACK", SituacaoDeEntregaLocal.Submetida)]
    [InlineData("DELIVERY_ACK", SituacaoDeEntregaLocal.Entregue)]
    [InlineData("READ", SituacaoDeEntregaLocal.Lida)]
    [InlineData("PLAYED", SituacaoDeEntregaLocal.Lida)]
    [InlineData("FAILED", SituacaoDeEntregaLocal.NaoEntregue)]
    public void Deve_converter_status_do_webhook(string status, SituacaoDeEntregaLocal esperado)
    {
        Assert.True(ConversorDeStatusWhatsMiau.TentarConverter(status, out var obtido));
        Assert.Equal(esperado, obtido);
    }

    [Fact]
    public void Nao_deve_regredir_estado_de_entrega()
    {
        var agora = DateTimeOffset.UtcNow;
        var solicitacao = new SolicitacaoDeNotificacao(
            "Whatsapp",
            "oferta",
            "acao:1:destinatario:1:v1",
            "Cliente",
            "5513999999999",
            "Ola!",
            new Dictionary<string, string>());
        var notificacao = NotificacaoLocal.Criar(Guid.NewGuid(), solicitacao, "{}", agora);

        notificacao.RegistrarTentativa(agora);
        Assert.Equal(SituacaoTecnicaDaNotificacao.Processando, notificacao.Consolidar().Situacao);
        notificacao.RegistrarEnvio("mensagem-1", agora);
        notificacao.AtualizarEntrega(SituacaoDeEntregaLocal.Entregue, agora.AddMinutes(1));
        notificacao.AtualizarEntrega(SituacaoDeEntregaLocal.Submetida, agora.AddMinutes(2));
        notificacao.AtualizarEntrega(SituacaoDeEntregaLocal.Lida, agora.AddMinutes(3));
        notificacao.AtualizarEntrega(SituacaoDeEntregaLocal.NaoEntregue, agora.AddMinutes(4));

        Assert.Equal(SituacaoDeEntregaLocal.Lida, notificacao.SituacaoEntrega);
        Assert.Equal(SituacaoTecnicaDaNotificacao.Lida, notificacao.Consolidar().Situacao);
    }

    [Fact]
    public void Deve_ocultar_segredo_do_webhook_em_logs_e_rastreamentos()
    {
        var caminho = CaminhoSeguroDaRequisicao.Obter(
            new PathString("/api/v1/webhooks/whatsmiau/segredo-real"));

        Assert.Equal("/api/v1/webhooks/whatsmiau/{segredo}", caminho);
    }

    private sealed class ManipuladorFalso(HttpStatusCode status, string resposta) : HttpMessageHandler
    {
        public string? Url { get; private set; }
        public string? ApiKey { get; private set; }
        public string? Corpo { get; private set; }

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            Url = request.RequestUri?.AbsoluteUri;
            ApiKey = request.Headers.GetValues("apikey").Single();
            Corpo = await request.Content!.ReadAsStringAsync(cancellationToken);
            return new HttpResponseMessage(status)
            {
                Content = new StringContent(resposta, Encoding.UTF8, "application/json")
            };
        }
    }

    private sealed class ManipuladorDaCentral : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            Assert.Equal("chave-central", request.Headers.GetValues("X-Api-Key").Single());
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(
                    "{\"status\":\"Sent\",\"deliveryStatus\":\"Delivered\",\"failureCode\":null}",
                    Encoding.UTF8,
                    "application/json")
            });
        }
    }
}
