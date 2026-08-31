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
    public string? CodigoExterno { get; private set; }
    public DateTimeOffset? DataCadastroOrigem { get; private set; }
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
        var contatoWhatsapp = Contatos.SingleOrDefault(x => x.Tipo == TipoDeContato.Whatsapp);
        if (contatoWhatsapp is null) Contatos.Add(ContatoDoCliente.CriarWhatsapp(TenantId, Id, whatsapp)); else contatoWhatsapp.AtualizarWhatsapp(whatsapp);
        NomeFantasia = Limitar(nomeFantasia, 200, "nome_fantasia_invalido");
        Tipo = Limitar(tipo, 50, "tipo_invalido");
        var emailNormalizado = Limitar(email, 254, "email_invalido")?.ToLowerInvariant();
        var contatoEmail = Contatos.SingleOrDefault(x => x.Tipo == TipoDeContato.Email);
        if (emailNormalizado is null && contatoEmail is not null) Contatos.Remove(contatoEmail);
        else if (emailNormalizado is not null && contatoEmail is null) Contatos.Add(ContatoDoCliente.CriarEmail(TenantId, Id, emailNormalizado));
        else if (emailNormalizado is not null) contatoEmail!.AtualizarEmail(emailNormalizado);
        DataNascimento = dataNascimento;
        var permissaoWhatsapp = Permissoes.SingleOrDefault(x => x.Canal == TipoDeContato.Whatsapp && x.Finalidade == "Marketing");
        if (permissaoWhatsapp is null) Permissoes.Add(new PermissaoDeComunicacao(TenantId, Id, permiteMarketingWhatsapp, agora)); else permissaoWhatsapp.Definir(permiteMarketingWhatsapp, agora);
        if (endereco is null) Endereco = null;
        else if (Endereco is null) Endereco = endereco;
        else Endereco.Atualizar(endereco);
        var etiquetasDesejadas = etiquetaIds.Distinct().ToHashSet();
        foreach (var atual in Etiquetas.Where(x => !etiquetasDesejadas.Contains(x.EtiquetaId)).ToArray()) Etiquetas.Remove(atual);
        foreach (var etiquetaId in etiquetasDesejadas.Where(id => Etiquetas.All(x => x.EtiquetaId != id))) Etiquetas.Add(new ClienteEtiqueta(TenantId, Id, etiquetaId));
        DataAtualizacao = agora;
    }

    public void DefinirDadosDeOrigem(string? codigoExterno, DateTimeOffset? dataCadastroOrigem, DateTimeOffset agora)
    {
        CodigoExterno = Limitar(codigoExterno, 100, "codigo_externo_invalido");
        DataCadastroOrigem = dataCadastroOrigem?.ToUniversalTime();
        DataAtualizacao = agora;
    }

    public void AtualizarDadosBasicosDaOrigem(
        string nome,
        string whatsapp,
        string codigoExterno,
        DateTimeOffset? dataCadastroOrigem,
        DateTimeOffset agora)
    {
        DefinirNome(nome);
        var contatoWhatsapp = Contatos.SingleOrDefault(x => x.Tipo == TipoDeContato.Whatsapp);
        if (contatoWhatsapp is null)
            Contatos.Add(ContatoDoCliente.CriarWhatsapp(TenantId, Id, whatsapp));
        else
            contatoWhatsapp.AtualizarWhatsapp(whatsapp);

        CodigoExterno = Limitar(codigoExterno, 100, "codigo_externo_invalido")
            ?? throw new ExcecaoDeRegraDeNegocio("codigo_externo_obrigatorio", "O codigo externo e obrigatorio para a carga controlada.");
        if (dataCadastroOrigem is not null)
            DataCadastroOrigem = dataCadastroOrigem.Value.ToUniversalTime();
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
