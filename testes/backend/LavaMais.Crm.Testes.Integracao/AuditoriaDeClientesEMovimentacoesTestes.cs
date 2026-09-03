using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.MovimentacoesComerciais;
using LavaMais.Crm.Modulos.Auditoria.Aplicacao;
using LavaMais.Crm.Modulos.Auditoria.Infraestrutura;
using LavaMais.Crm.Modulos.Autorizacao.Aplicacao;
using LavaMais.Crm.Modulos.Autorizacao.Dominio;
using LavaMais.Crm.Modulos.Autorizacao.Infraestrutura;
using LavaMais.Crm.Modulos.Clientes.Aplicacao;
using LavaMais.Crm.Modulos.Clientes.Infraestrutura;
using LavaMais.Crm.Modulos.MovimentacoesComerciais.Aplicacao;
using LavaMais.Crm.Modulos.MovimentacoesComerciais.Infraestrutura;
using Microsoft.EntityFrameworkCore;

namespace LavaMais.Crm.Testes.Integracao;

public sealed class AuditoriaDeClientesEMovimentacoesTestes(PostgresCompartilhado postgres)
{
    [Fact]
    [Trait("Categoria", "RequerDocker")]
    public async Task Deve_auditar_cliente_sem_persistir_pii_nos_metadados()
    {
        var ct = TestContext.Current.CancellationToken;
        var contexto = new UsuarioDeTeste(Guid.NewGuid());
        var opcoesAuditoria = Opcoes<ContextoDeAuditoria>(ContextoDeAuditoria.Schema, ContextoDeAuditoria.Historico);
        await using var bancoAuditoria = new ContextoDeAuditoria(opcoesAuditoria, contexto);
        await bancoAuditoria.Database.MigrateAsync(ct);
        await using var bancoClientes = new ContextoDeClientes(Opcoes<ContextoDeClientes>(ContextoDeClientes.Schema, ContextoDeClientes.TabelaDeHistoricoDasMigrations), contexto);
        await bancoClientes.Database.MigrateAsync(ct);
        var gerenciador = new GerenciadorDeClientes(bancoClientes, contexto, TimeProvider.System, new RegistradorDeAuditoria(bancoAuditoria, contexto));

        var dados = new DadosDoCliente("Pessoa protegida", "13999990000", null, "Residencial", null, null, true, null, []);
        var cliente = await gerenciador.Criar(dados, ct);
        await gerenciador.Atualizar(cliente.Id, dados with { PermiteMarketingWhatsapp = false }, ct);
        await gerenciador.Inativar(cliente.Id, ct);

        await using var verificacao = new ContextoDeAuditoria(opcoesAuditoria, contexto);
        var registros = await verificacao.Registros.AsNoTracking().Where(x => x.RecursoId == cliente.Id).OrderBy(x => x.Data).ToListAsync(ct);
        Assert.Equal(["ClienteCriado", "ClienteAtualizado", "ClienteInativado"], registros.Select(x => x.Tipo));
        Assert.All(registros, registro =>
        {
            Assert.DoesNotContain("Pessoa protegida", registro.DadosJson);
            Assert.DoesNotContain("13999990000", registro.DadosJson);
        });
    }

    [Fact]
    [Trait("Categoria", "RequerDocker")]
    public async Task Deve_auditar_registro_e_cancelamento_da_movimentacao()
    {
        var ct = TestContext.Current.CancellationToken;
        var contexto = new UsuarioDeTeste(Guid.NewGuid());
        var opcoesAuditoria = Opcoes<ContextoDeAuditoria>(ContextoDeAuditoria.Schema, ContextoDeAuditoria.Historico);
        await using var bancoAuditoria = new ContextoDeAuditoria(opcoesAuditoria, contexto);
        await bancoAuditoria.Database.MigrateAsync(ct);
        await using var banco = new ContextoDeMovimentacoesComerciais(Opcoes<ContextoDeMovimentacoesComerciais>(ContextoDeMovimentacoesComerciais.Schema, ContextoDeMovimentacoesComerciais.Historico), contexto);
        await banco.Database.MigrateAsync(ct);
        var clienteId = Guid.NewGuid();
        var oferta = new OfertaDisponivelParaMovimentacao(Guid.NewGuid(), Guid.NewGuid(), "Artigo protegido", Guid.NewGuid(), "Servico protegido", 30m);
        var gerenciador = new GerenciadorDeMovimentacoesComerciais(banco, new ClienteDeTeste(clienteId), new CatalogoDeTeste(oferta), contexto, TimeProvider.System, new RegistradorDeAuditoria(bancoAuditoria, contexto));

        var movimentacao = await gerenciador.Registrar(new(clienteId, [new(oferta.Id, 2, null)], null, null, "Observacao protegida"), ct);
        await gerenciador.Cancelar(movimentacao.Id, "Motivo protegido", movimentacao.Versao, ct);

        await using var verificacao = new ContextoDeAuditoria(opcoesAuditoria, contexto);
        var registros = await verificacao.Registros.AsNoTracking().Where(x => x.RecursoId == movimentacao.Id).OrderBy(x => x.Data).ToListAsync(ct);
        Assert.Equal(["MovimentacaoComercialRegistrada", "MovimentacaoComercialCancelada"], registros.Select(x => x.Tipo));
        Assert.All(registros, registro =>
        {
            Assert.DoesNotContain("Observacao protegida", registro.DadosJson);
            Assert.DoesNotContain("Motivo protegido", registro.DadosJson);
        });
    }

    [Fact]
    [Trait("Categoria", "RequerDocker")]
    public async Task Deve_auditar_alteracoes_de_autorizacao()
    {
        var ct = TestContext.Current.CancellationToken;
        var contexto = new UsuarioDeTeste(Guid.NewGuid());
        var opcoesAuditoria = Opcoes<ContextoDeAuditoria>(ContextoDeAuditoria.Schema, ContextoDeAuditoria.Historico);
        await using var bancoAuditoria = new ContextoDeAuditoria(opcoesAuditoria, contexto);
        await bancoAuditoria.Database.MigrateAsync(ct);
        await using var banco = new ContextoDeAutorizacao(Opcoes<ContextoDeAutorizacao>(ContextoDeAutorizacao.Schema, ContextoDeAutorizacao.TabelaDeHistoricoDasMigrations), contexto);
        await banco.Database.MigrateAsync(ct);
        var gerenciador = new GerenciadorDeUsuariosCrm(banco, contexto, TimeProvider.System, new RegistradorDeAuditoria(bancoAuditoria, contexto));

        var usuario = await gerenciador.Criar(Guid.NewGuid().ToString(), PapelDoCrm.Operador, ct);
        await gerenciador.AlterarPapel(usuario.Id, PapelDoCrm.Gerente, ct);
        await gerenciador.Inativar(usuario.Id, ct);

        await using var verificacao = new ContextoDeAuditoria(opcoesAuditoria, contexto);
        var eventos = await verificacao.Registros.AsNoTracking().Where(x => x.RecursoId == usuario.Id).Select(x => x.Tipo).ToListAsync(ct);
        Assert.Equal(3, eventos.Count);
        Assert.Contains("UsuarioCrmCriado", eventos);
        Assert.Contains("PapelDoUsuarioCrmAlterado", eventos);
        Assert.Contains("UsuarioCrmInativado", eventos);
    }

    private DbContextOptions<T> Opcoes<T>(string schema, string historico) where T : DbContext =>
        new DbContextOptionsBuilder<T>().UseNpgsql(postgres.Conexao, p => p.MigrationsHistoryTable(historico, schema)).Options;

    private sealed record UsuarioDeTeste(Guid TenantId) : IContextoDoUsuario
    {
        public bool Autenticado => true;
        public string UsuarioIdentidadeId => "usuario-auditoria";
    }

    private sealed record ClienteDeTeste(Guid ClienteId) : IConsultaDeClienteParaMovimentacao
    {
        public Task<ClienteDisponivelParaMovimentacao?> ObterAtivo(Guid id, CancellationToken ct) =>
            Task.FromResult<ClienteDisponivelParaMovimentacao?>(id == ClienteId ? new(id, "Cliente protegido") : null);
    }

    private sealed record CatalogoDeTeste(OfertaDisponivelParaMovimentacao Oferta) : IConsultaDeCatalogoParaMovimentacao
    {
        public Task<OfertaDisponivelParaMovimentacao?> ObterOfertaAtiva(Guid id, CancellationToken ct) => Task.FromResult(id == Oferta.Id ? Oferta : null);
        public Task<OfertaDisponivelParaMovimentacao?> ObterOfertaParaImportacao(Guid id, CancellationToken ct) => Task.FromResult(id == Oferta.Id ? Oferta : null);
    }
}
