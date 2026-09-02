namespace LavaMais.Crm.BlocosDeConstrucao.Api.Observabilidade;

public static class CaminhoSeguroDaRequisicao
{
    public static string Obter(PathString caminho) => caminho.Value ?? string.Empty;
}
