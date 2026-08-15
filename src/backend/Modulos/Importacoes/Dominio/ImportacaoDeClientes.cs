using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;

namespace LavaMais.Crm.Modulos.Importacoes.Dominio;

public enum SituacaoDaImportacao { PreVisualizada = 1, Processando = 2, Concluida = 3, ConcluidaComErros = 4 }
public enum ResultadoDaLinha { Inserida = 1, Rejeitada = 2 }

public sealed class ImportacaoDeClientes
{
    private ImportacaoDeClientes() { }
    private ImportacaoDeClientes(Guid tenantId, string arquivo, string caminho, string usuario, DateTimeOffset agora)
    { Id = Guid.NewGuid(); TenantId = tenantId; NomeArquivo = arquivo; CaminhoTemporario = caminho; UsuarioIdentidadeId = usuario; Situacao = SituacaoDaImportacao.PreVisualizada; DataCriacao = agora; Versao = 1; }
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public string NomeArquivo { get; private set; } = string.Empty;
    public string CaminhoTemporario { get; private set; } = string.Empty;
    public string UsuarioIdentidadeId { get; private set; } = string.Empty;
    public SituacaoDaImportacao Situacao { get; private set; }
    public int TotalLinhas { get; private set; }
    public int TotalInseridas { get; private set; }
    public int TotalRejeitadas { get; private set; }
    public DateTimeOffset DataCriacao { get; private set; }
    public DateTimeOffset? DataConclusao { get; private set; }
    public long Versao { get; private set; }
    public ICollection<LinhaDaImportacao> Linhas { get; private set; } = new List<LinhaDaImportacao>();
    public static ImportacaoDeClientes Criar(Guid tenantId, string arquivo, string caminho, string usuario, DateTimeOffset agora) => new(tenantId, arquivo, caminho, usuario, agora);
    public void Iniciar()
    {
        if (Situacao != SituacaoDaImportacao.PreVisualizada) throw new ExcecaoDeConflito("importacao_ja_confirmada", "A importacao ja foi confirmada.");
        Situacao = SituacaoDaImportacao.Processando;
    }
    public void Registrar(int numero, ResultadoDaLinha resultado, Guid? clienteId, string? erro)
    { Linhas.Add(new LinhaDaImportacao(TenantId, Id, numero, resultado, clienteId, erro)); TotalLinhas++; if (resultado == ResultadoDaLinha.Inserida) TotalInseridas++; else TotalRejeitadas++; }
    public void Concluir(DateTimeOffset agora) { Situacao = TotalRejeitadas == 0 ? SituacaoDaImportacao.Concluida : SituacaoDaImportacao.ConcluidaComErros; DataConclusao = agora; CaminhoTemporario = string.Empty; Versao++; }
}

public sealed class LinhaDaImportacao
{
    private LinhaDaImportacao() { }
    internal LinhaDaImportacao(Guid tenantId, Guid importacaoId, int numero, ResultadoDaLinha resultado, Guid? clienteId, string? erro)
    { Id = Guid.NewGuid(); TenantId = tenantId; ImportacaoId = importacaoId; Numero = numero; Resultado = resultado; ClienteId = clienteId; Erro = erro; }
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public Guid ImportacaoId { get; private set; }
    public int Numero { get; private set; }
    public ResultadoDaLinha Resultado { get; private set; }
    public Guid? ClienteId { get; private set; }
    public string? Erro { get; private set; }
}
