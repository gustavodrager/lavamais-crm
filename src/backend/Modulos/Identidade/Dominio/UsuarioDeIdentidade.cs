using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;

namespace LavaMais.Crm.Modulos.Identidade.Dominio;

public sealed class UsuarioDeIdentidade
{
    private UsuarioDeIdentidade() { }
    private UsuarioDeIdentidade(Guid tenantId, string telefone, string nome, string papel, string senhaProtegida, DateTimeOffset agora)
    {
        Id = Guid.NewGuid(); TenantId = tenantId; Telefone = telefone; Nome = nome; SenhaProtegida = senhaProtegida;
        Papel = papel; Ativo = true; DataCriacao = agora; DataAtualizacao = agora;
    }
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public string Telefone { get; private set; } = string.Empty;
    public string Nome { get; private set; } = string.Empty;
    public string SenhaProtegida { get; private set; } = string.Empty;
    public string Papel { get; private set; } = string.Empty;
    public bool Ativo { get; private set; }
    public DateTimeOffset DataCriacao { get; private set; }
    public DateTimeOffset DataAtualizacao { get; private set; }
    public uint Versao { get; private set; }
    public static UsuarioDeIdentidade Ativar(Guid tenantId, string telefone, string nome, string papel, string senhaProtegida, DateTimeOffset agora)
    {
        if (tenantId == Guid.Empty) throw new ExcecaoDeRegraDeNegocio("tenant_invalido", "O tenant inicial e obrigatorio.");
        if (telefone.Length != 11) throw new ExcecaoDeRegraDeNegocio("telefone_invalido", "Informe um telefone com DDD.");
        if (string.IsNullOrWhiteSpace(papel)) throw new ExcecaoDeRegraDeNegocio("papel_invalido", "O papel inicial do usuario e obrigatorio.");
        return new(tenantId, telefone, string.IsNullOrWhiteSpace(nome) ? "Usuario LavaMais" : nome.Trim(), papel.Trim(), senhaProtegida, agora);
    }
}

public sealed class SessaoDeIdentidade
{
    private SessaoDeIdentidade() { }
    public SessaoDeIdentidade(Guid usuarioId, string tokenHash, DateTimeOffset agora, DateTimeOffset expiraEm)
    { Id = Guid.NewGuid(); UsuarioId = usuarioId; TokenHash = tokenHash; DataCriacao = agora; ExpiraEm = expiraEm; }
    public Guid Id { get; private set; }
    public Guid UsuarioId { get; private set; }
    public string TokenHash { get; private set; } = string.Empty;
    public DateTimeOffset DataCriacao { get; private set; }
    public DateTimeOffset ExpiraEm { get; private set; }
    public DateTimeOffset? DataRevogacao { get; private set; }
    public void Revogar(DateTimeOffset agora) => DataRevogacao ??= agora;
}
