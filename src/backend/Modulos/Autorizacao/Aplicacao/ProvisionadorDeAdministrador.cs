using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.Modulos.Autorizacao.Dominio;
using LavaMais.Crm.Modulos.Autorizacao.Infraestrutura;
using Microsoft.EntityFrameworkCore;

namespace LavaMais.Crm.Modulos.Autorizacao.Aplicacao;

public static class ProvisionadorDeAdministrador
{
    public static async Task Provisionar(
        string conexao,
        Guid tenantId,
        string usuarioIdentidadeId,
        CancellationToken cancellationToken)
    {
        var opcoes = new DbContextOptionsBuilder<ContextoDeAutorizacao>()
            .UseNpgsql(conexao, postgres => postgres.MigrationsHistoryTable(
                ContextoDeAutorizacao.TabelaDeHistoricoDasMigrations,
                ContextoDeAutorizacao.Schema))
            .Options;
        await using var banco = new ContextoDeAutorizacao(opcoes, new ContextoDeProvisionamento(tenantId, usuarioIdentidadeId));
        await banco.Database.MigrateAsync(cancellationToken);

        var existe = await banco.UsuariosCrm.IgnoreQueryFilters().AnyAsync(
            usuario => usuario.TenantId == tenantId && usuario.UsuarioIdentidadeId == usuarioIdentidadeId,
            cancellationToken);
        if (existe) throw new ExcecaoDeConflito("usuario_ja_cadastrado", "O usuario ja esta cadastrado neste tenant.");

        banco.Add(UsuarioCrm.Criar(tenantId, usuarioIdentidadeId, PapelDoCrm.Administrador, TimeProvider.System.GetUtcNow()));
        await banco.SaveChangesAsync(cancellationToken);
    }

    private sealed record ContextoDeProvisionamento(Guid TenantId, string UsuarioIdentidadeId) : IContextoDoUsuario
    {
        public bool Autenticado => true;
    }
}
