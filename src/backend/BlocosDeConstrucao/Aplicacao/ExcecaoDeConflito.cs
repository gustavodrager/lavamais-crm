namespace LavaMais.Crm.BlocosDeConstrucao.Aplicacao;

public sealed class ExcecaoDeConflito(string codigo, string mensagem) : Exception(mensagem)
{
    public string Codigo { get; } = codigo;
}
