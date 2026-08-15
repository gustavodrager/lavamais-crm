using System.Text;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;

namespace LavaMais.Crm.Modulos.Importacoes.Aplicacao;

public static class LeitorDeCsv
{
    public static async Task<List<string[]>> Ler(Stream fluxo, CancellationToken ct)
    {
        using var leitor = new StreamReader(fluxo, new UTF8Encoding(false, true), true, leaveOpen: true);
        var texto = await leitor.ReadToEndAsync(ct);
        var linhas = new List<string[]>(); var linha = new List<string>(); var campo = new StringBuilder(); var aspas = false;
        for (var i = 0; i < texto.Length; i++)
        {
            var c = texto[i];
            if (c == '"') { if (aspas && i + 1 < texto.Length && texto[i + 1] == '"') { campo.Append('"'); i++; } else aspas = !aspas; }
            else if (c == ',' && !aspas) { linha.Add(campo.ToString()); campo.Clear(); }
            else if ((c == '\n' || c == '\r') && !aspas) { if (c == '\r' && i + 1 < texto.Length && texto[i + 1] == '\n') i++; linha.Add(campo.ToString()); campo.Clear(); if (linha.Any(x => !string.IsNullOrWhiteSpace(x))) linhas.Add([.. linha]); linha.Clear(); }
            else campo.Append(c);
        }
        if (aspas) throw new ExcecaoDeRegraDeNegocio("csv_invalido", "O CSV possui aspas nao finalizadas.");
        linha.Add(campo.ToString()); if (linha.Any(x => !string.IsNullOrWhiteSpace(x))) linhas.Add([.. linha]);
        if (linhas.Count < 2) throw new ExcecaoDeRegraDeNegocio("csv_sem_dados", "O CSV deve possuir cabecalho e ao menos uma linha.");
        return linhas;
    }
}

public sealed record MapeamentoCsv(string Nome, string Whatsapp, string? Email, string? Bairro, string? Cidade, string? Tipo, string? PermiteMarketingWhatsapp);
