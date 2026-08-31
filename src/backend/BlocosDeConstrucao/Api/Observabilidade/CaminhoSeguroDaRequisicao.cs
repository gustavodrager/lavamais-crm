namespace LavaMais.Crm.BlocosDeConstrucao.Api.Observabilidade;

public static class CaminhoSeguroDaRequisicao
{
    private const string PrefixoWebhookWhatsMiau = "/api/v1/webhooks/whatsmiau/";

    public static string Obter(PathString caminho)
    {
        var valor = caminho.Value ?? string.Empty;
        return valor.StartsWith(PrefixoWebhookWhatsMiau, StringComparison.OrdinalIgnoreCase)
            ? $"{PrefixoWebhookWhatsMiau}{{segredo}}"
            : valor;
    }
}
