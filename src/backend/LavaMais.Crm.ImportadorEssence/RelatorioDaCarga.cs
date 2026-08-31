namespace LavaMais.Crm.ImportadorEssence;

internal sealed class RelatorioDaCarga
{
    public required string Modo { get; init; }
    public required string Operacao { get; init; }
    public required string Ambiente { get; init; }
    public required Guid TenantId { get; init; }
    public DateTimeOffset DataInicio { get; init; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? DataFim { get; set; }
    public required ArquivosDaCarga Arquivos { get; init; }
    public ContadoresDeClientes Clientes { get; } = new();
    public ContadoresDeMovimentacoes Movimentacoes { get; } = new();
    public ContadoresDeProdutos Produtos { get; } = new();
    public ContadoresDeComposicaoSintetica ComposicaoSintetica { get; } = new();
    public List<OcorrenciaDaCarga> Erros { get; } = [];
    public List<OcorrenciaDaCarga> Pendencias { get; } = [];
}

internal sealed record ArquivosDaCarga(string? Clientes, string Movimentacoes, string? Produtos);
internal sealed record OcorrenciaDaCarga(string Tipo, int Linha, string Chave, string Mensagem);

internal sealed class ContadoresDeClientes
{
    public int Recebidos { get; set; }
    public int Inseridos { get; set; }
    public int Atualizados { get; set; }
    public int Rejeitados { get; set; }
}

internal sealed class ContadoresDeMovimentacoes
{
    public int Recebidas { get; set; }
    public int Inseridas { get; set; }
    public int Existentes { get; set; }
    public int SemClienteCarregado { get; set; }
    public int Rejeitadas { get; set; }
    public decimal ValorRecebido { get; set; }
    public decimal ValorCarregado { get; set; }
    public decimal ValorSemClienteCarregado { get; set; }
}

internal sealed class ContadoresDeProdutos
{
    public int Recebidos { get; set; }
    public int Inseridos { get; set; }
    public int Atualizados { get; set; }
    public int Rejeitados { get; set; }
    public int QuantidadeObservada { get; set; }
    public decimal ValorObservado { get; set; }
}

internal sealed class ContadoresDeComposicaoSintetica
{
    public int ProdutosBase { get; set; }
    public int QuantidadeBase { get; set; }
    public int MovimentacoesPlanejadas { get; set; }
    public int MovimentacoesAtualizadas { get; set; }
    public int MovimentacoesInalteradas { get; set; }
    public int MovimentacoesAusentes { get; set; }
    public int MovimentacoesRejeitadas { get; set; }
    public int LinhasPlanejadas { get; set; }
    public int LinhasAplicadas { get; set; }
    public int PecasDistribuidas { get; set; }
    public int PecasAplicadas { get; set; }
    public int MovimentacoesSemPecasAjustadas { get; set; }
    public decimal ValorPlanejado { get; set; }
    public decimal ValorAplicado { get; set; }
}
