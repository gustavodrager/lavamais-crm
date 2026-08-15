using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.Modulos.Clientes.Aplicacao;
using LavaMais.Crm.Modulos.Importacoes.Dominio;
using LavaMais.Crm.Modulos.Importacoes.Infraestrutura;
using Microsoft.EntityFrameworkCore;

namespace LavaMais.Crm.Modulos.Importacoes.Aplicacao;

public sealed class GerenciadorDeImportacoes(ContextoDeImportacoes banco, GerenciadorDeClientes clientes, IContextoDoUsuario usuario, TimeProvider relogio)
{
    private const long TamanhoMaximo = 10 * 1024 * 1024;

    public async Task<PreVisualizacao> PreVisualizar(string nomeArquivo, Stream arquivo, long tamanho, MapeamentoCsv mapa, CancellationToken ct)
    {
        if (tamanho <= 0 || tamanho > TamanhoMaximo) throw new ExcecaoDeRegraDeNegocio("arquivo_invalido", "O CSV deve possuir no maximo 10 MB.");
        var linhas = await LeitorDeCsv.Ler(arquivo, ct); var cabecalho = linhas[0]; ValidarMapa(cabecalho, mapa);
        var pasta = Path.Combine(Path.GetTempPath(), "lavamais-crm", "importacoes", usuario.TenantId.ToString("N")); Directory.CreateDirectory(pasta);
        var caminho = Path.Combine(pasta, $"{Guid.NewGuid():N}.csv"); arquivo.Position = 0; await using (var destino = File.Create(caminho)) await arquivo.CopyToAsync(destino, ct);
        var importacao = ImportacaoDeClientes.Criar(usuario.TenantId, Path.GetFileName(nomeArquivo), caminho, usuario.UsuarioIdentidadeId, relogio.GetUtcNow()); banco.Add(importacao); await banco.SaveChangesAsync(ct);
        var amostra = linhas.Skip(1).Take(20).Select((l, i) => ValidarLinha(cabecalho, l, i + 2, mapa)).ToArray();
        return new(importacao.Id, cabecalho, linhas.Count - 1, amostra);
    }

    public async Task<ImportacaoDeClientes> Confirmar(Guid id, MapeamentoCsv mapa, CancellationToken ct)
    {
        var importacao = await banco.Importacoes.Include(x => x.Linhas).SingleOrDefaultAsync(x => x.Id == id, ct) ?? throw new ExcecaoDeRecursoNaoEncontrado("Importacao nao encontrada.");
        importacao.Iniciar();
        await using var arquivo = File.OpenRead(importacao.CaminhoTemporario); var linhas = await LeitorDeCsv.Ler(arquivo, ct); var cabecalho = linhas[0]; ValidarMapa(cabecalho, mapa);
        for (var i = 1; i < linhas.Count; i++)
        {
            var validacao = ValidarLinha(cabecalho, linhas[i], i + 1, mapa);
            if (validacao.Erros.Count > 0) { importacao.Registrar(i + 1, ResultadoDaLinha.Rejeitada, null, string.Join("; ", validacao.Erros)); continue; }
            try { var cliente = await clientes.Criar(validacao.Dados!, ct); importacao.Registrar(i + 1, ResultadoDaLinha.Inserida, cliente.Id, null); }
            catch (Exception ex) when (ex is ExcecaoDeRegraDeNegocio or ExcecaoDeConflito or DbUpdateException) { importacao.Registrar(i + 1, ResultadoDaLinha.Rejeitada, null, ex.Message); }
        }
        var caminhoTemporario = importacao.CaminhoTemporario;
        importacao.Concluir(relogio.GetUtcNow()); banco.AddRange(importacao.Linhas); await banco.SaveChangesAsync(ct); File.Delete(caminhoTemporario);
        return importacao;
    }

    public Task<ImportacaoDeClientes?> Obter(Guid id, CancellationToken ct) => banco.Importacoes.AsNoTracking().Include(x => x.Linhas).SingleOrDefaultAsync(x => x.Id == id, ct);

    private static void ValidarMapa(string[] cabecalho, MapeamentoCsv mapa)
    { foreach (var coluna in new[] { mapa.Nome, mapa.Whatsapp }.Concat(new[] { mapa.Email, mapa.Bairro, mapa.Cidade, mapa.Tipo, mapa.PermiteMarketingWhatsapp }.Where(x => x is not null)!)) if (!cabecalho.Contains(coluna, StringComparer.OrdinalIgnoreCase)) throw new ExcecaoDeRegraDeNegocio("mapeamento_invalido", $"A coluna '{coluna}' nao existe no CSV."); }

    private static LinhaPreVisualizada ValidarLinha(string[] h, string[] l, int numero, MapeamentoCsv m)
    {
        string? Valor(string? c) { if (c is null) return null; var i = Array.FindIndex(h, x => string.Equals(x, c, StringComparison.OrdinalIgnoreCase)); return i >= 0 && i < l.Length ? l[i].Trim() : null; }
        var erros = new List<string>(); var nome = Valor(m.Nome) ?? ""; var whatsapp = Valor(m.Whatsapp) ?? "";
        if (string.IsNullOrWhiteSpace(nome)) erros.Add("Nome obrigatorio"); try { _ = LavaMais.Crm.Modulos.Clientes.Dominio.NormalizadorDeWhatsapp.Normalizar(whatsapp); } catch (Exception ex) { erros.Add(ex.Message); }
        var permissao = Valor(m.PermiteMarketingWhatsapp);
        var permitido = permissao is not null && (bool.TryParse(permissao, out var p) ? p : permissao.Equals("sim", StringComparison.OrdinalIgnoreCase) || permissao == "1");
        var dados = erros.Count == 0 ? new DadosDoCliente(nome, whatsapp, null, Valor(m.Tipo), Valor(m.Email), null, permitido, new DadosDoEndereco(null, null, null, Valor(m.Bairro), Valor(m.Cidade), null, null), []) : null;
        return new(numero, l, erros, dados);
    }
}

public sealed record LinhaPreVisualizada(int Numero, IReadOnlyCollection<string> Valores, IReadOnlyCollection<string> Erros, DadosDoCliente? Dados);
public sealed record PreVisualizacao(Guid ReferenciaArquivo, IReadOnlyCollection<string> Colunas, int TotalLinhas, IReadOnlyCollection<LinhaPreVisualizada> Amostra);
