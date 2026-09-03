using System.Data.Common;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Auditoria;

namespace LavaMais.Crm.Testes.Integracao;

internal sealed class AuditoriaNula : IRegistradorDeAuditoria, IRegistradorDeAuditoriaDeIdentidade
{
    public Task Registrar(RegistroDeAuditoriaSolicitado registro, DbTransaction transacao, CancellationToken ct) => Task.CompletedTask;
    public Task Registrar(EventoDeAuditoriaDeIdentidade evento, Guid tenantId, Guid usuarioId, DbTransaction transacao, DateTimeOffset data, CancellationToken ct) => Task.CompletedTask;
}
