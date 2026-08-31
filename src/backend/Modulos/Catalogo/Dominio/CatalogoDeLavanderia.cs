using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;

namespace LavaMais.Crm.Modulos.Catalogo.Dominio;

public enum SituacaoDoCatalogoDeLavanderia { Ativo = 1, Inativo = 2 }

public sealed class ArtigoDeLavanderia
{
    private ArtigoDeLavanderia() { }
    private ArtigoDeLavanderia(Guid tenantId, string nome, string categoria, DateTimeOffset agora)
    {
        Id = Guid.NewGuid(); TenantId = tenantId; Nome = Limpar(nome, 160, "nome_artigo_invalido");
        NomeNormalizado = Nome.ToUpperInvariant(); Categoria = Limpar(categoria, 100, "categoria_artigo_invalida");
        Situacao = SituacaoDoCatalogoDeLavanderia.Ativo; DataCriacao = agora; DataAtualizacao = agora;
    }
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public string Nome { get; private set; } = string.Empty;
    public string NomeNormalizado { get; private set; } = string.Empty;
    public string Categoria { get; private set; } = string.Empty;
    public SituacaoDoCatalogoDeLavanderia Situacao { get; private set; }
    public DateTimeOffset DataCriacao { get; private set; }
    public DateTimeOffset DataAtualizacao { get; private set; }
    public uint Versao { get; private set; }
    public static ArtigoDeLavanderia Criar(Guid tenantId, string nome, string categoria, DateTimeOffset agora)
    { if (tenantId == Guid.Empty) throw new ExcecaoDeRegraDeNegocio("tenant_invalido", "O tenant e obrigatorio."); return new(tenantId, nome, categoria, agora); }
    public void AlterarSituacao(SituacaoDoCatalogoDeLavanderia situacao, DateTimeOffset agora)
    { if (!Enum.IsDefined(situacao)) throw new ExcecaoDeRegraDeNegocio("situacao_invalida", "A situacao do artigo e invalida."); Situacao = situacao; DataAtualizacao = agora; }
    private static string Limpar(string? valor, int limite, string codigo)
    { var limpo = valor?.Trim(); if (string.IsNullOrWhiteSpace(limpo) || limpo.Length > limite) throw new ExcecaoDeRegraDeNegocio(codigo, $"O valor deve possuir entre 1 e {limite} caracteres."); return limpo; }
}

public sealed class ServicoDeLavanderia
{
    private ServicoDeLavanderia() { }
    private ServicoDeLavanderia(Guid tenantId, string nome, string? descricao, DateTimeOffset agora)
    {
        Id = Guid.NewGuid(); TenantId = tenantId; Nome = Limpar(nome, 160, "nome_servico_invalido"); NomeNormalizado = Nome.ToUpperInvariant();
        Descricao = string.IsNullOrWhiteSpace(descricao) ? null : descricao.Trim(); Situacao = SituacaoDoCatalogoDeLavanderia.Ativo; DataCriacao = agora; DataAtualizacao = agora;
    }
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public string Nome { get; private set; } = string.Empty;
    public string NomeNormalizado { get; private set; } = string.Empty;
    public string? Descricao { get; private set; }
    public SituacaoDoCatalogoDeLavanderia Situacao { get; private set; }
    public DateTimeOffset DataCriacao { get; private set; }
    public DateTimeOffset DataAtualizacao { get; private set; }
    public uint Versao { get; private set; }
    public static ServicoDeLavanderia Criar(Guid tenantId, string nome, string? descricao, DateTimeOffset agora)
    { if (tenantId == Guid.Empty) throw new ExcecaoDeRegraDeNegocio("tenant_invalido", "O tenant e obrigatorio."); return new(tenantId, nome, descricao, agora); }
    public void AlterarSituacao(SituacaoDoCatalogoDeLavanderia situacao, DateTimeOffset agora)
    { if (!Enum.IsDefined(situacao)) throw new ExcecaoDeRegraDeNegocio("situacao_invalida", "A situacao do servico e invalida."); Situacao = situacao; DataAtualizacao = agora; }
    private static string Limpar(string? valor, int limite, string codigo)
    { var limpo = valor?.Trim(); if (string.IsNullOrWhiteSpace(limpo) || limpo.Length > limite) throw new ExcecaoDeRegraDeNegocio(codigo, $"O valor deve possuir entre 1 e {limite} caracteres."); return limpo; }
}

public sealed class OfertaDeServico
{
    private OfertaDeServico() { }
    private OfertaDeServico(Guid tenantId, Guid artigoId, Guid servicoId, decimal precoUnitario, DateTimeOffset agora)
    {
        if (tenantId == Guid.Empty || artigoId == Guid.Empty || servicoId == Guid.Empty) throw new ExcecaoDeRegraDeNegocio("oferta_invalida", "Tenant, artigo e servico sao obrigatorios.");
        if (precoUnitario < 0) throw new ExcecaoDeRegraDeNegocio("preco_invalido", "O preco unitario nao pode ser negativo.");
        Id = Guid.NewGuid(); TenantId = tenantId; ArtigoDeLavanderiaId = artigoId; ServicoDeLavanderiaId = servicoId; PrecoUnitario = precoUnitario;
        Situacao = SituacaoDoCatalogoDeLavanderia.Ativo; DataCriacao = agora; DataAtualizacao = agora;
    }
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public Guid ArtigoDeLavanderiaId { get; private set; }
    public Guid ServicoDeLavanderiaId { get; private set; }
    public decimal PrecoUnitario { get; private set; }
    public SituacaoDoCatalogoDeLavanderia Situacao { get; private set; }
    public DateTimeOffset DataCriacao { get; private set; }
    public DateTimeOffset DataAtualizacao { get; private set; }
    public uint Versao { get; private set; }
    public ArtigoDeLavanderia Artigo { get; private set; } = null!;
    public ServicoDeLavanderia Servico { get; private set; } = null!;
    public static OfertaDeServico Criar(Guid tenantId, Guid artigoId, Guid servicoId, decimal precoUnitario, DateTimeOffset agora) => new(tenantId, artigoId, servicoId, precoUnitario, agora);
    public void AlterarSituacao(SituacaoDoCatalogoDeLavanderia situacao, DateTimeOffset agora)
    { if (!Enum.IsDefined(situacao)) throw new ExcecaoDeRegraDeNegocio("situacao_invalida", "A situacao da oferta e invalida."); Situacao = situacao; DataAtualizacao = agora; }
}
