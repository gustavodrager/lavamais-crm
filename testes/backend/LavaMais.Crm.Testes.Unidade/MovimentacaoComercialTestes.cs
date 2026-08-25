using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;
using LavaMais.Crm.Modulos.MovimentacoesComerciais.Dominio;

namespace LavaMais.Crm.Testes.Unidade;

public sealed class MovimentacaoComercialTestes
{
    [Fact]
    public void Deve_registrar_e_cancelar_movimentacao_com_rastreabilidade()
    {
        var agora = DateTimeOffset.Parse("2026-08-24T18:00:00-03:00");
        var movimentacao = MovimentacaoComercial.Registrar(Guid.NewGuid(), Guid.NewGuid(), "Ana", Guid.NewGuid(), "Lavagem por quilo", 89.90m, agora, "ESS-123", "Balcao", OrigemDaMovimentacao.Recepcao, "operador-1", agora);

        movimentacao.Cancelar("Pedido lancado em duplicidade", "gerente-1", agora.AddMinutes(5));

        Assert.Equal(SituacaoDaMovimentacao.Cancelada, movimentacao.Situacao);
        Assert.Equal("Pedido lancado em duplicidade", movimentacao.MotivoCancelamento);
        Assert.Equal("gerente-1", movimentacao.UsuarioCancelamentoId);
    }

    [Fact]
    public void Nao_deve_aceitar_valor_negativo()
    {
        Assert.Throws<ExcecaoDeRegraDeNegocio>(() => MovimentacaoComercial.Registrar(Guid.NewGuid(), Guid.NewGuid(), "Ana", Guid.NewGuid(), "Lavagem", -1, DateTimeOffset.UtcNow, null, null, OrigemDaMovimentacao.Recepcao, "operador", DateTimeOffset.UtcNow));
    }
}
