using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.Modulos.AcoesComerciais.Aplicacao;
using LavaMais.Crm.Modulos.AcoesComerciais.Dominio;
using LavaMais.Crm.Modulos.AcoesComerciais.Infraestrutura;
using LavaMais.Crm.Modulos.Auditoria.Aplicacao;
using LavaMais.Crm.Modulos.Auditoria.Infraestrutura;
using LavaMais.Crm.Modulos.Catalogo.Aplicacao;
using LavaMais.Crm.Modulos.Catalogo.Dominio;
using LavaMais.Crm.Modulos.Catalogo.Infraestrutura;
using LavaMais.Crm.Modulos.Clientes.Aplicacao;
using LavaMais.Crm.Modulos.Clientes.Infraestrutura;
using LavaMais.Crm.Modulos.ModelosDeMensagem.Aplicacao;
using LavaMais.Crm.Modulos.ModelosDeMensagem.Infraestrutura;
using LavaMais.Crm.Modulos.Integracoes.Aplicacao;
using LavaMais.Crm.Modulos.Integracoes.Infraestrutura;
using LavaMais.Crm.Modulos.Segmentacao.Aplicacao;
using LavaMais.Crm.Modulos.Segmentacao.Dominio;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Net;
using System.Text;

namespace LavaMais.Crm.Testes.Integracao;

public sealed class RascunhoESegmentacaoTestes(PostgresCompartilhado postgres)
{
    [Fact]
    [Trait("Categoria", "RequerDocker")]
    public async Task Deve_criar_rascunho_e_simular_publico_com_motivos_de_exclusao()
    {
        var ct = TestContext.Current.CancellationToken;
        var contexto = new Contexto(Guid.NewGuid()); var conexao = postgres.Conexao;
        await using var bancoClientes = new ContextoDeClientes(Opcoes<ContextoDeClientes>(conexao, ContextoDeClientes.Schema, ContextoDeClientes.TabelaDeHistoricoDasMigrations), contexto); await bancoClientes.Database.MigrateAsync(ct);
        await using var bancoCatalogo = new ContextoDeCatalogo(Opcoes<ContextoDeCatalogo>(conexao, ContextoDeCatalogo.Schema, ContextoDeCatalogo.Historico), contexto); await bancoCatalogo.Database.MigrateAsync(ct);
        await using var bancoModelos = new ContextoDeModelos(Opcoes<ContextoDeModelos>(conexao, ContextoDeModelos.Schema, ContextoDeModelos.Historico), contexto); await bancoModelos.Database.MigrateAsync(ct);
        await using var bancoAcoes = new ContextoDeAcoesComerciais(Opcoes<ContextoDeAcoesComerciais>(conexao, ContextoDeAcoesComerciais.Schema, ContextoDeAcoesComerciais.Historico), contexto); await bancoAcoes.Database.MigrateAsync(ct);
        var opcoesAuditoria = Opcoes<ContextoDeAuditoria>(conexao, ContextoDeAuditoria.Schema, ContextoDeAuditoria.Historico);
        await using var bancoAuditoria = new ContextoDeAuditoria(opcoesAuditoria, contexto); await bancoAuditoria.Database.MigrateAsync(ct);
        var opcoesIntegracoes = Opcoes<ContextoDeIntegracoes>(conexao, ContextoDeIntegracoes.Schema, ContextoDeIntegracoes.Historico);
        await using var bancoIntegracoes = new ContextoDeIntegracoes(opcoesIntegracoes, contexto); await bancoIntegracoes.Database.MigrateAsync(ct);
        var clientes = new GerenciadorDeClientes(bancoClientes, contexto, TimeProvider.System);
        var endereco = new DadosDoEndereco(null, null, null, "Centro", "Praia Grande", "SP", null);
        await clientes.Criar(new("Cliente elegivel", "13997776651", null, "Residencial", null, null, true, endereco, []), ct);
        await clientes.Criar(new("Outro elegivel", "13997776654", null, "Residencial", null, null, true, endereco, []), ct);
        await clientes.Criar(new("Sem permissao", "13997776652", null, "Residencial", null, null, false, endereco, []), ct);
        var inativo = await clientes.Criar(new("Cliente inativo", "13997776653", null, "Residencial", null, null, true, endereco, []), ct); await clientes.Inativar(inativo.Id, ct);
        var gerenciadorCatalogo = new GerenciadorDeCatalogo(bancoCatalogo, contexto, TimeProvider.System);
        var item = await gerenciadorCatalogo.Criar(new(TipoDeItemDeCatalogo.Servico, "Lavagem especial", null, null, 50m), ct);
        var gerenciadorModelos = new GerenciadorDeModelos(bancoModelos, contexto, TimeProvider.System);
        var modelo = await gerenciadorModelos.Criar("Oferta", ct); var versao = await gerenciadorModelos.Publicar(modelo.Id, new("Ola {{nomeCliente}}", ["nomeCliente"], "crm_oferta"), ct);
        var simulador = new SimuladorDePublico(new ConsultaDeClientesParaSegmentacao(bancoClientes));
        var gerenciadorAcoes = new GerenciadorDeAcoesComerciais(bancoAcoes, new ConsultaDeCatalogo(bancoCatalogo), new ConsultaDeModelos(bancoModelos), simulador, new RegistradorDeAuditoria(bancoAuditoria, contexto), new PublicadorDeOutbox(bancoIntegracoes), contexto, TimeProvider.System);
        var criterios = new CriteriosDeSegmentacao(1, ModoDeSelecao.Filtros, "Residencial", ["Praia Grande"], null, null, null, null, null, null);

        var acao = await gerenciadorAcoes.Criar(new("Acao de inverno", "Ofertar lavagem", item.Id, versao.Id, criterios), ct);
        var resultado = await gerenciadorAcoes.Simular(acao.Id, 1, 10, ct);

        Assert.Equal(4, resultado.QuantidadeEncontrada); Assert.Equal(2, resultado.QuantidadeElegivel);
        Assert.Contains(resultado.Clientes, x => x.MotivoExclusao == MotivoDeExclusao.SemPermissao);
        Assert.Contains(resultado.Clientes, x => x.MotivoExclusao == MotivoDeExclusao.ClienteInativo);
        await Assert.ThrowsAsync<ExcecaoDeConflito>(() => gerenciadorAcoes.Preparar(acao.Id, acao.Versao + 1, ct));
        await gerenciadorAcoes.Preparar(acao.Id, acao.Versao, ct);
        var preparada = await bancoAcoes.Acoes.AsNoTracking().Include(x => x.Destinatarios).SingleAsync(x => x.Id == acao.Id, ct);
        Assert.Equal(LavaMais.Crm.Modulos.AcoesComerciais.Dominio.SituacaoDaAcaoComercial.Preparada, preparada.Situacao);
        Assert.Equal(2, preparada.Destinatarios.Count); Assert.All(preparada.Destinatarios, d => Assert.Contains(d.NomeClienteSnapshot, d.ConteudoPreVisualizacaoSnapshot));
        await using var verificacaoAuditoria = new ContextoDeAuditoria(opcoesAuditoria, contexto);
        Assert.Single(await verificacaoAuditoria.Registros.AsNoTracking().Where(x => x.RecursoId == acao.Id).ToListAsync(ct));
        await Assert.ThrowsAsync<ExcecaoDeConflito>(() => gerenciadorAcoes.Atualizar(acao.Id, new("Alterada", null, item.Id, versao.Id, criterios), ct));
        var primeiro = preparada.Destinatarios.OrderBy(x => x.NomeClienteSnapshot).First();
        var segundo = preparada.Destinatarios.OrderBy(x => x.NomeClienteSnapshot).Last();
        await using var bancoAcoesConcorrente = new ContextoDeAcoesComerciais(Opcoes<ContextoDeAcoesComerciais>(conexao, ContextoDeAcoesComerciais.Schema, ContextoDeAcoesComerciais.Historico), contexto);
        await using var bancoAuditoriaConcorrente = new ContextoDeAuditoria(opcoesAuditoria, contexto);
        await using var bancoIntegracoesConcorrente = new ContextoDeIntegracoes(opcoesIntegracoes, contexto);
        var gerenciadorConcorrente = new GerenciadorDeAcoesComerciais(bancoAcoesConcorrente, new ConsultaDeCatalogo(bancoCatalogo), new ConsultaDeModelos(bancoModelos), simulador, new RegistradorDeAuditoria(bancoAuditoriaConcorrente, contexto), new PublicadorDeOutbox(bancoIntegracoesConcorrente), contexto, TimeProvider.System);
        var tentativas = await Task.WhenAll(TentarEnviar(gerenciadorAcoes, acao.Id, primeiro.Id, primeiro.Versao, ct), TentarEnviar(gerenciadorConcorrente, acao.Id, primeiro.Id, primeiro.Versao, ct));
        Assert.Single(tentativas, x => x is null);
        Assert.Single(tentativas, x => x is ExcecaoDeConflito);
        await using var verificacaoOutbox = new ContextoDeIntegracoes(opcoesIntegracoes, contexto);
        var mensagem = await verificacaoOutbox.Mensagens.AsNoTracking().SingleAsync(ct);
        Assert.Equal($"acao:{acao.Id}:destinatario:{primeiro.Id}:v1", mensagem.ChaveUnica);
        await using var verificacaoAposSolicitacao = new ContextoDeAcoesComerciais(Opcoes<ContextoDeAcoesComerciais>(conexao, ContextoDeAcoesComerciais.Schema, ContextoDeAcoesComerciais.Historico), contexto);
        var aposSolicitacao = await verificacaoAposSolicitacao.Acoes.AsNoTracking().Include(x => x.Destinatarios).SingleAsync(x => x.Id == acao.Id, ct);
        Assert.Equal(SituacaoDaAcaoComercial.EmProcessamento, aposSolicitacao.Situacao);
        Assert.Equal(SituacaoDoEnvio.AguardandoSolicitacao, aposSolicitacao.Destinatarios.Single(x => x.Id == primeiro.Id).SituacaoEnvio);
        Assert.Equal(SituacaoDoEnvio.Pendente, aposSolicitacao.Destinatarios.Single(x => x.Id == segundo.Id).SituacaoEnvio);
        await using var bancoAcoesProcessamento = new ContextoDeAcoesComerciais(Opcoes<ContextoDeAcoesComerciais>(conexao, ContextoDeAcoesComerciais.Schema, ContextoDeAcoesComerciais.Historico), contexto);
        await using var bancoAuditoriaProcessamento = new ContextoDeAuditoria(opcoesAuditoria, contexto);
        await using var bancoIntegracoesProcessamento = new ContextoDeIntegracoes(opcoesIntegracoes, contexto);
        var gerenciadorProcessamento = new GerenciadorDeAcoesComerciais(bancoAcoesProcessamento, new ConsultaDeCatalogo(bancoCatalogo), new ConsultaDeModelos(bancoModelos), simulador, new RegistradorDeAuditoria(bancoAuditoriaProcessamento, contexto), new PublicadorDeOutbox(bancoIntegracoesProcessamento), contexto, TimeProvider.System);
        var primeiroAtualizado = aposSolicitacao.Destinatarios.Single(x => x.Id == primeiro.Id);
        var jaSolicitado = await Assert.ThrowsAsync<ExcecaoDeConflito>(() => gerenciadorProcessamento.EnviarDestinatario(acao.Id, primeiro.Id, primeiroAtualizado.Versao, ct));
        Assert.Equal("destinatario_ja_solicitado", jaSolicitado.Codigo);
        var versaoDesatualizada = await Assert.ThrowsAsync<ExcecaoDeConflito>(() => gerenciadorProcessamento.EnviarDestinatario(acao.Id, primeiro.Id, primeiro.Versao, ct));
        Assert.Equal("versao_desatualizada", versaoDesatualizada.Codigo);
        Assert.Single(await verificacaoOutbox.Mensagens.AsNoTracking().ToListAsync(ct));
        using var http = new HttpClient(new HubFalso()) { BaseAddress = new Uri("http://notification-hub") };
        var clienteHub = new ClienteDoNotificationHub(http, Options.Create(new OpcoesDoNotificationHub { BaseUrl = http.BaseAddress.ToString(), ApiKey = "segredo", Source = "lavamais-crm" }));
        var processador = new ProcessadorDeOutbox(bancoIntegracoesProcessamento, clienteHub, gerenciadorProcessamento, TimeProvider.System);
        Assert.True(await processador.ProcessarProxima(ct)); await processador.Reconciliar(ct);
        await using var verificacaoEnvio = new ContextoDeAcoesComerciais(Opcoes<ContextoDeAcoesComerciais>(conexao, ContextoDeAcoesComerciais.Schema, ContextoDeAcoesComerciais.Historico), contexto);
        var primeiroEnviado = await verificacaoEnvio.Set<DestinatarioDaAcao>().AsNoTracking().SingleAsync(x => x.Id == primeiro.Id, ct);
        Assert.Equal(SituacaoDoEnvio.Entregue, primeiroEnviado.SituacaoEnvio);
        Assert.Equal(SituacaoDaAcaoComercial.EmProcessamento, (await verificacaoEnvio.Acoes.AsNoTracking().SingleAsync(ct)).Situacao);

        await using var bancoAcoesSegundo = new ContextoDeAcoesComerciais(Opcoes<ContextoDeAcoesComerciais>(conexao, ContextoDeAcoesComerciais.Schema, ContextoDeAcoesComerciais.Historico), contexto);
        await using var bancoAuditoriaSegundo = new ContextoDeAuditoria(opcoesAuditoria, contexto);
        await using var bancoIntegracoesSegundo = new ContextoDeIntegracoes(opcoesIntegracoes, contexto);
        var gerenciadorSegundo = new GerenciadorDeAcoesComerciais(bancoAcoesSegundo, new ConsultaDeCatalogo(bancoCatalogo), new ConsultaDeModelos(bancoModelos), simulador, new RegistradorDeAuditoria(bancoAuditoriaSegundo, contexto), new PublicadorDeOutbox(bancoIntegracoesSegundo), contexto, TimeProvider.System);
        var envioSegundo = await gerenciadorSegundo.EnviarDestinatario(acao.Id, segundo.Id, segundo.Versao, ct);
        Assert.Equal(SituacaoDoEnvio.AguardandoSolicitacao, envioSegundo.SituacaoEnvio);
        var processadorSegundo = new ProcessadorDeOutbox(bancoIntegracoesSegundo, clienteHub, gerenciadorSegundo, TimeProvider.System);
        Assert.True(await processadorSegundo.ProcessarProxima(ct)); await processadorSegundo.Reconciliar(ct);
        verificacaoEnvio.ChangeTracker.Clear();
        Assert.Equal(SituacaoDaAcaoComercial.Concluida, (await verificacaoEnvio.Acoes.AsNoTracking().SingleAsync(ct)).Situacao);

        var destinatarioEnviado = await verificacaoEnvio.Set<DestinatarioDaAcao>().AsNoTracking().SingleAsync(x => x.Id == primeiro.Id, ct);
        await using var bancoAcoesResultado = new ContextoDeAcoesComerciais(Opcoes<ContextoDeAcoesComerciais>(conexao, ContextoDeAcoesComerciais.Schema, ContextoDeAcoesComerciais.Historico), contexto);
        await using var bancoAuditoriaResultado = new ContextoDeAuditoria(opcoesAuditoria, contexto);
        await using var bancoIntegracoesResultado = new ContextoDeIntegracoes(opcoesIntegracoes, contexto);
        var gerenciadorResultado = new GerenciadorDeAcoesComerciais(bancoAcoesResultado, new ConsultaDeCatalogo(bancoCatalogo), new ConsultaDeModelos(bancoModelos), simulador, new RegistradorDeAuditoria(bancoAuditoriaResultado, contexto), new PublicadorDeOutbox(bancoIntegracoesResultado), contexto, TimeProvider.System);
        await gerenciadorResultado.RegistrarResultado(acao.Id, destinatarioEnviado.Id, ResultadoComercial.Convertido, 75.50m, destinatarioEnviado.Versao, ct);
        verificacaoEnvio.ChangeTracker.Clear();
        var resultadoComercial = await verificacaoEnvio.Set<DestinatarioDaAcao>().AsNoTracking().SingleAsync(x => x.Id == primeiro.Id, ct);
        Assert.Equal(ResultadoComercial.Convertido, resultadoComercial.ResultadoComercial); Assert.Equal(75.50m, resultadoComercial.ValorConvertido);
        Assert.Equal(4, await verificacaoAuditoria.Registros.AsNoTracking().CountAsync(x => x.RecursoId == acao.Id || x.RecursoId == primeiro.Id || x.RecursoId == segundo.Id, ct));
        var contextoOutroTenant = new Contexto(Guid.NewGuid());
        await using var outroTenant = new ContextoDeAcoesComerciais(Opcoes<ContextoDeAcoesComerciais>(conexao, ContextoDeAcoesComerciais.Schema, ContextoDeAcoesComerciais.Historico), contextoOutroTenant);
        Assert.Empty(await outroTenant.Acoes.AsNoTracking().ToListAsync(ct));
        var gerenciadorOutroTenant = new GerenciadorDeAcoesComerciais(outroTenant, new ConsultaDeCatalogo(bancoCatalogo), new ConsultaDeModelos(bancoModelos), simulador, new RegistradorDeAuditoria(bancoAuditoriaResultado, contextoOutroTenant), new PublicadorDeOutbox(bancoIntegracoesResultado), contextoOutroTenant, TimeProvider.System);
        await Assert.ThrowsAsync<ExcecaoDeRecursoNaoEncontrado>(() => gerenciadorOutroTenant.EnviarDestinatario(acao.Id, primeiro.Id, destinatarioEnviado.Versao, ct));
    }

    [Fact]
    public void Deve_validar_versao_e_selecao_manual_dos_criterios()
    {
        Assert.Throws<ExcecaoDeRegraDeNegocio>(() => new CriteriosDeSegmentacao(2, ModoDeSelecao.Filtros, null, null, null, null, null, null, null, null).Validar());
        Assert.Throws<ExcecaoDeRegraDeNegocio>(() => new CriteriosDeSegmentacao(1, ModoDeSelecao.Manual, null, null, null, null, null, null, null, []).Validar());
    }

    private static DbContextOptions<T> Opcoes<T>(string conexao, string schema, string historico) where T : DbContext => new DbContextOptionsBuilder<T>().UseNpgsql(conexao, p => p.MigrationsHistoryTable(historico, schema)).Options;
    private static async Task<Exception?> TentarEnviar(GerenciadorDeAcoesComerciais gerenciador, Guid acaoId, Guid destinatarioId, uint versao, CancellationToken ct) =>
        await Record.ExceptionAsync(() => gerenciador.EnviarDestinatario(acaoId, destinatarioId, versao, ct));
    private sealed class Contexto(Guid tenantId) : IContextoDoUsuario { public bool Autenticado => true; public Guid TenantId { get; } = tenantId; public string UsuarioIdentidadeId => "gerente-teste"; }
    private sealed class HubFalso : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        { var json = request.Method == HttpMethod.Post ? "{\"id\":\"notif-1\"}" : "{\"status\":\"Delivered\",\"failureCode\":null}"; return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK) { Content = new StringContent(json, Encoding.UTF8, "application/json") }); }
    }
}
