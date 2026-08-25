using System.Data.Common;

namespace LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;

public interface IAutorizacaoDaIdentidade
{
    Task ProvisionarAdministradorInicial(
        Guid tenantId,
        string usuarioIdentidadeId,
        DbTransaction transacao,
        DateTimeOffset agora,
        CancellationToken cancellationToken);

    Task<string?> ObterPapelAtivo(
        Guid tenantId,
        string usuarioIdentidadeId,
        CancellationToken cancellationToken);
}
