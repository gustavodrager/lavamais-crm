namespace LavaMais.Crm.Modulos.Clientes.Dominio;

public enum TipoDeContato { Whatsapp = 1, Email = 2 }
public enum SituacaoDoContato { Ativo = 1, Inativo = 2 }

public sealed class ContatoDoCliente
{
    private ContatoDoCliente() { }
    private ContatoDoCliente(Guid tenantId, Guid clienteId, TipoDeContato tipo, string valor, string normalizado)
    { Id = Guid.NewGuid(); TenantId = tenantId; ClienteId = clienteId; Tipo = tipo; Valor = valor; ValorNormalizado = normalizado; Situacao = SituacaoDoContato.Ativo; }
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public Guid ClienteId { get; private set; }
    public TipoDeContato Tipo { get; private set; }
    public string Valor { get; private set; } = string.Empty;
    public string ValorNormalizado { get; private set; } = string.Empty;
    public SituacaoDoContato Situacao { get; private set; }
    internal static ContatoDoCliente CriarWhatsapp(Guid tenantId, Guid clienteId, string valor) => new(tenantId, clienteId, TipoDeContato.Whatsapp, valor.Trim(), NormalizadorDeWhatsapp.Normalizar(valor));
    internal static ContatoDoCliente CriarEmail(Guid tenantId, Guid clienteId, string valor) => new(tenantId, clienteId, TipoDeContato.Email, valor, valor.ToLowerInvariant());
    internal void AtualizarWhatsapp(string valor) { Valor = valor.Trim(); ValorNormalizado = NormalizadorDeWhatsapp.Normalizar(valor); Situacao = SituacaoDoContato.Ativo; }
    internal void AtualizarEmail(string valor) { Valor = valor; ValorNormalizado = valor.ToLowerInvariant(); Situacao = SituacaoDoContato.Ativo; }
    internal void Inativar() => Situacao = SituacaoDoContato.Inativo;
}

public sealed class PermissaoDeComunicacao
{
    private PermissaoDeComunicacao() { }
    internal PermissaoDeComunicacao(Guid tenantId, Guid clienteId, bool permitida, DateTimeOffset agora)
    { Id = Guid.NewGuid(); TenantId = tenantId; ClienteId = clienteId; Canal = TipoDeContato.Whatsapp; Finalidade = "Marketing"; Permitida = permitida; DataAtualizacao = agora; }
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public Guid ClienteId { get; private set; }
    public TipoDeContato Canal { get; private set; }
    public string Finalidade { get; private set; } = string.Empty;
    public bool Permitida { get; private set; }
    public DateTimeOffset DataAtualizacao { get; private set; }
    internal void Definir(bool permitida, DateTimeOffset agora) { Permitida = permitida; DataAtualizacao = agora; }
}
