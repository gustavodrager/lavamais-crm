using LavaMais.Crm.ImportadorEssence;

namespace LavaMais.Crm.Testes.Unidade;

public sealed class CompositorSinteticoDeProdutosTestes
{
    [Fact]
    public void Deve_planejar_composicao_deterministica_preservando_pecas_e_valores()
    {
        var periodoInicio = new DateOnly(2026, 1, 2);
        var periodoFim = new DateOnly(2026, 4, 22);
        ProdutoDaCarga[] produtos =
        [
            new(2, "CAMISETA", 10, 95m, periodoInicio, periodoFim),
            new(3, "CALCA", 6, 72m, periodoInicio, periodoFim),
            new(4, "EDREDOM", 2, 120m, periodoInicio, periodoFim),
            new(5, "TOALHA", 4, 28m, periodoInicio, periodoFim)
        ];
        MovimentacaoDaCarga[] movimentacoes =
        [
            CriarMovimentacao("100", 7, 117.17m),
            CriarMovimentacao("101", 3, 55m),
            CriarMovimentacao("102", 0, 0m)
        ];

        var primeira = CompositorSinteticoDeProdutos.Planejar(movimentacoes, produtos).ToArray();
        var segunda = CompositorSinteticoDeProdutos.Planejar(movimentacoes, produtos).ToArray();

        Assert.Equal(
            primeira.SelectMany(x => x.Linhas.Select(l => (x.Movimentacao.Ticket, l.ChaveProduto, l.Quantidade, l.PrecoUnitario))),
            segunda.SelectMany(x => x.Linhas.Select(l => (x.Movimentacao.Ticket, l.ChaveProduto, l.Quantidade, l.PrecoUnitario))));
        Assert.All(primeira, composicao =>
        {
            Assert.InRange(composicao.Linhas.Count, 1, 4);
            Assert.Equal(Math.Max(1, composicao.Movimentacao.Pecas), composicao.Linhas.Sum(x => x.Quantidade));
            Assert.Equal(composicao.Movimentacao.Total, composicao.Linhas.Sum(x => x.Quantidade * x.PrecoUnitario));
        });
        Assert.True(primeira.Single(x => x.Movimentacao.Ticket == "102").PecasAjustadas);

        var observacao = CompositorSinteticoDeProdutos.AdicionarMarcador(new string('a', 500));
        Assert.Equal(500, observacao.Length);
        Assert.Contains(CompositorSinteticoDeProdutos.MarcadorNaObservacao, observacao, StringComparison.Ordinal);
    }

    private static MovimentacaoDaCarga CriarMovimentacao(string ticket, int pecas, decimal total) =>
        new(
            2,
            ticket,
            "cliente-1",
            new DateTimeOffset(2026, 1, 2, 10, 30, 0, TimeSpan.FromHours(-3)),
            pecas,
            total,
            total,
            0m,
            false,
            null,
            "Atendente");
}
