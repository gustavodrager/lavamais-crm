using System.Globalization;
using LavaMais.Crm.Modulos.Importacoes.Aplicacao;

namespace LavaMais.Crm.ImportadorEssence;

internal sealed record DadosDaCarga(
    IReadOnlyCollection<ClienteDaCarga> Clientes,
    IReadOnlyCollection<MovimentacaoDaCarga> Movimentacoes,
    IReadOnlyCollection<ProdutoDaCarga> Produtos);

internal sealed record ClienteDaCarga(int Linha, string CodigoExterno, string Nome, string Whatsapp);

internal sealed record MovimentacaoDaCarga(
    int Linha,
    string Ticket,
    string CodigoCliente,
    DateTimeOffset DataHora,
    int Pecas,
    decimal Total,
    decimal Subtotal,
    decimal Desconto,
    bool Pacote,
    decimal? ValorUtilizacaoPacote,
    string? Atendente);

internal sealed record ProdutoDaCarga(
    int Linha,
    string Nome,
    int Quantidade,
    decimal Total,
    DateOnly PeriodoInicio,
    DateOnly PeriodoFim);

internal static class LeituraDaCarga
{
    public static async Task<DadosDaCarga> Ler(OpcoesDaCarga opcoes, CancellationToken ct)
    {
        var clientes = opcoes.ArquivoClientes is null
            ? Array.Empty<ClienteDaCarga>()
            : await LerClientes(opcoes.ArquivoClientes, ct);
        var movimentacoes = await LerMovimentacoes(opcoes.ArquivoMovimentacoes, ct);
        var produtos = opcoes.ArquivoProdutos is null
            ? Array.Empty<ProdutoDaCarga>()
            : await LerProdutos(opcoes.ArquivoProdutos, ct);
        ValidarUnicidade(clientes, movimentacoes, produtos);
        return new(clientes, movimentacoes, produtos);
    }

    private static async Task<IReadOnlyCollection<ClienteDaCarga>> LerClientes(string caminho, CancellationToken ct)
    {
        var tabela = await TabelaCsv.Ler(caminho, ct);
        return tabela.Linhas.Select(x => new ClienteDaCarga(
            x.Numero,
            x.Obrigatorio("codigo_externo"),
            x.Obrigatorio("nome"),
            x.Obrigatorio("whatsapp"))).ToArray();
    }

    private static async Task<IReadOnlyCollection<MovimentacaoDaCarga>> LerMovimentacoes(string caminho, CancellationToken ct)
    {
        var tabela = await TabelaCsv.Ler(caminho, ct);
        return tabela.Linhas.Select(x => new MovimentacaoDaCarga(
            x.Numero,
            x.Obrigatorio("ticket"),
            x.Obrigatorio("codigo_cliente"),
            ConverterDataHora(x.Obrigatorio("data_hora"), x.Numero),
            ConverterInteiro(x.Obrigatorio("pecas"), "pecas", x.Numero),
            ConverterDecimal(x.Obrigatorio("total"), "total", x.Numero),
            ConverterDecimal(x.Obrigatorio("subtotal"), "subtotal", x.Numero),
            ConverterDecimal(x.Obrigatorio("desconto"), "desconto", x.Numero),
            ConverterBooleano(x.Obrigatorio("pacote"), x.Numero),
            ConverterDecimalOpcional(x.Opcional("valor_utilizacao_pacote"), "valor_utilizacao_pacote", x.Numero),
            x.Opcional("atendente"))).ToArray();
    }

    private static async Task<IReadOnlyCollection<ProdutoDaCarga>> LerProdutos(string caminho, CancellationToken ct)
    {
        var tabela = await TabelaCsv.Ler(caminho, ct);
        return tabela.Linhas.Select(x => new ProdutoDaCarga(
            x.Numero,
            x.Obrigatorio("nome"),
            ConverterInteiro(x.Obrigatorio("quantidade"), "quantidade", x.Numero),
            ConverterDecimal(x.Obrigatorio("total"), "total", x.Numero),
            ConverterData(x.Obrigatorio("periodo_inicio"), "periodo_inicio", x.Numero),
            ConverterData(x.Obrigatorio("periodo_fim"), "periodo_fim", x.Numero))).ToArray();
    }

    private static void ValidarUnicidade(
        IReadOnlyCollection<ClienteDaCarga> clientes,
        IReadOnlyCollection<MovimentacaoDaCarga> movimentacoes,
        IReadOnlyCollection<ProdutoDaCarga> produtos)
    {
        ValidarDuplicados(clientes, x => x.CodigoExterno, "codigo externo de cliente");
        ValidarDuplicados(clientes, x => x.Whatsapp, "WhatsApp de cliente");
        ValidarDuplicados(movimentacoes, x => x.Ticket, "ticket");
        ValidarDuplicados(produtos, x => x.Nome.Trim().ToUpperInvariant(), "nome de produto");
    }

    private static void ValidarDuplicados<T>(IEnumerable<T> itens, Func<T, string> chave, string descricao)
    {
        var duplicados = itens.GroupBy(chave, StringComparer.OrdinalIgnoreCase).Where(x => x.Count() > 1).Select(x => x.Key).Take(5).ToArray();
        if (duplicados.Length > 0)
            throw new InvalidDataException($"Existem valores duplicados para {descricao}: {string.Join(", ", duplicados)}");
    }

    private static int ConverterInteiro(string valor, string coluna, int linha) =>
        int.TryParse(valor, NumberStyles.Integer, CultureInfo.InvariantCulture, out var resultado) && resultado >= 0
            ? resultado
            : throw new InvalidDataException($"Linha {linha}: {coluna} deve ser um inteiro nao negativo.");

    private static decimal ConverterDecimal(string valor, string coluna, int linha) =>
        decimal.TryParse(valor, NumberStyles.Number, CultureInfo.InvariantCulture, out var resultado) && resultado >= 0
            ? resultado
            : throw new InvalidDataException($"Linha {linha}: {coluna} deve ser um decimal nao negativo no formato invariante.");

    private static decimal? ConverterDecimalOpcional(string? valor, string coluna, int linha) =>
        string.IsNullOrWhiteSpace(valor) ? null : ConverterDecimal(valor, coluna, linha);

    private static bool ConverterBooleano(string valor, int linha) => valor.ToLowerInvariant() switch
    {
        "true" or "sim" or "1" => true,
        "false" or "nao" or "0" => false,
        _ => throw new InvalidDataException($"Linha {linha}: pacote deve ser true ou false.")
    };

    private static DateTimeOffset ConverterDataHora(string valor, int linha) =>
        DateTimeOffset.TryParseExact(valor, "yyyy-MM-dd'T'HH:mm:sszzz", CultureInfo.InvariantCulture, DateTimeStyles.None, out var resultado)
            ? resultado
            : throw new InvalidDataException($"Linha {linha}: data_hora deve usar yyyy-MM-ddTHH:mm:sszzz.");

    private static DateOnly ConverterData(string valor, string coluna, int linha) =>
        DateOnly.TryParseExact(valor, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var resultado)
            ? resultado
            : throw new InvalidDataException($"Linha {linha}: {coluna} deve usar yyyy-MM-dd.");

    private sealed record TabelaCsv(IReadOnlyCollection<LinhaCsv> Linhas)
    {
        public static async Task<TabelaCsv> Ler(string caminho, CancellationToken ct)
        {
            await using var arquivo = File.OpenRead(caminho);
            var linhas = await LeitorDeCsv.Ler(arquivo, ct);
            var cabecalho = linhas[0].Select(x => x.Trim()).ToArray();
            var repetidas = cabecalho.GroupBy(x => x, StringComparer.OrdinalIgnoreCase).Where(x => x.Count() > 1).Select(x => x.Key).ToArray();
            if (repetidas.Length > 0)
                throw new InvalidDataException($"Cabecalho duplicado em {caminho}: {string.Join(", ", repetidas)}");
            return new(linhas.Skip(1).Select((valores, indice) => new LinhaCsv(indice + 2, cabecalho, valores)).ToArray());
        }
    }

    private sealed record LinhaCsv(int Numero, string[] Cabecalho, string[] Valores)
    {
        public string Obrigatorio(string coluna) =>
            Opcional(coluna) ?? throw new InvalidDataException($"Linha {Numero}: a coluna {coluna} e obrigatoria.");

        public string? Opcional(string coluna)
        {
            var indice = Array.FindIndex(Cabecalho, x => string.Equals(x, coluna, StringComparison.OrdinalIgnoreCase));
            if (indice < 0)
                throw new InvalidDataException($"A coluna {coluna} nao existe no CSV.");
            if (indice >= Valores.Length || string.IsNullOrWhiteSpace(Valores[indice]))
                return null;
            return Valores[indice].Trim();
        }
    }
}
