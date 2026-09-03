using System.Data.Common;

namespace LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Auditoria;

public interface IRegistradorDeAuditoria
{
    Task Registrar(RegistroDeAuditoriaSolicitado registro, DbTransaction transacao, CancellationToken ct);
}

public sealed record RegistroDeAuditoriaSolicitado(string Tipo, string Recurso, Guid RecursoId, string DadosJson, DateTimeOffset Data);

public interface IRegistradorDeAuditoriaDeIdentidade
{
    Task Registrar(EventoDeAuditoriaDeIdentidade evento, Guid tenantId, Guid usuarioId, DbTransaction transacao, DateTimeOffset data, CancellationToken ct);
}

public enum EventoDeAuditoriaDeIdentidade
{
    UsuarioInicialAtivado,
    SessaoCriada,
    SessaoRevogada,
    AutorizacaoInicialProvisionada
}
