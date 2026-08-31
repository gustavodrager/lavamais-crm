using System.Data.Common;

namespace LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Integracoes;

public interface IProjecaoDeEnvios
{
    Task RegistrarSolicitacao(Guid tenantId, Guid destinatarioId, ReferenciaDeNotificacao referencia, DbTransaction transacao, CancellationToken ct);
    Task RegistrarFalhaNaSolicitacao(Guid tenantId, Guid destinatarioId, string codigoFalha, DbTransaction transacao, CancellationToken ct);
    Task<IReadOnlyCollection<NotificacaoPendente>> ListarPendentes(int limite, CancellationToken ct);
    Task AtualizarEstado(Guid tenantId, Guid destinatarioId, EstadoConsolidadoDaNotificacao estado, CancellationToken ct);
}

public sealed record NotificacaoPendente(Guid TenantId, Guid DestinatarioId, ReferenciaDeNotificacao Referencia);
