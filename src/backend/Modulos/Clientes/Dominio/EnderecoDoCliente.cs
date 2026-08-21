namespace LavaMais.Crm.Modulos.Clientes.Dominio;

public sealed class EnderecoDoCliente
{
    private EnderecoDoCliente() { }
    internal EnderecoDoCliente(Guid tenantId, string? logradouro, string? numero, string? complemento, string? bairro, string? cidade, string? estado, string? cep)
    {
        Id = Guid.NewGuid();
        TenantId = tenantId;
        Logradouro = logradouro?.Trim();
        Numero = numero?.Trim();
        Complemento = complemento?.Trim();
        Bairro = bairro?.Trim();
        Cidade = cidade?.Trim();
        Estado = estado?.Trim().ToUpperInvariant();
        Cep = cep is null ? null : new string(cep.Where(char.IsDigit).ToArray());
    }
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public Guid ClienteId { get; private set; }
    public string? Logradouro { get; private set; }
    public string? Numero { get; private set; }
    public string? Complemento { get; private set; }
    public string? Bairro { get; private set; }
    public string? Cidade { get; private set; }
    public string? Estado { get; private set; }
    public string? Cep { get; private set; }
    internal void Atualizar(EnderecoDoCliente endereco)
    {
        Logradouro = endereco.Logradouro; Numero = endereco.Numero; Complemento = endereco.Complemento;
        Bairro = endereco.Bairro; Cidade = endereco.Cidade; Estado = endereco.Estado; Cep = endereco.Cep;
    }
}
