using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.Modulos.Clientes.Aplicacao;
using LavaMais.Crm.Modulos.Importacoes.Dominio;
using LavaMais.Crm.Modulos.Importacoes.Infraestrutura;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace LavaMais.Crm.Modulos.Importacoes.Aplicacao;

public sealed class GerenciadorDeImportacoes(ContextoDeImportacoes banco, GerenciadorDeClientes clientes, IContextoDoUsuario usuario, TimeProvider relogio)
{
    private const long TamanhoMaximo = 10 * 1024 * 1024;

    public async Task<PreVisualizacao> PreVisualizar(string nomeArquivo, Stream arquivo, long tamanho, MapeamentoCsv mapa, CancellationToken ct)
    {
        if (tamanho <= 0 || tamanho > TamanhoMaximo) throw new ExcecaoDeRegraDeNegocio("arquivo_invalido", "O CSV deve possuir no maximo 10 MB.");
        await using var memoria = new MemoryStream((int)tamanho); await arquivo.CopyToAsync(memoria, ct); var conteudo = memoria.ToArray();
        await using var leitura = new MemoryStream(conteudo, writable: false); var linhas = await LeitorDeCsv.Ler(leitura, ct); var cabecalho = linhas[0]; ValidarMapa(cabecalho, mapa);
        var importacao = ImportacaoDeClientes.Criar(usuario.TenantId, Path.GetFileName(nomeArquivo), conteudo, usuario.UsuarioIdentidadeId, relogio.GetUtcNow()); banco.Add(importacao); await banco.SaveChangesAsync(ct);
        var amostra = linhas.Skip(1).Take(20).Select((l, i) => ValidarLinha(cabecalho, l, i + 2, mapa)).ToArray();
        return new(importacao.Id, cabecalho, linhas.Count - 1, amostra);
    }

    public async Task<ImportacaoDeClientes> Confirmar(Guid id, MapeamentoCsv mapa, CancellationToken ct)
    {
        var importacao = await banco.Importacoes.Include(x => x.Linhas).SingleOrDefaultAsync(x => x.Id == id, ct) ?? throw new ExcecaoDeRecursoNaoEncontrado("Importacao nao encontrada.");
        importacao.Iniciar();
        await using var arquivo = new MemoryStream(importacao.ConteudoArquivo, writable: false); var linhas = await LeitorDeCsv.Ler(arquivo, ct); var cabecalho = linhas[0]; ValidarMapa(cabecalho, mapa);
        for (var i = 1; i < linhas.Count; i++)
        {
            var validacao = ValidarLinha(cabecalho, linhas[i], i + 1, mapa);
            if (validacao.Erros.Count > 0) { importacao.Registrar(i + 1, ResultadoDaLinha.Rejeitada, null, string.Join("; ", validacao.Erros)); continue; }
            try
            {
                var resultado = await clientes.ImportarOuAtualizar(validacao.Dados!, ct);
                importacao.Registrar(i + 1, resultado.Atualizado ? ResultadoDaLinha.Atualizada : ResultadoDaLinha.Inserida, resultado.Cliente.Id, null);
            }
            catch (Exception ex) when (ex is ExcecaoDeRegraDeNegocio or ExcecaoDeConflito or DbUpdateException) { importacao.Registrar(i + 1, ResultadoDaLinha.Rejeitada, null, ex.Message); }
        }
        importacao.Concluir(relogio.GetUtcNow()); banco.AddRange(importacao.Linhas); await banco.SaveChangesAsync(ct);
        return importacao;
    }

    public Task<ImportacaoDeClientes?> Obter(Guid id, CancellationToken ct) => banco.Importacoes.AsNoTracking().Include(x => x.Linhas).SingleOrDefaultAsync(x => x.Id == id, ct);

    private static void ValidarMapa(string[] cabecalho, MapeamentoCsv mapa)
    { foreach (var coluna in new[] { mapa.Nome, mapa.Whatsapp }) if (!cabecalho.Contains(coluna, StringComparer.OrdinalIgnoreCase)) throw new ExcecaoDeRegraDeNegocio("mapeamento_invalido", $"A coluna obrigatoria '{coluna}' nao existe no CSV."); }

    private static LinhaPreVisualizada ValidarLinha(string[] h, string[] l, int numero, MapeamentoCsv m)
    {
        string? Valor(string? c) { if (c is null) return null; var i = Array.FindIndex(h, x => string.Equals(x, c, StringComparison.OrdinalIgnoreCase)); return i >= 0 && i < l.Length ? l[i].Trim() : null; }
        var erros = new List<string>(); var nome = Valor(m.Nome) ?? ""; var whatsapp = AplicarDddPadrao(Valor(m.Whatsapp) ?? "", m.DddPadrao);
        if (string.IsNullOrWhiteSpace(nome)) erros.Add("Nome obrigatorio"); try { _ = LavaMais.Crm.Modulos.Clientes.Dominio.NormalizadorDeWhatsapp.Normalizar(whatsapp); } catch (Exception ex) { erros.Add(ex.Message); }
        var permissao = Valor(m.PermiteMarketingWhatsapp);
        var permitido = permissao is null ? m.PermiteMarketingWhatsappPadrao : bool.TryParse(permissao, out var p) ? p : permissao.Equals("sim", StringComparison.OrdinalIgnoreCase) || permissao == "1";
        var dataOrigem = ConverterData(Valor(m.DataCadastroOrigem), erros);
        var dados = erros.Count == 0 ? new DadosDoCliente(nome, whatsapp, null, Valor(m.Tipo), Valor(m.Email), null, permitido, new DadosDoEndereco(null, null, null, Valor(m.Bairro), Valor(m.Cidade), null, null), [], Valor(m.CodigoExterno), dataOrigem) : null;
        return new(numero, l, erros, dados);
    }

    private static string AplicarDddPadrao(string whatsapp, int? dddPadrao)
    {
        var digitos = new string(whatsapp.Where(char.IsDigit).ToArray());
        if (dddPadrao is >= 10 and <= 99 && digitos.Length is 8 or 9) return $"{dddPadrao}{digitos}";
        return whatsapp;
    }

    private static DateTimeOffset? ConverterData(string? valor, ICollection<string> erros)
    {
        if (string.IsNullOrWhiteSpace(valor)) return null;
        if (DateOnly.TryParse(valor, new CultureInfo("pt-BR"), DateTimeStyles.None, out var data))
            return new DateTimeOffset(data.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero);
        if (DateTimeOffset.TryParse(valor, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out var dataHora))
            return dataHora.ToUniversalTime();
        erros.Add("Data de cadastro na origem invalida");
        return null;
    }
}

public sealed record LinhaPreVisualizada(int Numero, IReadOnlyCollection<string> Valores, IReadOnlyCollection<string> Erros, DadosDoCliente? Dados);
public sealed record PreVisualizacao(Guid ReferenciaArquivo, IReadOnlyCollection<string> Colunas, int TotalLinhas, IReadOnlyCollection<LinhaPreVisualizada> Amostra);
