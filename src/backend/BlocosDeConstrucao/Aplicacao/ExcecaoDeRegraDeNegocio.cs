namespace LavaMais.Crm.BlocosDeConstrucao.Aplicacao;

public sealed class ExcecaoDeRegraDeNegocio(string codigo, string mensagem) : Exception(mensagem)
{
    public string Codigo { get; } = codigo;
}
