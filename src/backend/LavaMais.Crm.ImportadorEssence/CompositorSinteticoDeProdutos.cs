namespace LavaMais.Crm.ImportadorEssence;

internal static class CompositorSinteticoDeProdutos
{
    public const string MarcadorNaObservacao =
        "[HML SINTETICO] Composicao baseada no ranking agregado; nao representa os itens reais do ticket.";

    public static IReadOnlyCollection<ComposicaoSinteticaDaMovimentacao> Planejar(
        IReadOnlyCollection<MovimentacaoDaCarga> movimentacoes,
        IReadOnlyCollection<ProdutoDaCarga> produtos)
    {
        var produtosValidos = produtos
            .Where(x => x.Quantidade > 0)
            .Select(x => new ProdutoPonderado(
                x.Nome.Trim().ToUpperInvariant(),
                x.Nome.Trim(),
                x.Quantidade,
                x.Total > 0 ? decimal.Round(x.Total / x.Quantidade, 2, MidpointRounding.AwayFromZero) : 0m))
            .OrderBy(x => x.Chave, StringComparer.Ordinal)
            .ToArray();
        if (produtosValidos.Length == 0)
            throw new InvalidDataException("A composicao sintetica exige ao menos um produto com quantidade observada positiva.");

        var sequencia = CriarSequenciaPonderada(produtosValidos);
        var cursor = 0;
        var resultado = new List<ComposicaoSinteticaDaMovimentacao>(movimentacoes.Count);
        foreach (var movimentacao in movimentacoes.OrderBy(x => x.DataHora).ThenBy(x => x.Ticket, StringComparer.Ordinal))
        {
            var pecasDistribuidas = Math.Max(1, movimentacao.Pecas);
            var quantidadeDeProdutos = Math.Min(Math.Min(4, pecasDistribuidas), produtosValidos.Length);
            var selecionados = SelecionarProdutosDistintos(sequencia, produtosValidos, quantidadeDeProdutos, ref cursor);
            var quantidades = DistribuirQuantidades(pecasDistribuidas, selecionados.Count);
            var precos = DistribuirValor(movimentacao.Total, selecionados, quantidades);
            var linhas = selecionados.Select((produto, indice) => new LinhaDaComposicaoSintetica(
                produto.Chave,
                produto.Nome,
                quantidades[indice],
                precos[indice])).ToArray();

            if (linhas.Sum(x => x.Quantidade) != pecasDistribuidas)
                throw new InvalidOperationException($"A composicao do ticket {movimentacao.Ticket} nao preservou a quantidade de pecas.");
            if (linhas.Sum(x => x.Quantidade * x.PrecoUnitario) != movimentacao.Total)
                throw new InvalidOperationException($"A composicao do ticket {movimentacao.Ticket} nao preservou o valor total.");

            resultado.Add(new(movimentacao, linhas, pecasDistribuidas, movimentacao.Pecas == 0));
        }

        return resultado;
    }

    public static string AdicionarMarcador(string observacaoOriginal)
    {
        if (observacaoOriginal.Contains(MarcadorNaObservacao, StringComparison.Ordinal))
            return observacaoOriginal;
        var limiteOriginal = 500 - MarcadorNaObservacao.Length - 1;
        var baseLimitada = observacaoOriginal.Length <= limiteOriginal
            ? observacaoOriginal
            : observacaoOriginal[..limiteOriginal].TrimEnd();
        return $"{baseLimitada} {MarcadorNaObservacao}";
    }

    private static IReadOnlyList<ProdutoPonderado> CriarSequenciaPonderada(IReadOnlyList<ProdutoPonderado> produtos)
    {
        var pesoTotal = produtos.Sum(x => x.QuantidadeObservada);
        var pesosAtuais = new long[produtos.Count];
        var sequencia = new List<ProdutoPonderado>(pesoTotal);
        for (var posicao = 0; posicao < pesoTotal; posicao++)
        {
            var escolhido = 0;
            for (var indice = 0; indice < produtos.Count; indice++)
            {
                pesosAtuais[indice] += produtos[indice].QuantidadeObservada;
                if (pesosAtuais[indice] > pesosAtuais[escolhido])
                    escolhido = indice;
            }
            pesosAtuais[escolhido] -= pesoTotal;
            sequencia.Add(produtos[escolhido]);
        }
        return sequencia;
    }

    private static IReadOnlyList<ProdutoPonderado> SelecionarProdutosDistintos(
        IReadOnlyList<ProdutoPonderado> sequencia,
        IReadOnlyList<ProdutoPonderado> produtos,
        int quantidade,
        ref int cursor)
    {
        var selecionados = new List<ProdutoPonderado>(quantidade);
        var chaves = new HashSet<string>(StringComparer.Ordinal);
        var tentativas = 0;
        while (selecionados.Count < quantidade && tentativas < sequencia.Count * 2)
        {
            var candidato = sequencia[cursor % sequencia.Count];
            cursor++;
            tentativas++;
            if (chaves.Add(candidato.Chave))
                selecionados.Add(candidato);
        }
        foreach (var candidato in produtos)
        {
            if (selecionados.Count == quantidade) break;
            if (chaves.Add(candidato.Chave)) selecionados.Add(candidato);
        }
        return selecionados;
    }

    private static int[] DistribuirQuantidades(int pecas, int produtos)
    {
        var quantidades = Enumerable.Repeat(1, produtos).ToArray();
        var restantes = pecas - produtos;
        if (produtos == 1)
        {
            quantidades[0] += restantes;
            return quantidades;
        }
        for (var indice = 0; indice < restantes; indice++)
            quantidades[indice % (produtos - 1)]++;
        return quantidades;
    }

    private static decimal[] DistribuirValor(
        decimal total,
        IReadOnlyList<ProdutoPonderado> produtos,
        IReadOnlyList<int> quantidades)
    {
        var totalCentavos = decimal.ToInt64(decimal.Round(total * 100m, 0, MidpointRounding.AwayFromZero));
        var precos = new decimal[produtos.Count];
        if (produtos.Count == 1)
        {
            if (totalCentavos % quantidades[0] != 0)
                throw new InvalidDataException("Uma composicao com um unico produto nao consegue fechar o total em centavos.");
            precos[0] = totalCentavos / quantidades[0] / 100m;
            return precos;
        }

        var pesos = produtos.Select((produto, indice) =>
            quantidades[indice] * Math.Max(produto.ValorUnitarioReferencia, 0.01m)).ToArray();
        var pesoTotal = pesos.Sum();
        var restante = totalCentavos;
        for (var indice = 0; indice < produtos.Count - 1; indice++)
        {
            var alvo = decimal.ToInt64(decimal.Round(totalCentavos * pesos[indice] / pesoTotal, 0, MidpointRounding.AwayFromZero));
            var precoCentavos = decimal.ToInt64(decimal.Round((decimal)alvo / quantidades[indice], 0, MidpointRounding.AwayFromZero));
            precoCentavos = Math.Clamp(precoCentavos, 0, restante / quantidades[indice]);
            precos[indice] = precoCentavos / 100m;
            restante -= precoCentavos * quantidades[indice];
        }

        if (quantidades[^1] != 1)
            throw new InvalidOperationException("A ultima linha sintetica deve possuir uma unidade para absorver o ajuste de centavos.");
        precos[^1] = restante / 100m;
        return precos;
    }

    private sealed record ProdutoPonderado(
        string Chave,
        string Nome,
        int QuantidadeObservada,
        decimal ValorUnitarioReferencia);
}

internal sealed record LinhaDaComposicaoSintetica(
    string ChaveProduto,
    string NomeProduto,
    int Quantidade,
    decimal PrecoUnitario);

internal sealed record ComposicaoSinteticaDaMovimentacao(
    MovimentacaoDaCarga Movimentacao,
    IReadOnlyCollection<LinhaDaComposicaoSintetica> Linhas,
    int PecasDistribuidas,
    bool PecasAjustadas);
