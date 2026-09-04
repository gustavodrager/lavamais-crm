namespace LavaMais.Crm.ImportadorEssence;

internal sealed record OpcoesDaCarga(
    OperacaoDaCarga Operacao,
    AmbienteDaCarga Ambiente,
    Guid TenantId,
    string? ArquivoClientes,
    string ArquivoMovimentacoes,
    string? ArquivoProdutos,
    string ArquivoRelatorio,
    bool Confirmar,
    bool ProducaoAutorizada)
{
    internal const string ConfirmacaoDeProducao = "EU-AUTORIZO-CARGA-LAVAMAIS-PRODUCAO";

    public static OpcoesDaCarga Interpretar(string[] argumentos)
    {
        var valores = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        var confirmar = false;
        for (var i = 0; i < argumentos.Length; i++)
        {
            if (argumentos[i] == "--confirmar")
            {
                confirmar = true;
                continue;
            }

            if (!argumentos[i].StartsWith("--", StringComparison.Ordinal) || i + 1 >= argumentos.Length)
                throw new ArgumentException($"Argumento invalido: {argumentos[i]}");
            valores[argumentos[i]] = argumentos[++i];
        }

        var operacaoInformada = valores.GetValueOrDefault("--operacao") ?? nameof(OperacaoDaCarga.CargaHistorica);
        if (!Enum.TryParse<OperacaoDaCarga>(operacaoInformada, true, out var operacao))
            throw new ArgumentException("O argumento --operacao deve ser CargaHistorica, ComposicaoSintetica ou ReversaoComposicaoSintetica.");

        var ambienteInformado = Obrigatorio(valores, "--ambiente");
        if (!Enum.TryParse<AmbienteDaCarga>(ambienteInformado, true, out var ambiente))
            throw new ArgumentException("O argumento --ambiente deve ser Local, Homologacao ou Producao.");

        var producaoAutorizada = string.Equals(
            valores.GetValueOrDefault("--confirmar-producao"),
            ConfirmacaoDeProducao,
            StringComparison.Ordinal);
        if (ambiente == AmbienteDaCarga.Producao && !producaoAutorizada)
            throw new ArgumentException($"A carga em producao exige --confirmar-producao {ConfirmacaoDeProducao}.");

        var tenant = Obrigatorio(valores, "--tenant-id");
        if (!Guid.TryParse(tenant, out var tenantId) || tenantId == Guid.Empty)
            throw new ArgumentException("O argumento --tenant-id deve ser um UUID valido.");

        return new(
            operacao,
            ambiente,
            tenantId,
            operacao == OperacaoDaCarga.CargaHistorica
                ? CaminhoExistente(Obrigatorio(valores, "--clientes"), "--clientes")
                : CaminhoOpcional(valores, "--clientes"),
            CaminhoExistente(Obrigatorio(valores, "--movimentacoes"), "--movimentacoes"),
            operacao == OperacaoDaCarga.ReversaoComposicaoSintetica
                ? CaminhoOpcional(valores, "--produtos")
                : CaminhoExistente(Obrigatorio(valores, "--produtos"), "--produtos"),
            Path.GetFullPath(Obrigatorio(valores, "--relatorio")),
            confirmar,
            producaoAutorizada);
    }

    public static string Ajuda =>
        "Uso: dotnet run --project src/backend/LavaMais.Crm.ImportadorEssence -- " +
        "--operacao <CargaHistorica|ComposicaoSintetica|ReversaoComposicaoSintetica> " +
        "--ambiente <Local|Homologacao|Producao> --tenant-id <uuid> [--clientes <csv>] --movimentacoes <csv> [--produtos <csv>] " +
        $"--relatorio <json> [--confirmar] [--confirmar-producao {ConfirmacaoDeProducao}]";

    private static string Obrigatorio(IReadOnlyDictionary<string, string> valores, string nome) =>
        valores.TryGetValue(nome, out var valor) && !string.IsNullOrWhiteSpace(valor)
            ? valor
            : throw new ArgumentException($"O argumento {nome} e obrigatorio.");

    private static string CaminhoExistente(string caminho, string argumento)
    {
        var completo = Path.GetFullPath(caminho);
        return File.Exists(completo)
            ? completo
            : throw new ArgumentException($"O arquivo informado em {argumento} nao existe: {completo}");
    }

    private static string? CaminhoOpcional(IReadOnlyDictionary<string, string> valores, string argumento) =>
        valores.TryGetValue(argumento, out var caminho) && !string.IsNullOrWhiteSpace(caminho)
            ? CaminhoExistente(caminho, argumento)
            : null;
}

internal enum AmbienteDaCarga { Local, Homologacao, Producao }
internal enum OperacaoDaCarga { CargaHistorica, ComposicaoSintetica, ReversaoComposicaoSintetica }
