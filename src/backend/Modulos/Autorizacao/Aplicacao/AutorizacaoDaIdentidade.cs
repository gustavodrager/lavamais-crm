using System.Data.Common;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.Modulos.Autorizacao.Dominio;
using LavaMais.Crm.Modulos.Autorizacao.Infraestrutura;
using Microsoft.EntityFrameworkCore;

namespace LavaMais.Crm.Modulos.Autorizacao.Aplicacao;

public sealed class AutorizacaoDaIdentidade(ContextoDeAutorizacao banco) : IAutorizacaoDaIdentidade
{
    public async Task ProvisionarAdministradorInicial(
        Guid tenantId,
        string usuarioIdentidadeId,
        DbTransaction transacao,
        DateTimeOffset agora,
        CancellationToken cancellationToken)
    {
        banco.Database.SetDbConnection(transacao.Connection!, contextOwnsConnection: false);
        await banco.Database.UseTransactionAsync(transacao, cancellationToken);

        var existente = await banco.UsuariosCrm.IgnoreQueryFilters().SingleOrDefaultAsync(
            usuario => usuario.TenantId == tenantId && usuario.UsuarioIdentidadeId == usuarioIdentidadeId,
            cancellationToken);

        if (existente is not null)
            throw new ExcecaoDeConflito("autorizacao_ja_provisionada", "O usuario inicial ja possui autorizacao no CRM.");

        banco.Add(UsuarioCrm.Criar(tenantId, usuarioIdentidadeId, PapelDoCrm.Administrador, agora));
        await banco.SaveChangesAsync(cancellationToken);
    }

    public async Task<string?> ObterPapelAtivo(
        Guid tenantId,
        string usuarioIdentidadeId,
        CancellationToken cancellationToken) =>
        await banco.UsuariosCrm.IgnoreQueryFilters().AsNoTracking()
            .Where(usuario => usuario.TenantId == tenantId
                && usuario.UsuarioIdentidadeId == usuarioIdentidadeId
                && usuario.Situacao == SituacaoDoUsuarioCrm.Ativo)
            .Select(usuario => usuario.Papel.ToString())
            .SingleOrDefaultAsync(cancellationToken);
}
