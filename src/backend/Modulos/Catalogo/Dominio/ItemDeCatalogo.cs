using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;

namespace LavaMais.Crm.Modulos.Catalogo.Dominio;

public enum TipoDeItemDeCatalogo { Produto = 1, Servico = 2 }
public enum SituacaoDoItemDeCatalogo { Ativo = 1, Inativo = 2 }

public sealed class ItemDeCatalogo
{
    private ItemDeCatalogo() { }

    private ItemDeCatalogo(Guid tenantId, TipoDeItemDeCatalogo tipo, string nome, string? descricao, string? categoria, decimal? valorReferencia, DateTimeOffset agora)
    {
        Id = Guid.NewGuid();
        TenantId = tenantId;
        Situacao = SituacaoDoItemDeCatalogo.Ativo;
        DataCriacao = agora;
        Atualizar(tipo, nome, descricao, categoria, valorReferencia, agora);
    }

    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public TipoDeItemDeCatalogo Tipo { get; private set; }
    public string Nome { get; private set; } = string.Empty;
    public string NomeNormalizado { get; private set; } = string.Empty;
    public string? Descricao { get; private set; }
    public string? Categoria { get; private set; }
    public decimal? ValorReferencia { get; private set; }
    public string? CodigoExterno { get; private set; }
    public DateTimeOffset? DataCadastroOrigem { get; private set; }
    public SituacaoDoItemDeCatalogo Situacao { get; private set; }
    public DateTimeOffset DataCriacao { get; private set; }
    public DateTimeOffset DataAtualizacao { get; private set; }
    public uint Versao { get; private set; }

    public static ItemDeCatalogo Criar(Guid tenantId, TipoDeItemDeCatalogo tipo, string nome, string? descricao, string? categoria, decimal? valorReferencia, DateTimeOffset agora)
    {
        if (tenantId == Guid.Empty) throw new ExcecaoDeRegraDeNegocio("tenant_invalido", "O tenant e obrigatorio.");
        return new(tenantId, tipo, nome, descricao, categoria, valorReferencia, agora);
    }

    public void Atualizar(TipoDeItemDeCatalogo tipo, string nome, string? descricao, string? categoria, decimal? valorReferencia, DateTimeOffset agora)
    {
        if (!Enum.IsDefined(tipo)) throw new ExcecaoDeRegraDeNegocio("tipo_invalido", "O tipo do item e invalido.");
        if (string.IsNullOrWhiteSpace(nome)) throw new ExcecaoDeRegraDeNegocio("nome_obrigatorio", "O nome do item e obrigatorio.");
        if (valorReferencia < 0) throw new ExcecaoDeRegraDeNegocio("valor_invalido", "O valor de referencia nao pode ser negativo.");
        Tipo = tipo;
        Nome = nome.Trim();
        NomeNormalizado = Nome.ToUpperInvariant();
        Descricao = Limpar(descricao);
        Categoria = Limpar(categoria);
        ValorReferencia = valorReferencia;
        DataAtualizacao = agora;
    }

    public void AlterarSituacao(SituacaoDoItemDeCatalogo situacao, DateTimeOffset agora)
    {
        if (!Enum.IsDefined(situacao)) throw new ExcecaoDeRegraDeNegocio("situacao_invalida", "A situacao do item e invalida.");
        Situacao = situacao; DataAtualizacao = agora;
    }
    public void DefinirDadosDeOrigem(string? codigoExterno, DateTimeOffset? dataCadastroOrigem, DateTimeOffset agora)
    {
        var codigo = string.IsNullOrWhiteSpace(codigoExterno) ? null : codigoExterno.Trim();
        if (codigo?.Length > 100) throw new ExcecaoDeRegraDeNegocio("codigo_externo_invalido", "O codigo externo deve possuir ate 100 caracteres.");
        CodigoExterno = codigo; DataCadastroOrigem = dataCadastroOrigem?.ToUniversalTime(); DataAtualizacao = agora;
    }
    private static string? Limpar(string? valor) => string.IsNullOrWhiteSpace(valor) ? null : valor.Trim();
}
