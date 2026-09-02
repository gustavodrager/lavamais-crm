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
using LavaMais.Crm.Modulos.Segmentacao.Aplicacao;
using LavaMais.Crm.Modulos.Segmentacao.Dominio;
using Microsoft.EntityFrameworkCore;

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
        var clientes = new GerenciadorDeClientes(bancoClientes, contexto, TimeProvider.System);
        var endereco = new DadosDoEndereco(null, null, null, "Centro", "Praia Grande", "SP", null);
        var clienteExcluivel = await clientes.Criar(new("Cliente elegivel", "13997776651", null, "Residencial", null, null, true, endereco, []), ct);
        await clientes.Criar(new("Outro elegivel", "13997776654", null, "Residencial", null, null, true, endereco, []), ct);
        await clientes.Criar(new("Sem permissao", "13997776652", null, "Residencial", null, null, false, endereco, []), ct);
        var inativo = await clientes.Criar(new("Cliente inativo", "13997776653", null, "Residencial", null, null, true, endereco, []), ct); await clientes.Inativar(inativo.Id, ct);
        var gerenciadorCatalogo = new GerenciadorDeCatalogo(bancoCatalogo, contexto, TimeProvider.System);
        var item = await gerenciadorCatalogo.Criar(new(TipoDeItemDeCatalogo.Servico, "Lavagem especial", null, null, 50m), ct);
        var gerenciadorModelos = new GerenciadorDeModelos(bancoModelos, contexto, TimeProvider.System);
        var modelo = await gerenciadorModelos.Criar("Oferta", ct); var versao = await gerenciadorModelos.Publicar(modelo.Id, new("Ola {{nomeCliente}}", ["nomeCliente"]), ct);
        var simulador = new SimuladorDePublico(new ConsultaDeClientesParaSegmentacao(bancoClientes));
        var simulacaoComExclusao = await simulador.Simular(new CriteriosDeSegmentacao(2, ModoDeSelecao.Filtros, "Residencial", ["Praia Grande"], null, null, null, null, null, null, [clienteExcluivel.Id]), 1, 10, ct);
        Assert.Equal(1, simulacaoComExclusao.QuantidadeElegivel);
        Assert.Contains(simulacaoComExclusao.Clientes, x => x.ClienteId == clienteExcluivel.Id && x.MotivoExclusao == MotivoDeExclusao.ExcluidoManualmente);
        var gerenciadorAcoes = new GerenciadorDeAcoesComerciais(bancoAcoes, new ConsultaDeCatalogo(bancoCatalogo), new ConsultaDeModelos(bancoModelos), simulador, new RegistradorDeAuditoria(bancoAuditoria, contexto), contexto, TimeProvider.System);
        var criterios = new CriteriosDeSegmentacao(1, ModoDeSelecao.Filtros, "Residencial", ["Praia Grande"], null, null, null, null, null, null);

        var acao = await gerenciadorAcoes.Criar(new("Acao de inverno", "Ofertar lavagem", null, versao.Id, criterios), ct);
        var resultado = await gerenciadorAcoes.Simular(acao.Id, 1, 10, ct);

        Assert.Equal(4, resultado.QuantidadeEncontrada); Assert.Equal(2, resultado.QuantidadeElegivel);
        Assert.Contains(resultado.Clientes, x => x.MotivoExclusao == MotivoDeExclusao.SemPermissao);
        Assert.Contains(resultado.Clientes, x => x.MotivoExclusao == MotivoDeExclusao.ClienteInativo);
        await Assert.ThrowsAsync<ExcecaoDeConflito>(() => gerenciadorAcoes.Preparar(acao.Id, acao.Versao + 1, ct));
        await gerenciadorAcoes.Preparar(acao.Id, acao.Versao, ct);
        var preparada = await bancoAcoes.Acoes.AsNoTracking().Include(x => x.Destinatarios).SingleAsync(x => x.Id == acao.Id, ct);
        Assert.Equal(LavaMais.Crm.Modulos.AcoesComerciais.Dominio.SituacaoDaAcaoComercial.Preparada, preparada.Situacao);
        Assert.Null(preparada.ItemDeCatalogoId);
        Assert.Null(preparada.NomeItemSnapshot);
        Assert.Equal(2, preparada.Destinatarios.Count); Assert.All(preparada.Destinatarios, d => Assert.Contains(d.NomeClienteSnapshot, d.ConteudoPreVisualizacaoSnapshot));
        await using var verificacaoAuditoria = new ContextoDeAuditoria(opcoesAuditoria, contexto);
        Assert.Single(await verificacaoAuditoria.Registros.AsNoTracking().Where(x => x.RecursoId == acao.Id).ToListAsync(ct));
        await Assert.ThrowsAsync<ExcecaoDeConflito>(() => gerenciadorAcoes.Atualizar(acao.Id, new("Alterada", null, null, versao.Id, criterios), ct));
        var primeiro = preparada.Destinatarios.OrderBy(x => x.NomeClienteSnapshot).First();
        var segundo = preparada.Destinatarios.OrderBy(x => x.NomeClienteSnapshot).Last();
        await gerenciadorAcoes.RegistrarAberturaWhatsapp(acao.Id, primeiro.Id, primeiro.Versao, ct);
        await using var bancoAcoesConcorrente = new ContextoDeAcoesComerciais(Opcoes<ContextoDeAcoesComerciais>(conexao, ContextoDeAcoesComerciais.Schema, ContextoDeAcoesComerciais.Historico), contexto);
        await using var bancoAuditoriaConcorrente = new ContextoDeAuditoria(opcoesAuditoria, contexto);
        var gerenciadorConcorrente = new GerenciadorDeAcoesComerciais(bancoAcoesConcorrente, new ConsultaDeCatalogo(bancoCatalogo), new ConsultaDeModelos(bancoModelos), simulador, new RegistradorDeAuditoria(bancoAuditoriaConcorrente, contexto), contexto, TimeProvider.System);
        var tentativas = await Task.WhenAll(
            TentarConfirmar(gerenciadorAcoes, acao.Id, primeiro.Id, primeiro.Versao, ct),
            TentarConfirmar(gerenciadorConcorrente, acao.Id, primeiro.Id, primeiro.Versao, ct));
        Assert.Single(tentativas, x => x is null);
        Assert.Single(tentativas, x => x is ExcecaoDeConflito);
        await using var verificacaoAposConfirmacao = new ContextoDeAcoesComerciais(Opcoes<ContextoDeAcoesComerciais>(conexao, ContextoDeAcoesComerciais.Schema, ContextoDeAcoesComerciais.Historico), contexto);
        var aposConfirmacao = await verificacaoAposConfirmacao.Acoes.AsNoTracking().Include(x => x.Destinatarios).SingleAsync(x => x.Id == acao.Id, ct);
        Assert.Equal(SituacaoDaAcaoComercial.EmProcessamento, aposConfirmacao.Situacao);
        Assert.Equal(SituacaoDoEnvio.Enviado, aposConfirmacao.Destinatarios.Single(x => x.Id == primeiro.Id).SituacaoEnvio);
        Assert.Equal(SituacaoDoEnvio.Pendente, aposConfirmacao.Destinatarios.Single(x => x.Id == segundo.Id).SituacaoEnvio);
        await using var bancoAcoesProcessamento = new ContextoDeAcoesComerciais(Opcoes<ContextoDeAcoesComerciais>(conexao, ContextoDeAcoesComerciais.Schema, ContextoDeAcoesComerciais.Historico), contexto);
        await using var bancoAuditoriaProcessamento = new ContextoDeAuditoria(opcoesAuditoria, contexto);
        var gerenciadorProcessamento = new GerenciadorDeAcoesComerciais(bancoAcoesProcessamento, new ConsultaDeCatalogo(bancoCatalogo), new ConsultaDeModelos(bancoModelos), simulador, new RegistradorDeAuditoria(bancoAuditoriaProcessamento, contexto), contexto, TimeProvider.System);
        var primeiroAtualizado = aposConfirmacao.Destinatarios.Single(x => x.Id == primeiro.Id);
        var jaConfirmado = await Assert.ThrowsAsync<ExcecaoDeConflito>(() => gerenciadorProcessamento.ConfirmarEnvioWhatsapp(acao.Id, primeiro.Id, primeiroAtualizado.Versao, ct));
        Assert.Equal("destinatario_ja_confirmado", jaConfirmado.Codigo);
        var versaoDesatualizada = await Assert.ThrowsAsync<ExcecaoDeConflito>(() => gerenciadorProcessamento.ConfirmarEnvioWhatsapp(acao.Id, primeiro.Id, primeiro.Versao, ct));
        Assert.Equal("versao_desatualizada", versaoDesatualizada.Codigo);

        await using var bancoAcoesSegundo = new ContextoDeAcoesComerciais(Opcoes<ContextoDeAcoesComerciais>(conexao, ContextoDeAcoesComerciais.Schema, ContextoDeAcoesComerciais.Historico), contexto);
        await using var bancoAuditoriaSegundo = new ContextoDeAuditoria(opcoesAuditoria, contexto);
        var gerenciadorSegundo = new GerenciadorDeAcoesComerciais(bancoAcoesSegundo, new ConsultaDeCatalogo(bancoCatalogo), new ConsultaDeModelos(bancoModelos), simulador, new RegistradorDeAuditoria(bancoAuditoriaSegundo, contexto), contexto, TimeProvider.System);
        var envioSegundo = await gerenciadorSegundo.ConfirmarEnvioWhatsapp(acao.Id, segundo.Id, segundo.Versao, ct);
        Assert.Equal(SituacaoDoEnvio.Enviado, envioSegundo.SituacaoEnvio);
        verificacaoAposConfirmacao.ChangeTracker.Clear();
        Assert.Equal(SituacaoDaAcaoComercial.Concluida, (await verificacaoAposConfirmacao.Acoes.AsNoTracking().SingleAsync(ct)).Situacao);

        var destinatarioEnviado = await verificacaoAposConfirmacao.Set<DestinatarioDaAcao>().AsNoTracking().SingleAsync(x => x.Id == primeiro.Id, ct);
        await using var bancoAcoesResultado = new ContextoDeAcoesComerciais(Opcoes<ContextoDeAcoesComerciais>(conexao, ContextoDeAcoesComerciais.Schema, ContextoDeAcoesComerciais.Historico), contexto);
        await using var bancoAuditoriaResultado = new ContextoDeAuditoria(opcoesAuditoria, contexto);
        var gerenciadorResultado = new GerenciadorDeAcoesComerciais(bancoAcoesResultado, new ConsultaDeCatalogo(bancoCatalogo), new ConsultaDeModelos(bancoModelos), simulador, new RegistradorDeAuditoria(bancoAuditoriaResultado, contexto), contexto, TimeProvider.System);
        await gerenciadorResultado.RegistrarResultado(acao.Id, destinatarioEnviado.Id, ResultadoComercial.Convertido, 75.50m, destinatarioEnviado.Versao, ct);
        verificacaoAposConfirmacao.ChangeTracker.Clear();
        var resultadoComercial = await verificacaoAposConfirmacao.Set<DestinatarioDaAcao>().AsNoTracking().SingleAsync(x => x.Id == primeiro.Id, ct);
        Assert.Equal(ResultadoComercial.Convertido, resultadoComercial.ResultadoComercial); Assert.Equal(75.50m, resultadoComercial.ValorConvertido);
        Assert.Equal(5, await verificacaoAuditoria.Registros.AsNoTracking().CountAsync(x => x.RecursoId == acao.Id || x.RecursoId == primeiro.Id || x.RecursoId == segundo.Id, ct));
        var contextoOutroTenant = new Contexto(Guid.NewGuid());
        await using var outroTenant = new ContextoDeAcoesComerciais(Opcoes<ContextoDeAcoesComerciais>(conexao, ContextoDeAcoesComerciais.Schema, ContextoDeAcoesComerciais.Historico), contextoOutroTenant);
        Assert.Empty(await outroTenant.Acoes.AsNoTracking().ToListAsync(ct));
        var gerenciadorOutroTenant = new GerenciadorDeAcoesComerciais(outroTenant, new ConsultaDeCatalogo(bancoCatalogo), new ConsultaDeModelos(bancoModelos), simulador, new RegistradorDeAuditoria(bancoAuditoriaResultado, contextoOutroTenant), contextoOutroTenant, TimeProvider.System);
        await Assert.ThrowsAsync<ExcecaoDeRecursoNaoEncontrado>(() => gerenciadorOutroTenant.ConfirmarEnvioWhatsapp(acao.Id, primeiro.Id, destinatarioEnviado.Versao, ct));
    }

    [Fact]
    public void Deve_validar_versao_e_selecao_manual_dos_criterios()
    {
        Assert.Throws<ExcecaoDeRegraDeNegocio>(() => new CriteriosDeSegmentacao(3, ModoDeSelecao.Filtros, null, null, null, null, null, null, null, null).Validar());
        Assert.Throws<ExcecaoDeRegraDeNegocio>(() => new CriteriosDeSegmentacao(1, ModoDeSelecao.Manual, null, null, null, null, null, null, null, []).Validar());
        Assert.Throws<ExcecaoDeRegraDeNegocio>(() => new CriteriosDeSegmentacao(1, ModoDeSelecao.Filtros, null, null, null, null, null, null, null, null, [Guid.NewGuid()]).Validar());
    }

    private static DbContextOptions<T> Opcoes<T>(string conexao, string schema, string historico) where T : DbContext => new DbContextOptionsBuilder<T>().UseNpgsql(conexao, p => p.MigrationsHistoryTable(historico, schema)).Options;
    private static async Task<Exception?> TentarConfirmar(GerenciadorDeAcoesComerciais gerenciador, Guid acaoId, Guid destinatarioId, uint versao, CancellationToken ct) =>
        await Record.ExceptionAsync(() => gerenciador.ConfirmarEnvioWhatsapp(acaoId, destinatarioId, versao, ct));
    private sealed class Contexto(Guid tenantId) : IContextoDoUsuario { public bool Autenticado => true; public Guid TenantId { get; } = tenantId; public string UsuarioIdentidadeId => "gerente-teste"; }
}
