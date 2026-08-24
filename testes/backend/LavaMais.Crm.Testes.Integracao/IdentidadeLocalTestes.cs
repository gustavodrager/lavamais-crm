using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;
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
        await banco.Sessoes.ExecuteDeleteAsync(TestContext.Current.CancellationToken); await banco.Usuarios.ExecuteDeleteAsync(TestContext.Current.CancellationToken);
        var configuracao = Options.Create(new OpcoesDeIdentidadeLocal { TenantId = Guid.NewGuid(), TelefonePermitido = "11997372540", NomeTenant = "LavaMais" });
        var servico = new ServicoDeIdentidade(banco, configuracao, TimeProvider.System);

        await Assert.ThrowsAsync<ExcecaoDeRegraDeNegocio>(() => servico.PrimeiroAcesso("11999999999", "uma-senha-segura", TestContext.Current.CancellationToken));
        var primeira = await servico.PrimeiroAcesso("(11) 99737-2540", "uma-senha-segura", TestContext.Current.CancellationToken);
        await Assert.ThrowsAsync<ExcecaoDeRegraDeNegocio>(() => servico.PrimeiroAcesso("11997372540", "outra-senha-segura", TestContext.Current.CancellationToken));
        await Assert.ThrowsAsync<ExcecaoDeRegraDeNegocio>(() => servico.Entrar("11997372540", "senha-incorreta", TestContext.Current.CancellationToken));
        var entrada = await servico.Entrar("11997372540", "uma-senha-segura", TestContext.Current.CancellationToken);

        Assert.NotEmpty(primeira.Token); Assert.NotEmpty(entrada.Token); Assert.NotEqual(primeira.Token, entrada.Token);
        Assert.DoesNotContain(primeira.Token, (await banco.Usuarios.SingleAsync(TestContext.Current.CancellationToken)).SenhaProtegida);
        Assert.DoesNotContain(primeira.Token, (await banco.Sessoes.FirstAsync(TestContext.Current.CancellationToken)).TokenHash);
    }
}
