using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.Modulos.Autorizacao.Aplicacao;
using LavaMais.Crm.Modulos.Autorizacao.Dominio;
using LavaMais.Crm.Modulos.Autorizacao.Infraestrutura;
using LavaMais.Crm.Modulos.Identidade.Aplicacao;
using LavaMais.Crm.Modulos.Identidade.Infraestrutura;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace LavaMais.Crm.Testes.Integracao;

public sealed class IdentidadeLocalTestes(PostgresCompartilhado postgres)
{
    [Fact]
    public async Task Deve_ativar_somente_o_telefone_permitido_e_autenticar_com_a_senha_definida()
    {
        var opcoesBanco = new DbContextOptionsBuilder<ContextoDeIdentidade>().UseNpgsql(postgres.Conexao, x => x.MigrationsHistoryTable(ContextoDeIdentidade.Historico, ContextoDeIdentidade.Schema)).Options;
        await using var banco = new ContextoDeIdentidade(opcoesBanco); await banco.Database.MigrateAsync(TestContext.Current.CancellationToken);
        var tenantId = Guid.NewGuid();
        var opcoesAutorizacao = new DbContextOptionsBuilder<ContextoDeAutorizacao>().UseNpgsql(postgres.Conexao, x => x.MigrationsHistoryTable(ContextoDeAutorizacao.TabelaDeHistoricoDasMigrations, ContextoDeAutorizacao.Schema)).Options;
        await using var bancoAutorizacao = new ContextoDeAutorizacao(opcoesAutorizacao, new ContextoDeTeste(tenantId));
        await bancoAutorizacao.Database.MigrateAsync(TestContext.Current.CancellationToken);
        await banco.Sessoes.ExecuteDeleteAsync(TestContext.Current.CancellationToken); await banco.Usuarios.ExecuteDeleteAsync(TestContext.Current.CancellationToken);
        await bancoAutorizacao.UsuariosCrm.IgnoreQueryFilters().ExecuteDeleteAsync(TestContext.Current.CancellationToken);
        var configuracao = Options.Create(new OpcoesDeIdentidadeLocal { TenantId = tenantId, TelefonePermitido = "11997372540", NomeTenant = "LavaMais" });
        var servico = new ServicoDeIdentidade(banco, new AutorizacaoDaIdentidade(bancoAutorizacao), configuracao, TimeProvider.System);

        await Assert.ThrowsAsync<ExcecaoDeRegraDeNegocio>(() => servico.PrimeiroAcesso("11999999999", "uma-senha-segura", TestContext.Current.CancellationToken));
        var primeira = await servico.PrimeiroAcesso("(11) 99737-2540", "uma-senha-segura", TestContext.Current.CancellationToken);
        await Assert.ThrowsAsync<ExcecaoDeRegraDeNegocio>(() => servico.PrimeiroAcesso("11997372540", "outra-senha-segura", TestContext.Current.CancellationToken));
        await Assert.ThrowsAsync<ExcecaoDeRegraDeNegocio>(() => servico.Entrar("11997372540", "senha-incorreta", TestContext.Current.CancellationToken));
        var autorizacao = await bancoAutorizacao.UsuariosCrm.IgnoreQueryFilters().SingleAsync(TestContext.Current.CancellationToken);
        autorizacao.AlterarPapel(PapelDoCrm.Gerente, DateTimeOffset.UtcNow);
        await bancoAutorizacao.SaveChangesAsync(TestContext.Current.CancellationToken);
        var entrada = await servico.Entrar("11997372540", "uma-senha-segura", TestContext.Current.CancellationToken);

        Assert.NotEmpty(primeira.Token); Assert.NotEmpty(entrada.Token); Assert.NotEqual(primeira.Token, entrada.Token);
        Assert.Equal("Administrador", primeira.Papel);
        Assert.Equal("Gerente", entrada.Papel);
        Assert.DoesNotContain(primeira.Token, (await banco.Usuarios.SingleAsync(TestContext.Current.CancellationToken)).SenhaProtegida);
        Assert.DoesNotContain(primeira.Token, (await banco.Sessoes.FirstAsync(TestContext.Current.CancellationToken)).TokenHash);
        Assert.Equal(PapelDoCrm.Gerente, autorizacao.Papel);
        Assert.Equal((await banco.Usuarios.SingleAsync(TestContext.Current.CancellationToken)).Id.ToString(), autorizacao.UsuarioIdentidadeId);
    }

    [Fact]
    public async Task Deve_ativar_usuarios_iniciais_com_papeis_diferentes()
    {
        var opcoesBanco = new DbContextOptionsBuilder<ContextoDeIdentidade>().UseNpgsql(postgres.Conexao, x => x.MigrationsHistoryTable(ContextoDeIdentidade.Historico, ContextoDeIdentidade.Schema)).Options;
        await using var banco = new ContextoDeIdentidade(opcoesBanco); await banco.Database.MigrateAsync(TestContext.Current.CancellationToken);
        var tenantId = Guid.NewGuid();
        var opcoesAutorizacao = new DbContextOptionsBuilder<ContextoDeAutorizacao>().UseNpgsql(postgres.Conexao, x => x.MigrationsHistoryTable(ContextoDeAutorizacao.TabelaDeHistoricoDasMigrations, ContextoDeAutorizacao.Schema)).Options;
        await using var bancoAutorizacao = new ContextoDeAutorizacao(opcoesAutorizacao, new ContextoDeTeste(tenantId));
        await bancoAutorizacao.Database.MigrateAsync(TestContext.Current.CancellationToken);
        await banco.Sessoes.ExecuteDeleteAsync(TestContext.Current.CancellationToken); await banco.Usuarios.ExecuteDeleteAsync(TestContext.Current.CancellationToken);
        await bancoAutorizacao.UsuariosCrm.IgnoreQueryFilters().ExecuteDeleteAsync(TestContext.Current.CancellationToken);
        var configuracao = Options.Create(new OpcoesDeIdentidadeLocal
        {
            TenantId = tenantId,
            NomeTenant = "LavaMais",
            UsuariosIniciais =
            [
                new() { Telefone = "11900000001", Nome = "Usuario Administrador", Papel = "Administrador" },
                new() { Telefone = "11900000002", Nome = "Usuario Gerente", Papel = "Gerente" },
                new() { Telefone = "11900000003", Nome = "Usuario Operador", Papel = "Operador" }
            ]
        });
        var servico = new ServicoDeIdentidade(banco, new AutorizacaoDaIdentidade(bancoAutorizacao), configuracao, TimeProvider.System);

        Assert.True(await servico.PrimeiroAcessoDisponivel(TestContext.Current.CancellationToken));
        var administrador = await servico.PrimeiroAcesso("11900000001", "senha-admin-segura", TestContext.Current.CancellationToken);
        var gerente = await servico.PrimeiroAcesso("11900000002", "senha-gerente-segura", TestContext.Current.CancellationToken);
        var operador = await servico.PrimeiroAcesso("11900000003", "senha-operador-segura", TestContext.Current.CancellationToken);

        Assert.False(await servico.PrimeiroAcessoDisponivel(TestContext.Current.CancellationToken));
        Assert.Equal("Administrador", administrador.Papel);
        Assert.Equal("Gerente", gerente.Papel);
        Assert.Equal("Operador", operador.Papel);
        var papeis = await bancoAutorizacao.UsuariosCrm.IgnoreQueryFilters().OrderBy(usuario => usuario.Papel).Select(usuario => usuario.Papel).ToListAsync(TestContext.Current.CancellationToken);
        Assert.Equal([PapelDoCrm.Administrador, PapelDoCrm.Gerente, PapelDoCrm.Operador], papeis);
    }

    private sealed record ContextoDeTeste(Guid TenantId) : IContextoDoUsuario
    {
        public bool Autenticado => true;
        public string UsuarioIdentidadeId => "usuario-de-teste";
    }
}
