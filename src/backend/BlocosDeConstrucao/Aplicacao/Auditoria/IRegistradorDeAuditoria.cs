using System.Data.Common;

namespace LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Auditoria;

public interface IRegistradorDeAuditoria
{
    Task Registrar(RegistroDeAuditoriaSolicitado registro, DbTransaction transacao, CancellationToken ct);
}

public sealed record RegistroDeAuditoriaSolicitado(string Tipo, string Recurso, Guid RecursoId, string DadosJson, DateTimeOffset Data);
