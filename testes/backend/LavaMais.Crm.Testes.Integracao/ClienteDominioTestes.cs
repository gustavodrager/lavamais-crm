using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;
using LavaMais.Crm.Modulos.Clientes.Dominio;

namespace LavaMais.Crm.Testes.Integracao;

public sealed class ClienteDominioTestes
{
    [Theory]
    [InlineData("(13) 99777-6655", "5513997776655")]
    [InlineData("+55 13 99777-6655", "5513997776655")]
    [InlineData("351912345678", "351912345678")]
    public void Deve_normalizar_whatsapp(string informado, string esperado) => Assert.Equal(esperado, NormalizadorDeWhatsapp.Normalizar(informado));

    [Fact]
    public void Deve_rejeitar_whatsapp_invalido()
    {
        var erro = Assert.Throws<ExcecaoDeRegraDeNegocio>(() => NormalizadorDeWhatsapp.Normalizar("123"));
        Assert.Equal("whatsapp_invalido", erro.Codigo);
    }
}
