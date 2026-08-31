using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;
using LavaMais.Crm.Modulos.Clientes.Api;
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

    [Fact]
    public void Resposta_da_api_deve_expor_datas_cadastrais_do_cliente()
    {
        var tenantId = Guid.NewGuid();
        var dataCriacao = new DateTimeOffset(2026, 8, 15, 13, 30, 0, TimeSpan.Zero);
        var dataAtualizacao = dataCriacao.AddDays(2);
        var dataCadastroOrigem = new DateTimeOffset(2024, 2, 10, 9, 0, 0, TimeSpan.FromHours(-3));
        var cliente = Cliente.Criar(tenantId, "Ana Martins", "5513999999999", dataCriacao);
        cliente.DefinirDadosDeOrigem("1001", dataCadastroOrigem, dataAtualizacao);

        var resposta = ExtensoesDoModuloClientes.RespostaDeCliente.Criar(cliente);

        Assert.Equal(dataCriacao, resposta.DataCriacao);
        Assert.Equal(dataAtualizacao, resposta.DataAtualizacao);
        Assert.Equal(dataCadastroOrigem.ToUniversalTime(), resposta.DataCadastroOrigem);
        Assert.Equal("1001", resposta.CodigoExterno);
    }
}
