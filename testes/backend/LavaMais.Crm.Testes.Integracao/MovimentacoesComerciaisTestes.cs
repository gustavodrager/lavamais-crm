using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.MovimentacoesComerciais;
using LavaMais.Crm.Modulos.MovimentacoesComerciais.Aplicacao;
using LavaMais.Crm.Modulos.MovimentacoesComerciais.Dominio;
using LavaMais.Crm.Modulos.MovimentacoesComerciais.Infraestrutura;
using Microsoft.EntityFrameworkCore;

namespace LavaMais.Crm.Testes.Integracao;

public sealed class MovimentacoesComerciaisTestes(PostgresCompartilhado postgres)
{
    [Fact]
    public void Deve_validar_dados_e_cancelamento_no_dominio()
    {
        var agora = DateTimeOffset.UtcNow;
        Assert.Throws<ExcecaoDeRegraDeNegocio>(() => MovimentacaoComercial.Registrar(
            Guid.NewGuid(), Guid.NewGuid(), "Cliente", [CriarLinha(1, -0.01m)],
            agora, null, null, OrigemDaMovimentacao.Recepcao, "usuario", agora));

        var movimentacao = CriarMovimentacao(Guid.NewGuid(), agora);
        movimentacao.Cancelar("Pedido informado incorretamente", "usuario", agora.AddMinutes(1));

        Assert.Equal(SituacaoDaMovimentacao.Cancelada, movimentacao.Situacao);
        Assert.Throws<ExcecaoDeConflito>(() => movimentacao.Cancelar("Novo motivo", "usuario", agora.AddMinutes(2)));
    }

    [Fact]
    [Trait("Categoria", "RequerDocker")]
    public async Task Deve_isolar_por_tenant_e_detectar_cancelamento_concorrente()
    {
        var ct = TestContext.Current.CancellationToken;
        var tenantA = Guid.NewGuid();
        var tenantB = Guid.NewGuid();
        var movimentacaoId = Guid.Empty;
        var opcoes = new DbContextOptionsBuilder<ContextoDeMovimentacoesComerciais>()
            .UseNpgsql(postgres.Conexao, postgres => postgres.MigrationsHistoryTable(
                ContextoDeMovimentacoesComerciais.Historico,
                ContextoDeMovimentacoesComerciais.Schema))
            .Options;

        await using (var preparacao = new ContextoDeMovimentacoesComerciais(opcoes, new UsuarioDeTeste(tenantA)))
        {
            await preparacao.Database.MigrateAsync(ct);
            await preparacao.Movimentacoes.IgnoreQueryFilters().ExecuteDeleteAsync(ct);
            var movimentacao = CriarMovimentacao(tenantA, DateTimeOffset.UtcNow);
            movimentacaoId = movimentacao.Id;
            preparacao.Add(movimentacao);
            await preparacao.SaveChangesAsync(ct);
        }

        await using (var outroTenant = new ContextoDeMovimentacoesComerciais(opcoes, new UsuarioDeTeste(tenantB)))
        {
            Assert.Empty(await outroTenant.Movimentacoes.AsNoTracking().ToListAsync(ct));
            var gerenciadorOutroTenant = CriarGerenciador(outroTenant, new UsuarioDeTeste(tenantB));
            Assert.Null(await gerenciadorOutroTenant.Obter(movimentacaoId, ct));
        }

        await using var primeiraSessao = new ContextoDeMovimentacoesComerciais(opcoes, new UsuarioDeTeste(tenantA));
        await using var segundaSessao = new ContextoDeMovimentacoesComerciais(opcoes, new UsuarioDeTeste(tenantA));
        var primeira = await primeiraSessao.Movimentacoes.SingleAsync(ct);
        Assert.NotNull(await CriarGerenciador(primeiraSessao, new UsuarioDeTeste(tenantA)).Obter(movimentacaoId, ct));
        var segunda = await segundaSessao.Movimentacoes.SingleAsync(ct);
        primeira.Cancelar("Primeiro cancelamento", "usuario-a", DateTimeOffset.UtcNow);
        segunda.Cancelar("Cancelamento concorrente", "usuario-b", DateTimeOffset.UtcNow);

        await primeiraSessao.SaveChangesAsync(ct);
        await Assert.ThrowsAsync<DbUpdateConcurrencyException>(() => segundaSessao.SaveChangesAsync(ct));
    }

    [Fact]
    [Trait("Categoria", "RequerDocker")]
    public async Task Deve_importar_ticket_com_origem_essence_de_forma_idempotente()
    {
        var ct = TestContext.Current.CancellationToken;
        var tenant = Guid.NewGuid();
        var usuario = new UsuarioDeTeste(tenant);
        var clienteId = Guid.NewGuid();
        var oferta = new OfertaDisponivelParaMovimentacao(Guid.NewGuid(), Guid.NewGuid(), "Itens sem detalhamento", Guid.NewGuid(), "Historico importado", 0m);
        var opcoes = new DbContextOptionsBuilder<ContextoDeMovimentacoesComerciais>()
            .UseNpgsql(postgres.Conexao, p => p.MigrationsHistoryTable(ContextoDeMovimentacoesComerciais.Historico, ContextoDeMovimentacoesComerciais.Schema)).Options;
        await using var banco = new ContextoDeMovimentacoesComerciais(opcoes, usuario); await banco.Database.MigrateAsync(ct);
        var gerenciador = new GerenciadorDeMovimentacoesComerciais(
            banco,
            new ConsultaDeClienteDeTeste(clienteId),
            new ConsultaDeCatalogoDeTeste(oferta),
            usuario,
            TimeProvider.System,
            new AuditoriaNula());
        var data = new DateTimeOffset(2026, 1, 2, 10, 30, 0, TimeSpan.FromHours(-3));
        var entrada = new DadosDaMovimentacao(clienteId, [new(oferta.Id, 1, 117.17m)], data, "8852", "Importado do Essence.");

        var primeira = await gerenciador.RegistrarImportada(entrada, ct);
        gerenciador.DescartarAlteracoesPendentes();
        var segunda = await gerenciador.RegistrarImportada(entrada, ct);
        var divergente = entrada with { Linhas = [new DadosDaLinha(Guid.NewGuid(), 1, 117.17m)] };
        var conflito = await Assert.ThrowsAsync<ExcecaoDeConflito>(() => gerenciador.RegistrarImportada(divergente, ct));

        Assert.False(primeira.Existente);
        Assert.True(segunda.Existente);
        Assert.Equal("movimentacao_importada_divergente", conflito.Codigo);
        Assert.Equal(OrigemDaMovimentacao.ImportacaoEssence, segunda.Movimentacao.Origem);
        Assert.Equal(117.17m, segunda.Movimentacao.ValorTotal);
        Assert.Single(await banco.Movimentacoes.AsNoTracking().ToListAsync(ct));
    }

    [Fact]
    [Trait("Categoria", "RequerDocker")]
    public async Task Deve_substituir_linhas_importadas_sem_duplicar_na_reexecucao()
    {
        var ct = TestContext.Current.CancellationToken;
        var tenant = Guid.NewGuid();
        var usuario = new UsuarioDeTeste(tenant);
        var clienteId = Guid.NewGuid();
        var ofertaHistorica = new OfertaDisponivelParaMovimentacao(Guid.NewGuid(), Guid.NewGuid(), "Historico", Guid.NewGuid(), "Importado", 0m);
        var ofertaCamisa = new OfertaDisponivelParaMovimentacao(Guid.NewGuid(), Guid.NewGuid(), "HML sintetico - Camisa", Guid.NewGuid(), "Composicao sintetica", 12m);
        var ofertaCalca = new OfertaDisponivelParaMovimentacao(Guid.NewGuid(), Guid.NewGuid(), "HML sintetico - Calca", ofertaCamisa.ServicoId, "Composicao sintetica", 15m);
        var opcoes = new DbContextOptionsBuilder<ContextoDeMovimentacoesComerciais>()
            .UseNpgsql(postgres.Conexao, p => p.MigrationsHistoryTable(ContextoDeMovimentacoesComerciais.Historico, ContextoDeMovimentacoesComerciais.Schema)).Options;
        await using var banco = new ContextoDeMovimentacoesComerciais(opcoes, usuario); await banco.Database.MigrateAsync(ct);
        var gerenciador = new GerenciadorDeMovimentacoesComerciais(
            banco,
            new ConsultaDeClienteDeTeste(clienteId),
            new ConsultaDeCatalogoMultiploDeTeste([ofertaHistorica, ofertaCamisa, ofertaCalca]),
            usuario,
            TimeProvider.System,
            new AuditoriaNula());
        var data = new DateTimeOffset(2026, 1, 2, 10, 30, 0, TimeSpan.FromHours(-3));
        await gerenciador.RegistrarImportada(new(
            clienteId,
            [new(ofertaHistorica.Id, 1, 117.17m)],
            data,
            "ticket-composicao",
            "Importado do Essence."), ct);
        gerenciador.DescartarAlteracoesPendentes();
        DadosDaLinha[] linhas =
        [
            new(ofertaCamisa.Id, 2, 30m),
            new(ofertaCalca.Id, 1, 57.17m)
        ];

        var primeira = await gerenciador.SubstituirComposicaoImportada(
            "ticket-composicao", linhas, "[HML SINTETICO] Composicao de teste.", ct);
        gerenciador.DescartarAlteracoesPendentes();
        var segunda = await gerenciador.SubstituirComposicaoImportada(
            "ticket-composicao", linhas, "[HML SINTETICO] Composicao de teste.", ct);
        var persistida = await banco.Movimentacoes.AsNoTracking().Include(x => x.Linhas)
            .SingleAsync(x => x.CodigoExterno == "ticket-composicao", ct);

        Assert.Equal(SituacaoDaSubstituicaoDeComposicao.Atualizada, primeira.Situacao);
        Assert.Equal(SituacaoDaSubstituicaoDeComposicao.Inalterada, segunda.Situacao);
        Assert.Equal(2, persistida.Linhas.Count);
        Assert.Equal(117.17m, persistida.Linhas.Sum(x => x.Subtotal));
        Assert.Equal(2, await banco.Linhas.CountAsync(x => x.MovimentacaoComercialId == persistida.Id, ct));
    }

    private static MovimentacaoComercial CriarMovimentacao(Guid tenantId, DateTimeOffset agora) =>
        MovimentacaoComercial.Registrar(
            tenantId,
            Guid.NewGuid(),
            "Cliente de teste",
            [CriarLinha(1, 120.50m)],
            agora,
            $"teste-{Guid.NewGuid():N}",
            null,
            OrigemDaMovimentacao.Recepcao,
            "usuario-de-teste",
            agora);

    private static LinhaPreparada CriarLinha(int quantidade, decimal preco) =>
        new(Guid.NewGuid(), Guid.NewGuid(), "Tapete", Guid.NewGuid(), "Lavagem", quantidade, 125m, preco);

    private static GerenciadorDeMovimentacoesComerciais CriarGerenciador(ContextoDeMovimentacoesComerciais banco, UsuarioDeTeste usuario) =>
        new(banco, new ConsultaDeClienteDeTeste(Guid.NewGuid()), new ConsultaDeCatalogoDeTeste(new(Guid.NewGuid(), Guid.NewGuid(), "Artigo", Guid.NewGuid(), "Servico", 1m)), usuario, TimeProvider.System, new AuditoriaNula());

    private sealed record UsuarioDeTeste(Guid TenantId) : IContextoDoUsuario
    {
        public bool Autenticado => true;
        public string UsuarioIdentidadeId => "usuario-de-teste";
    }

    private sealed record ConsultaDeClienteDeTeste(Guid ClienteId) : IConsultaDeClienteParaMovimentacao
    {
        public Task<ClienteDisponivelParaMovimentacao?> ObterAtivo(Guid id, CancellationToken cancellationToken) =>
            Task.FromResult<ClienteDisponivelParaMovimentacao?>(id == ClienteId ? new(id, "Cliente de teste") : null);
    }

    private sealed record ConsultaDeCatalogoDeTeste(OfertaDisponivelParaMovimentacao Oferta) : IConsultaDeCatalogoParaMovimentacao
    {
        public Task<OfertaDisponivelParaMovimentacao?> ObterOfertaAtiva(Guid id, CancellationToken cancellationToken) =>
            Task.FromResult<OfertaDisponivelParaMovimentacao?>(id == Oferta.Id ? Oferta : null);

        public Task<OfertaDisponivelParaMovimentacao?> ObterOfertaParaImportacao(Guid id, CancellationToken cancellationToken) =>
            Task.FromResult<OfertaDisponivelParaMovimentacao?>(id == Oferta.Id ? Oferta : null);
    }


    private sealed class ConsultaDeCatalogoMultiploDeTeste(IEnumerable<OfertaDisponivelParaMovimentacao> ofertas)
        : IConsultaDeCatalogoParaMovimentacao
    {
        private readonly IReadOnlyDictionary<Guid, OfertaDisponivelParaMovimentacao> ofertas = ofertas.ToDictionary(x => x.Id);

        public Task<OfertaDisponivelParaMovimentacao?> ObterOfertaAtiva(Guid id, CancellationToken cancellationToken) =>
            Task.FromResult(ofertas.GetValueOrDefault(id));

        public Task<OfertaDisponivelParaMovimentacao?> ObterOfertaParaImportacao(Guid id, CancellationToken cancellationToken) =>
            Task.FromResult(ofertas.GetValueOrDefault(id));
    }
}
