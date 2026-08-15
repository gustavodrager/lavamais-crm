using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;

namespace LavaMais.Crm.Modulos.Clientes.Dominio;

public static class NormalizadorDeWhatsapp
{
    public static string Normalizar(string valor)
    {
        var digitos = new string((valor ?? string.Empty).Where(char.IsDigit).ToArray());
        if (digitos.Length is 10 or 11) digitos = $"55{digitos}";
        if (digitos.Length is < 12 or > 15)
            throw new ExcecaoDeRegraDeNegocio("whatsapp_invalido", "O WhatsApp deve possuir entre 10 e 15 digitos.");
        return digitos;
    }
}
