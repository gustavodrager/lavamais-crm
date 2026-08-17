using System.Data.Common;

namespace LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Integracoes;

public interface IProjecaoDeEnvios
{
    Task RegistrarSolicitacao(Guid tenantId, Guid destinatarioId, string notificacaoId, DbTransaction transacao, CancellationToken ct);
    Task<IReadOnlyCollection<NotificacaoPendente>> ListarPendentes(int limite, CancellationToken ct);
    Task AtualizarEstado(Guid tenantId, Guid destinatarioId, string estadoExterno, string? codigoFalha, CancellationToken ct);
}
public sealed record NotificacaoPendente(Guid TenantId, Guid DestinatarioId, string NotificacaoId);
