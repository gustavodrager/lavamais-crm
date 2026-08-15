using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;

namespace LavaMais.Crm.Modulos.Clientes.Dominio;

public enum SituacaoDoCliente { Ativo = 1, Inativo = 2 }

public sealed class Cliente
{
    private Cliente() { }

    private Cliente(Guid tenantId, string nome, string whatsapp, DateTimeOffset agora)
    {
        Id = Guid.NewGuid();
        TenantId = tenantId != Guid.Empty ? tenantId : throw new ExcecaoDeRegraDeNegocio("tenant_invalido", "O tenant e obrigatorio.");
        DefinirNome(nome);
        Contatos.Add(ContatoDoCliente.CriarWhatsapp(TenantId, Id, whatsapp));
        Situacao = SituacaoDoCliente.Ativo;
        DataCriacao = agora;
        DataAtualizacao = agora;
    }

    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public string Nome { get; private set; } = string.Empty;
    public string? NomeFantasia { get; private set; }
    public string? Tipo { get; private set; }
    public DateOnly? DataNascimento { get; private set; }
    public SituacaoDoCliente Situacao { get; private set; }
    public DateTimeOffset DataCriacao { get; private set; }
    public DateTimeOffset DataAtualizacao { get; private set; }
    public uint Versao { get; private set; }
    public EnderecoDoCliente? Endereco { get; private set; }
    public ICollection<ContatoDoCliente> Contatos { get; private set; } = new List<ContatoDoCliente>();
    public ICollection<PermissaoDeComunicacao> Permissoes { get; private set; } = new List<PermissaoDeComunicacao>();
    public ICollection<ClienteEtiqueta> Etiquetas { get; private set; } = new List<ClienteEtiqueta>();

    public static Cliente Criar(Guid tenantId, string nome, string whatsapp, DateTimeOffset agora) => new(tenantId, nome, whatsapp, agora);

    public void Atualizar(string nome, string whatsapp, string? nomeFantasia, string? tipo, string? email, DateOnly? dataNascimento,
        bool permiteMarketingWhatsapp, EnderecoDoCliente? endereco, IEnumerable<Guid> etiquetaIds, DateTimeOffset agora)
    {
        DefinirNome(nome);
        Contatos.Clear();
        Contatos.Add(ContatoDoCliente.CriarWhatsapp(TenantId, Id, whatsapp));
        NomeFantasia = Limitar(nomeFantasia, 200, "nome_fantasia_invalido");
        Tipo = Limitar(tipo, 50, "tipo_invalido");
        var emailNormalizado = Limitar(email, 254, "email_invalido")?.ToLowerInvariant();
        if (emailNormalizado is not null) Contatos.Add(ContatoDoCliente.CriarEmail(TenantId, Id, emailNormalizado));
        DataNascimento = dataNascimento;
        Permissoes.Clear();
        Permissoes.Add(new PermissaoDeComunicacao(TenantId, Id, permiteMarketingWhatsapp, agora));
        Endereco = endereco;
        Etiquetas.Clear();
        foreach (var etiquetaId in etiquetaIds.Distinct()) Etiquetas.Add(new ClienteEtiqueta(TenantId, Id, etiquetaId));
        DataAtualizacao = agora;
    }

    public void Inativar(DateTimeOffset agora)
    {
        Situacao = SituacaoDoCliente.Inativo;
        foreach (var contato in Contatos) contato.Inativar();
        DataAtualizacao = agora;
    }

    private void DefinirNome(string nome)
    {
        var normalizado = nome?.Trim();
        if (string.IsNullOrWhiteSpace(normalizado) || normalizado.Length > 200)
            throw new ExcecaoDeRegraDeNegocio("nome_invalido", "O nome do cliente e obrigatorio e deve possuir ate 200 caracteres.");
        Nome = normalizado;
    }

    private static string? Limitar(string? valor, int limite, string codigo)
    {
        var normalizado = string.IsNullOrWhiteSpace(valor) ? null : valor.Trim();
        if (normalizado?.Length > limite) throw new ExcecaoDeRegraDeNegocio(codigo, $"O valor deve possuir ate {limite} caracteres.");
        return normalizado;
    }
}

public sealed class ClienteEtiqueta
{
    private ClienteEtiqueta() { }
    internal ClienteEtiqueta(Guid tenantId, Guid clienteId, Guid etiquetaId) { TenantId = tenantId; ClienteId = clienteId; EtiquetaId = etiquetaId; }
    public Guid TenantId { get; private set; }
    public Guid ClienteId { get; private set; }
    public Guid EtiquetaId { get; private set; }
}
