using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;

namespace LavaMais.Crm.Modulos.MovimentacoesComerciais.Dominio;

public enum OrigemDaMovimentacao { Recepcao = 1, ImportacaoEssence = 2, IntegracaoEssence = 3 }
public enum SituacaoDaMovimentacao { Registrada = 1, Cancelada = 2 }
public sealed record LinhaPreparada(Guid OfertaDeServicoId, Guid ArtigoDeLavanderiaId, string NomeArtigo, Guid ServicoDeLavanderiaId, string NomeServico, int Quantidade, decimal PrecoTabela, decimal PrecoPraticado);

public sealed class MovimentacaoComercial
{
    private readonly List<LinhaDaMovimentacao> linhas = [];
    private MovimentacaoComercial() { }
    private MovimentacaoComercial(Guid tenantId, Guid clienteId, string nomeCliente, IReadOnlyCollection<LinhaPreparada> itens, DateTimeOffset dataMovimentacao, string? codigoExterno, string? observacao, OrigemDaMovimentacao origem, string usuarioId, DateTimeOffset agora)
    {
        if (tenantId == Guid.Empty) throw new ExcecaoDeRegraDeNegocio("tenant_invalido", "O tenant e obrigatorio.");
        if (clienteId == Guid.Empty) throw new ExcecaoDeRegraDeNegocio("cliente_invalido", "O cliente e obrigatorio.");
        if (itens.Count == 0) throw new ExcecaoDeRegraDeNegocio("linhas_obrigatorias", "A movimentacao deve possuir ao menos uma linha.");
        if (itens.Select(x => x.OfertaDeServicoId).Distinct().Count() != itens.Count) throw new ExcecaoDeRegraDeNegocio("oferta_duplicada", "Uma oferta deve aparecer apenas uma vez na movimentacao.");
        if (!Enum.IsDefined(origem)) throw new ExcecaoDeRegraDeNegocio("origem_invalida", "A origem da movimentacao e invalida.");
        Id = Guid.NewGuid(); TenantId = tenantId; ClienteId = clienteId; NomeClienteSnapshot = LimparObrigatorio(nomeCliente, 200, "nome_cliente_invalido");
        DataMovimentacao = dataMovimentacao.ToUniversalTime(); CodigoExterno = Limpar(codigoExterno, 100, "codigo_externo_invalido"); Observacao = Limpar(observacao, 500, "observacao_invalida");
        Origem = origem; Situacao = SituacaoDaMovimentacao.Registrada; UsuarioRegistroId = LimparObrigatorio(usuarioId, 200, "usuario_invalido"); DataCriacao = agora;
        foreach (var item in itens) linhas.Add(LinhaDaMovimentacao.Criar(tenantId, Id, item));
        ValorTotal = linhas.Sum(x => x.Subtotal);
    }
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public Guid ClienteId { get; private set; }
    public string NomeClienteSnapshot { get; private set; } = string.Empty;
    public decimal ValorTotal { get; private set; }
    public DateTimeOffset DataMovimentacao { get; private set; }
    public string? CodigoExterno { get; private set; }
    public string? Observacao { get; private set; }
    public OrigemDaMovimentacao Origem { get; private set; }
    public SituacaoDaMovimentacao Situacao { get; private set; }
    public string UsuarioRegistroId { get; private set; } = string.Empty;
    public DateTimeOffset DataCriacao { get; private set; }
    public string? UsuarioCancelamentoId { get; private set; }
    public DateTimeOffset? DataCancelamento { get; private set; }
    public string? MotivoCancelamento { get; private set; }
    public uint Versao { get; private set; }
    public IReadOnlyCollection<LinhaDaMovimentacao> Linhas => linhas;
    public static MovimentacaoComercial Registrar(Guid tenantId, Guid clienteId, string nomeCliente, IReadOnlyCollection<LinhaPreparada> linhas, DateTimeOffset dataMovimentacao, string? codigoExterno, string? observacao, OrigemDaMovimentacao origem, string usuarioId, DateTimeOffset agora) => new(tenantId, clienteId, nomeCliente, linhas, dataMovimentacao, codigoExterno, observacao, origem, usuarioId, agora);
    public void Cancelar(string motivo, string usuarioId, DateTimeOffset agora) { if (Situacao == SituacaoDaMovimentacao.Cancelada) throw new ExcecaoDeConflito("movimentacao_ja_cancelada", "A movimentacao ja esta cancelada."); MotivoCancelamento = LimparObrigatorio(motivo, 300, "motivo_cancelamento_invalido"); UsuarioCancelamentoId = LimparObrigatorio(usuarioId, 200, "usuario_invalido"); DataCancelamento = agora; Situacao = SituacaoDaMovimentacao.Cancelada; }
    public void SubstituirComposicaoImportada(IReadOnlyCollection<LinhaPreparada> itens, string? observacao)
    {
        if (Origem != OrigemDaMovimentacao.ImportacaoEssence)
            throw new ExcecaoDeRegraDeNegocio("origem_incompativel", "Somente movimentacoes importadas do Essence podem ter a composicao substituida.");
        if (Situacao != SituacaoDaMovimentacao.Registrada)
            throw new ExcecaoDeConflito("movimentacao_cancelada", "Uma movimentacao cancelada nao pode ter a composicao substituida.");
        if (itens.Count == 0)
            throw new ExcecaoDeRegraDeNegocio("linhas_obrigatorias", "A movimentacao deve possuir ao menos uma linha.");
        if (itens.Select(x => x.OfertaDeServicoId).Distinct().Count() != itens.Count)
            throw new ExcecaoDeRegraDeNegocio("oferta_duplicada", "Uma oferta deve aparecer apenas uma vez na movimentacao.");
        var valorComposto = itens.Sum(x => x.Quantidade * x.PrecoPraticado);
        if (valorComposto != ValorTotal)
            throw new ExcecaoDeRegraDeNegocio("valor_composicao_divergente", "A nova composicao deve preservar o valor total da movimentacao.");

        linhas.Clear();
        foreach (var item in itens)
            linhas.Add(LinhaDaMovimentacao.Criar(TenantId, Id, item));
        Observacao = Limpar(observacao, 500, "observacao_invalida");
    }
    private static string LimparObrigatorio(string? valor, int limite, string codigo) => Limpar(valor, limite, codigo) ?? throw new ExcecaoDeRegraDeNegocio(codigo, "O valor e obrigatorio.");
    private static string? Limpar(string? valor, int limite, string codigo) { var limpo = string.IsNullOrWhiteSpace(valor) ? null : valor.Trim(); if (limpo?.Length > limite) throw new ExcecaoDeRegraDeNegocio(codigo, $"O valor deve possuir ate {limite} caracteres."); return limpo; }
}

public sealed class LinhaDaMovimentacao
{
    private LinhaDaMovimentacao() { }
    private LinhaDaMovimentacao(Guid tenantId, Guid movimentacaoId, LinhaPreparada item)
    {
        if (item.OfertaDeServicoId == Guid.Empty || item.ArtigoDeLavanderiaId == Guid.Empty || item.ServicoDeLavanderiaId == Guid.Empty) throw new ExcecaoDeRegraDeNegocio("linha_invalida", "Oferta, artigo e servico sao obrigatorios.");
        if (item.Quantidade <= 0) throw new ExcecaoDeRegraDeNegocio("quantidade_invalida", "A quantidade deve ser maior que zero.");
        if (item.PrecoTabela < 0 || item.PrecoPraticado < 0) throw new ExcecaoDeRegraDeNegocio("preco_invalido", "Os precos nao podem ser negativos.");
        Id = Guid.NewGuid(); TenantId = tenantId; MovimentacaoComercialId = movimentacaoId; OfertaDeServicoId = item.OfertaDeServicoId; ArtigoDeLavanderiaId = item.ArtigoDeLavanderiaId;
        NomeArtigoSnapshot = item.NomeArtigo.Trim(); ServicoDeLavanderiaId = item.ServicoDeLavanderiaId; NomeServicoSnapshot = item.NomeServico.Trim(); Quantidade = item.Quantidade;
        PrecoTabelaSnapshot = item.PrecoTabela; PrecoUnitarioPraticado = item.PrecoPraticado; Subtotal = item.Quantidade * item.PrecoPraticado;
    }
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public Guid MovimentacaoComercialId { get; private set; }
    public Guid OfertaDeServicoId { get; private set; }
    public Guid ArtigoDeLavanderiaId { get; private set; }
    public string NomeArtigoSnapshot { get; private set; } = string.Empty;
    public Guid ServicoDeLavanderiaId { get; private set; }
    public string NomeServicoSnapshot { get; private set; } = string.Empty;
    public int Quantidade { get; private set; }
    public decimal PrecoTabelaSnapshot { get; private set; }
    public decimal PrecoUnitarioPraticado { get; private set; }
    public decimal Subtotal { get; private set; }
    internal static LinhaDaMovimentacao Criar(Guid tenantId, Guid movimentacaoId, LinhaPreparada item) => new(tenantId, movimentacaoId, item);
}
