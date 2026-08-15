namespace LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;

public interface IContextoDoUsuario
{
    bool Autenticado { get; }
    Guid TenantId { get; }
    string UsuarioIdentidadeId { get; }
}
