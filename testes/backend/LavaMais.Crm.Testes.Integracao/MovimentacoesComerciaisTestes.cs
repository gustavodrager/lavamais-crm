using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
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
        var opcoes = new DbContextOptionsBuilder<ContextoDeMovimentacoesComerciais>()
            .UseNpgsql(postgres.Conexao, postgres => postgres.MigrationsHistoryTable(
                ContextoDeMovimentacoesComerciais.Historico,
                ContextoDeMovimentacoesComerciais.Schema))
            .Options;

        await using (var preparacao = new ContextoDeMovimentacoesComerciais(opcoes, new UsuarioDeTeste(tenantA)))
        {
            await preparacao.Database.MigrateAsync(ct);
            await preparacao.Movimentacoes.IgnoreQueryFilters().ExecuteDeleteAsync(ct);
            preparacao.Add(CriarMovimentacao(tenantA, DateTimeOffset.UtcNow));
            await preparacao.SaveChangesAsync(ct);
        }

        await using (var outroTenant = new ContextoDeMovimentacoesComerciais(opcoes, new UsuarioDeTeste(tenantB)))
            Assert.Empty(await outroTenant.Movimentacoes.AsNoTracking().ToListAsync(ct));

        await using var primeiraSessao = new ContextoDeMovimentacoesComerciais(opcoes, new UsuarioDeTeste(tenantA));
        await using var segundaSessao = new ContextoDeMovimentacoesComerciais(opcoes, new UsuarioDeTeste(tenantA));
        var primeira = await primeiraSessao.Movimentacoes.SingleAsync(ct);
        var segunda = await segundaSessao.Movimentacoes.SingleAsync(ct);
        primeira.Cancelar("Primeiro cancelamento", "usuario-a", DateTimeOffset.UtcNow);
        segunda.Cancelar("Cancelamento concorrente", "usuario-b", DateTimeOffset.UtcNow);

        await primeiraSessao.SaveChangesAsync(ct);
        await Assert.ThrowsAsync<DbUpdateConcurrencyException>(() => segundaSessao.SaveChangesAsync(ct));
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

    private sealed record UsuarioDeTeste(Guid TenantId) : IContextoDoUsuario
    {
        public bool Autenticado => true;
        public string UsuarioIdentidadeId => "usuario-de-teste";
    }
}
