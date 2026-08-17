namespace LavaMais.Crm.Modulos.Auditoria.Dominio;

public sealed class RegistroDeAuditoria
{
    private RegistroDeAuditoria() { }
    internal RegistroDeAuditoria(Guid tenantId, string usuarioId, string tipo, string recurso, Guid recursoId, string dadosJson, DateTimeOffset data)
    { Id = Guid.NewGuid(); TenantId = tenantId; UsuarioIdentidadeId = usuarioId; Tipo = tipo; Recurso = recurso; RecursoId = recursoId; DadosJson = dadosJson; Data = data; }
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public string UsuarioIdentidadeId { get; private set; } = string.Empty;
    public string Tipo { get; private set; } = string.Empty;
    public string Recurso { get; private set; } = string.Empty;
    public Guid RecursoId { get; private set; }
    public string DadosJson { get; private set; } = string.Empty;
    public DateTimeOffset Data { get; private set; }
}
