using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;

namespace LavaMais.Crm.Modulos.AcoesComerciais.Dominio;

public enum SituacaoDaAcaoComercial { Rascunho = 1, Preparada = 2, EmProcessamento = 3, Concluida = 4, ConcluidaComFalhas = 5, Cancelada = 6 }

public sealed class AcaoComercial
{
    private AcaoComercial() { }
    private AcaoComercial(Guid tenantId, string usuarioId, DateTimeOffset agora)
    { Id = Guid.NewGuid(); TenantId = tenantId; UsuarioCriacaoId = usuarioId; Situacao = SituacaoDaAcaoComercial.Rascunho; DataCriacao = agora; }

    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public string Nome { get; private set; } = string.Empty;
    public string? Objetivo { get; private set; }
    public Guid ItemDeCatalogoId { get; private set; }
    public Guid? VersaoModeloId { get; private set; }
    public string CriteriosSegmentacaoJson { get; private set; } = string.Empty;
    public SituacaoDaAcaoComercial Situacao { get; private set; }
    public string UsuarioCriacaoId { get; private set; } = string.Empty;
    public DateTimeOffset DataCriacao { get; private set; }
    public DateTimeOffset DataAtualizacao { get; private set; }
    public uint Versao { get; private set; }

    public static AcaoComercial Criar(Guid tenantId, string usuarioId, string nome, string? objetivo, Guid itemId, Guid? versaoModeloId, string criteriosJson, DateTimeOffset agora)
    {
        if (tenantId == Guid.Empty) throw new ExcecaoDeRegraDeNegocio("tenant_invalido", "O tenant e obrigatorio.");
        var acao = new AcaoComercial(tenantId, usuarioId, agora); acao.Atualizar(nome, objetivo, itemId, versaoModeloId, criteriosJson, agora); return acao;
    }

    public void Atualizar(string nome, string? objetivo, Guid itemId, Guid? versaoModeloId, string criteriosJson, DateTimeOffset agora)
    {
        if (Situacao != SituacaoDaAcaoComercial.Rascunho) throw new ExcecaoDeConflito("acao_nao_editavel", "Somente uma acao em rascunho pode ser alterada.");
        if (string.IsNullOrWhiteSpace(nome) || nome.Trim().Length > 160) throw new ExcecaoDeRegraDeNegocio("nome_invalido", "O nome e obrigatorio e deve possuir ate 160 caracteres.");
        if (itemId == Guid.Empty) throw new ExcecaoDeRegraDeNegocio("item_obrigatorio", "O item de catalogo e obrigatorio.");
        Nome = nome.Trim(); Objetivo = string.IsNullOrWhiteSpace(objetivo) ? null : objetivo.Trim(); ItemDeCatalogoId = itemId;
        VersaoModeloId = versaoModeloId; CriteriosSegmentacaoJson = criteriosJson; DataAtualizacao = agora;
    }
}
