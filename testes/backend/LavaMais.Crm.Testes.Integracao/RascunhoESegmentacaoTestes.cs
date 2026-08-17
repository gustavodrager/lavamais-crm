using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.Modulos.AcoesComerciais.Aplicacao;
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

        Assert.Equal(3, resultado.QuantidadeEncontrada); Assert.Equal(1, resultado.QuantidadeElegivel);
        Assert.Contains(resultado.Clientes, x => x.MotivoExclusao == MotivoDeExclusao.SemPermissao);
        Assert.Contains(resultado.Clientes, x => x.MotivoExclusao == MotivoDeExclusao.ClienteInativo);
        await Assert.ThrowsAsync<ExcecaoDeConflito>(() => gerenciadorAcoes.Preparar(acao.Id, acao.Versao + 1, ct));
        await gerenciadorAcoes.Preparar(acao.Id, acao.Versao, ct);
        var preparada = await bancoAcoes.Acoes.AsNoTracking().Include(x => x.Destinatarios).SingleAsync(x => x.Id == acao.Id, ct);
        Assert.Equal(LavaMais.Crm.Modulos.AcoesComerciais.Dominio.SituacaoDaAcaoComercial.Preparada, preparada.Situacao);
        Assert.Single(preparada.Destinatarios); Assert.Contains("Cliente elegivel", preparada.Destinatarios.Single().ConteudoPreVisualizacaoSnapshot);
        await using var verificacaoAuditoria = new ContextoDeAuditoria(opcoesAuditoria, contexto);
        Assert.Single(await verificacaoAuditoria.Registros.AsNoTracking().Where(x => x.RecursoId == acao.Id).ToListAsync(ct));
        await Assert.ThrowsAsync<ExcecaoDeConflito>(() => gerenciadorAcoes.Atualizar(acao.Id, new("Alterada", null, item.Id, versao.Id, criterios), ct));
        await gerenciadorAcoes.Iniciar(acao.Id, preparada.Versao, ct);
        await using var verificacaoOutbox = new ContextoDeIntegracoes(opcoesIntegracoes, contexto);
        var mensagem = await verificacaoOutbox.Mensagens.AsNoTracking().SingleAsync(ct);
        Assert.Contains($"acao:{acao.Id}:destinatario:", mensagem.ChaveUnica);
        using var http = new HttpClient(new HubFalso()) { BaseAddress = new Uri("http://notification-hub") };
        var clienteHub = new ClienteDoNotificationHub(http, Options.Create(new OpcoesDoNotificationHub { BaseUrl = http.BaseAddress.ToString(), ApiKey = "segredo", Source = "lavamais-crm" }));
        var processador = new ProcessadorDeOutbox(bancoIntegracoes, clienteHub, gerenciadorAcoes, TimeProvider.System);
        Assert.True(await processador.ProcessarProxima(ct)); await processador.Reconciliar(ct);
        await using var verificacaoEnvio = new ContextoDeAcoesComerciais(Opcoes<ContextoDeAcoesComerciais>(conexao, ContextoDeAcoesComerciais.Schema, ContextoDeAcoesComerciais.Historico), contexto);
        Assert.Equal(LavaMais.Crm.Modulos.AcoesComerciais.Dominio.SituacaoDoEnvio.Entregue, (await verificacaoEnvio.Set<LavaMais.Crm.Modulos.AcoesComerciais.Dominio.DestinatarioDaAcao>().AsNoTracking().SingleAsync(ct)).SituacaoEnvio);
        await using var outroTenant = new ContextoDeAcoesComerciais(Opcoes<ContextoDeAcoesComerciais>(conexao, ContextoDeAcoesComerciais.Schema, ContextoDeAcoesComerciais.Historico), new Contexto(Guid.NewGuid()));
        Assert.Empty(await outroTenant.Acoes.AsNoTracking().ToListAsync(ct));
    }

    [Fact]
    public void Deve_validar_versao_e_selecao_manual_dos_criterios()
    {
        Assert.Throws<ExcecaoDeRegraDeNegocio>(() => new CriteriosDeSegmentacao(2, ModoDeSelecao.Filtros, null, null, null, null, null, null, null, null).Validar());
        Assert.Throws<ExcecaoDeRegraDeNegocio>(() => new CriteriosDeSegmentacao(1, ModoDeSelecao.Manual, null, null, null, null, null, null, null, []).Validar());
    }

    private static DbContextOptions<T> Opcoes<T>(string conexao, string schema, string historico) where T : DbContext => new DbContextOptionsBuilder<T>().UseNpgsql(conexao, p => p.MigrationsHistoryTable(historico, schema)).Options;
    private sealed class Contexto(Guid tenantId) : IContextoDoUsuario { public bool Autenticado => true; public Guid TenantId { get; } = tenantId; public string UsuarioIdentidadeId => "gerente-teste"; }
    private sealed class HubFalso : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        { var json = request.Method == HttpMethod.Post ? "{\"id\":\"notif-1\"}" : "{\"status\":\"Delivered\",\"failureCode\":null}"; return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK) { Content = new StringContent(json, Encoding.UTF8, "application/json") }); }
    }
}
