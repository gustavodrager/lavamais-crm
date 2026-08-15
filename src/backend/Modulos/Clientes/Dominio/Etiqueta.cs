using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;

namespace LavaMais.Crm.Modulos.Clientes.Dominio;

public sealed class Etiqueta
{
    private Etiqueta() { }
    private Etiqueta(Guid tenantId, string nome, DateTimeOffset agora)
    {
        Id = Guid.NewGuid(); TenantId = tenantId;
        Nome = string.IsNullOrWhiteSpace(nome) || nome.Trim().Length > 80
            ? throw new ExcecaoDeRegraDeNegocio("nome_etiqueta_invalido", "O nome da etiqueta e obrigatorio e deve possuir ate 80 caracteres.")
            : nome.Trim();
        NomeNormalizado = Nome.ToUpperInvariant(); DataCriacao = agora;
    }
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public string Nome { get; private set; } = string.Empty;
    public string NomeNormalizado { get; private set; } = string.Empty;
    public DateTimeOffset DataCriacao { get; private set; }
    public static Etiqueta Criar(Guid tenantId, string nome, DateTimeOffset agora) => new(tenantId, nome, agora);
}
