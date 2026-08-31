namespace LavaMais.Crm.Modulos.Integracoes.Dominio;

public enum SituacaoDaOutbox { Pendente = 1, Processando = 2, Concluida = 3, Falhou = 4 }

public sealed class MensagemDaOutbox
{
    private MensagemDaOutbox() { }
    internal MensagemDaOutbox(Guid tenantId, string tipo, string chave, string conteudo, DateTimeOffset agora)
    { Id = Guid.NewGuid(); TenantId = tenantId; Tipo = tipo; ChaveUnica = chave; ConteudoJson = conteudo; Situacao = SituacaoDaOutbox.Pendente; DataCriacao = agora; DisponivelEm = agora; }
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public string Tipo { get; private set; } = ""; public string ChaveUnica { get; private set; } = ""; public string ConteudoJson { get; private set; } = "";
    public SituacaoDaOutbox Situacao { get; private set; }
    public int Tentativas { get; private set; }
    public DateTimeOffset DataCriacao { get; private set; }
    public DateTimeOffset DisponivelEm { get; private set; }
    public DateTimeOffset? ProcessandoAte { get; private set; }
    public DateTimeOffset? DataConclusao { get; private set; }
    public string? UltimoErro { get; private set; }
    public uint Versao { get; private set; }
    public void MarcarProcessando(DateTimeOffset agora) { Situacao = SituacaoDaOutbox.Processando; ProcessandoAte = agora.AddMinutes(1); Tentativas++; }
    public void Concluir(DateTimeOffset agora) { Situacao = SituacaoDaOutbox.Concluida; ProcessandoAte = null; DataConclusao = agora; UltimoErro = null; }
    public void Falhar(string erro, DateTimeOffset agora) { Situacao = SituacaoDaOutbox.Falhou; ProcessandoAte = null; DataConclusao = agora; UltimoErro = LimitarErro(erro); }
    public void Reagendar(string erro, DateTimeOffset agora) { Situacao = SituacaoDaOutbox.Pendente; ProcessandoAte = null; UltimoErro = erro.Length > 500 ? erro[..500] : erro; DisponivelEm = agora.AddSeconds(Math.Min(300, Math.Pow(2, Tentativas))); }

    private static string LimitarErro(string erro) => erro.Length > 500 ? erro[..500] : erro;
}
