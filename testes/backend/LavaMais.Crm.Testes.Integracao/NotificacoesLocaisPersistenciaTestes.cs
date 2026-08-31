using System.Net;
using System.Text;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Integracoes;
using LavaMais.Crm.Modulos.Integracoes.Aplicacao;
using LavaMais.Crm.Modulos.Integracoes.Dominio;
using LavaMais.Crm.Modulos.Integracoes.Infraestrutura;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

namespace LavaMais.Crm.Testes.Integracao;

public sealed class NotificacoesLocaisPersistenciaTestes(PostgresCompartilhado postgres)
{
    [Fact]
    [Trait("Categoria", "RequerDocker")]
    public async Task Deve_enviar_uma_vez_e_atualizar_entrega_pelo_webhook()
    {
        var ct = TestContext.Current.CancellationToken;
        var usuario = new Contexto(Guid.NewGuid());
        var opcoesBanco = new DbContextOptionsBuilder<ContextoDeIntegracoes>()
            .UseNpgsql(postgres.Conexao, p => p.MigrationsHistoryTable(ContextoDeIntegracoes.Historico, ContextoDeIntegracoes.Schema))
            .Options;
        await using var banco = new ContextoDeIntegracoes(opcoesBanco, usuario);
        await banco.Database.MigrateAsync(ct);

        var opcoes = Options.Create(new OpcoesDeNotificacoes
        {
            Modo = ModoDeNotificacoes.Local,
            WhatsMiau = new OpcoesDoWhatsMiau
            {
                BaseUrl = "https://api.whatsmiau.dev/v2",
                ApiKey = "chave-teste",
                NomeInstancia = "lavamais-crm-teste",
                SegredoWebhook = "segredo-webhook-lavamais-teste"
            }
        });
        var manipulador = new WhatsMiauFalso();
        using var http = new HttpClient(manipulador) { BaseAddress = new Uri("https://api.whatsmiau.dev/v2/") };
        var porta = new PortaLocalDeNotificacoes(
            banco,
            new ClienteWhatsMiau(http, opcoes),
            TimeProvider.System);
        var solicitacao = new SolicitacaoDeNotificacao(
            "Whatsapp",
            "oferta_teste",
            $"tenant:{usuario.TenantId}:envio:1",
            "Cliente Teste",
            "+55 (13) 99999-9999",
            "Ola, Cliente Teste!",
            new Dictionary<string, string> { ["nomeCliente"] = "Cliente Teste" });

        var primeira = await porta.Criar(usuario.TenantId, solicitacao, ct);
        var repetida = await porta.Criar(usuario.TenantId, solicitacao, ct);

        Assert.Equal(primeira, repetida);
        Assert.Equal(1, manipulador.QuantidadeEnvios);
        var notificacao = await banco.NotificacoesLocais.AsNoTracking().SingleAsync(ct);
        Assert.Equal(SituacaoDeEntregaLocal.Submetida, notificacao.SituacaoEntrega);
        Assert.Equal("mensagem-whatsmiau-1", notificacao.IdentificadorNoProvedor);

        var contextoHttp = new DefaultHttpContext();
        var json = """
            {"event":"messages.update","instance":"lavamais-crm-teste","data":{"keyId":"mensagem-whatsmiau-1","status":"DELIVERY_ACK"}}
            """;
        contextoHttp.Request.Body = new MemoryStream(Encoding.UTF8.GetBytes(json));
        contextoHttp.Request.ContentLength = Encoding.UTF8.GetByteCount(json);
        var webhook = new ProcessadorDeWebhookWhatsMiau(
            banco,
            opcoes,
            TimeProvider.System,
            NullLogger<ProcessadorDeWebhookWhatsMiau>.Instance);

        await webhook.Processar("segredo-incorreto", contextoHttp.Request, ct);
        banco.ChangeTracker.Clear();
        Assert.Equal(SituacaoDeEntregaLocal.Submetida, (await banco.NotificacoesLocais.AsNoTracking().SingleAsync(ct)).SituacaoEntrega);

        contextoHttp.Request.Body.Position = 0;
        await webhook.Processar(opcoes.Value.WhatsMiau.SegredoWebhook, contextoHttp.Request, ct);
        banco.ChangeTracker.Clear();
        Assert.Equal(SituacaoDeEntregaLocal.Entregue, (await banco.NotificacoesLocais.AsNoTracking().SingleAsync(ct)).SituacaoEntrega);
        Assert.Equal(SituacaoTecnicaDaNotificacao.Entregue, (await porta.Obter(primeira.Id, ct)).Situacao);
    }

    [Fact]
    [Trait("Categoria", "RequerDocker")]
    public async Task Nao_deve_reenviar_quando_o_resultado_no_whatsmiau_for_indeterminado()
    {
        var ct = TestContext.Current.CancellationToken;
        var usuario = new Contexto(Guid.NewGuid());
        var opcoesBanco = new DbContextOptionsBuilder<ContextoDeIntegracoes>()
            .UseNpgsql(postgres.Conexao, p => p.MigrationsHistoryTable(ContextoDeIntegracoes.Historico, ContextoDeIntegracoes.Schema))
            .Options;
        await using var banco = new ContextoDeIntegracoes(opcoesBanco, usuario);
        await banco.Database.MigrateAsync(ct);

        var opcoes = Options.Create(new OpcoesDeNotificacoes
        {
            Modo = ModoDeNotificacoes.Local,
            WhatsMiau = new OpcoesDoWhatsMiau
            {
                BaseUrl = "https://api.whatsmiau.dev/v2",
                ApiKey = "chave-teste",
                NomeInstancia = "lavamais-crm-teste",
                SegredoWebhook = "segredo-webhook-lavamais-teste"
            }
        });
        var manipulador = new WhatsMiauFalso(HttpStatusCode.InternalServerError, "{}");
        using var http = new HttpClient(manipulador) { BaseAddress = new Uri("https://api.whatsmiau.dev/v2/") };
        var porta = new PortaLocalDeNotificacoes(
            banco,
            new ClienteWhatsMiau(http, opcoes),
            TimeProvider.System);
        var solicitacao = new SolicitacaoDeNotificacao(
            "Whatsapp",
            "oferta_teste",
            $"tenant:{usuario.TenantId}:envio:indeterminado",
            "Cliente Teste",
            "5513999999999",
            "Ola, Cliente Teste!",
            new Dictionary<string, string>());

        var primeira = await porta.Criar(usuario.TenantId, solicitacao, ct);
        var repetida = await porta.Criar(usuario.TenantId, solicitacao, ct);

        Assert.Equal(primeira, repetida);
        Assert.Equal(1, manipulador.QuantidadeEnvios);
        var notificacao = await banco.NotificacoesLocais.AsNoTracking().SingleAsync(ct);
        Assert.Equal(SituacaoDaNotificacaoLocal.Falhou, notificacao.Situacao);
        Assert.Equal("resultado_envio_indeterminado", notificacao.CodigoFalha);

        var solicitacaoInterrompida = solicitacao with
        {
            ChaveIdempotencia = $"tenant:{usuario.TenantId}:envio:interrompido"
        };
        var interrompida = NotificacaoLocal.Criar(
            usuario.TenantId,
            solicitacaoInterrompida,
            "{}",
            DateTimeOffset.UtcNow);
        interrompida.RegistrarTentativa(DateTimeOffset.UtcNow);
        banco.Add(interrompida);
        await banco.SaveChangesAsync(ct);

        await porta.Criar(usuario.TenantId, solicitacaoInterrompida, ct);

        Assert.Equal(1, manipulador.QuantidadeEnvios);
        banco.ChangeTracker.Clear();
        var aposReinicio = await banco.NotificacoesLocais
            .AsNoTracking()
            .SingleAsync(x => x.ChaveIdempotencia == solicitacaoInterrompida.ChaveIdempotencia, ct);
        Assert.Equal(SituacaoDaNotificacaoLocal.Falhou, aposReinicio.Situacao);
        Assert.Equal("resultado_envio_indeterminado", aposReinicio.CodigoFalha);
    }

    private sealed class Contexto(Guid tenantId) : IContextoDoUsuario
    {
        public bool Autenticado => true;
        public Guid TenantId { get; } = tenantId;
        public string UsuarioIdentidadeId => "usuario-teste";
    }

    private sealed class WhatsMiauFalso : HttpMessageHandler
    {
        private readonly HttpStatusCode status;
        private readonly string resposta;

        public WhatsMiauFalso(
            HttpStatusCode status = HttpStatusCode.OK,
            string resposta = "{\"key\":{\"id\":\"mensagem-whatsmiau-1\"}}")
        {
            this.status = status;
            this.resposta = resposta;
        }

        public int QuantidadeEnvios { get; private set; }

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            QuantidadeEnvios++;
            return Task.FromResult(new HttpResponseMessage(status)
            {
                Content = new StringContent(
                    resposta,
                    Encoding.UTF8,
                    "application/json")
            });
        }
    }
}
