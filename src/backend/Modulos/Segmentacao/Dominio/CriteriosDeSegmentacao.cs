using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;

namespace LavaMais.Crm.Modulos.Segmentacao.Dominio;

public enum ModoDeSelecao { Filtros = 1, Manual = 2 }
public enum MotivoDeExclusao { ClienteInativo = 1, ContatoInvalido = 2, SemPermissao = 3, ContatoDuplicado = 4, ExcluidoManualmente = 5 }

public sealed record CriteriosDeSegmentacao(
    int VersaoSchema,
    ModoDeSelecao Modo,
    string? TipoCliente,
    IReadOnlyCollection<string>? Cidades,
    IReadOnlyCollection<string>? Bairros,
    IReadOnlyCollection<Guid>? EtiquetaIds,
    DateTimeOffset? CadastradoApartirDe,
    DateOnly? DataNascimentoDe,
    DateOnly? DataNascimentoAte,
    IReadOnlyCollection<Guid>? ClienteIds,
    IReadOnlyCollection<Guid>? ClienteIdsExcluidos = null)
{
    public const int VersaoAtual = 2;

    public void Validar()
    {
        if (VersaoSchema is not (1 or VersaoAtual)) throw new ExcecaoDeRegraDeNegocio("versao_criterios_invalida", "A versao dos criterios de segmentacao nao e suportada.");
        if (VersaoSchema == 1 && ClienteIdsExcluidos is { Count: > 0 }) throw new ExcecaoDeRegraDeNegocio("versao_criterios_invalida", "Exclusoes manuais exigem o schema 2 dos criterios.");
        if (!Enum.IsDefined(Modo)) throw new ExcecaoDeRegraDeNegocio("modo_selecao_invalido", "O modo de selecao e invalido.");
        if (Modo == ModoDeSelecao.Manual && (ClienteIds is null || ClienteIds.Count == 0)) throw new ExcecaoDeRegraDeNegocio("clientes_obrigatorios", "A selecao manual exige ao menos um cliente.");
        if (Modo == ModoDeSelecao.Filtros && ClienteIds is { Count: > 0 }) throw new ExcecaoDeRegraDeNegocio("criterios_incompativeis", "A selecao por filtros nao aceita clientes manuais.");
        if (Modo == ModoDeSelecao.Manual && (!string.IsNullOrWhiteSpace(TipoCliente) || Cidades is { Count: > 0 } || Bairros is { Count: > 0 } || EtiquetaIds is { Count: > 0 } || CadastradoApartirDe is not null || DataNascimentoDe is not null || DataNascimentoAte is not null))
            throw new ExcecaoDeRegraDeNegocio("criterios_incompativeis", "A selecao manual nao aceita filtros adicionais.");
        if (DataNascimentoDe > DataNascimentoAte) throw new ExcecaoDeRegraDeNegocio("periodo_nascimento_invalido", "O periodo de nascimento e invalido.");
        if ((ClienteIdsExcluidos ?? []).Any(id => id == Guid.Empty)) throw new ExcecaoDeRegraDeNegocio("cliente_excluido_invalido", "A lista de exclusoes possui um cliente invalido.");
    }
}
