using System.Data.Common;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.Modulos.Autorizacao.Dominio;
using LavaMais.Crm.Modulos.Autorizacao.Infraestrutura;
using Microsoft.EntityFrameworkCore;

namespace LavaMais.Crm.Modulos.Autorizacao.Aplicacao;

public sealed class AutorizacaoDaIdentidade(ContextoDeAutorizacao banco) : IAutorizacaoDaIdentidade
{
    public async Task ProvisionarUsuarioInicial(
        Guid tenantId,
        string usuarioIdentidadeId,
        string papel,
        DbTransaction transacao,
        DateTimeOffset agora,
        CancellationToken cancellationToken)
    {
        if (!Enum.TryParse<PapelDoCrm>(papel, ignoreCase: true, out var papelDoCrm))
            throw new ExcecaoDeRegraDeNegocio("papel_invalido", "O papel inicial do usuario nao e valido.");

        banco.Database.SetDbConnection(transacao.Connection!, contextOwnsConnection: false);
        await banco.Database.UseTransactionAsync(transacao, cancellationToken);

        var existente = await banco.UsuariosCrm.IgnoreQueryFilters().SingleOrDefaultAsync(
            usuario => usuario.TenantId == tenantId && usuario.UsuarioIdentidadeId == usuarioIdentidadeId,
            cancellationToken);

        if (existente is not null)
            throw new ExcecaoDeConflito("autorizacao_ja_provisionada", "O usuario inicial ja possui autorizacao no CRM.");

        banco.Add(UsuarioCrm.Criar(tenantId, usuarioIdentidadeId, papelDoCrm, agora));
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
