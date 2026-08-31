namespace LavaMais.Crm.Modulos.Integracoes.Aplicacao;

public sealed class ExcecaoDeNotificacaoTransitoria(string mensagem, Exception? interna = null) : Exception(mensagem, interna);

public sealed class ExcecaoDeNotificacaoPermanente(string codigo, string mensagem, Exception? interna = null) : Exception(mensagem, interna)
{
    public string Codigo { get; } = codigo;
}
