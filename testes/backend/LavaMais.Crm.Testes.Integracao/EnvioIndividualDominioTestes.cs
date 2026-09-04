using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;
using LavaMais.Crm.Modulos.AcoesComerciais.Dominio;

namespace LavaMais.Crm.Testes.Integracao;

public sealed class EnvioIndividualDominioTestes
{
    [Fact]
    public void Deve_exigir_aprovacao_antes_de_preparar_e_permitir_rejeicao()
    {
        var agora = DateTimeOffset.UtcNow;
        var acao = AcaoComercial.Criar(Guid.NewGuid(), "usuario", "Acao", null, null, Guid.NewGuid(), "{}", agora);
        Assert.Throws<ExcecaoDeConflito>(() => acao.Preparar(null, [new(Guid.NewGuid(), "Cliente", "5513999999999", "Ola")], agora));

        acao.SolicitarAprovacao(agora);
        Assert.Equal(SituacaoDaAcaoComercial.AguardandoAprovacao, acao.Situacao);
        acao.Rejeitar("Publico precisa de revisao", agora.AddMinutes(1));

        Assert.Equal(SituacaoDaAcaoComercial.Rejeitada, acao.Situacao);
    }

    [Fact]
    public void Deve_confirmar_manualmente_somente_o_destinatario_selecionado()
    {
        var acao = CriarPreparada();
        var destinatario = acao.Destinatarios.First();
        var outro = acao.Destinatarios.Last();
        var agora = DateTimeOffset.Parse("2026-09-02T14:00:00-03:00");

        var confirmado = acao.ConfirmarEnvio(destinatario.Id, "operador-teste", agora);

        Assert.Same(destinatario, confirmado);
        Assert.Equal(SituacaoDaAcaoComercial.EmProcessamento, acao.Situacao);
        Assert.Equal(SituacaoDoEnvio.Enviado, destinatario.SituacaoEnvio);
        Assert.Equal(agora, destinatario.DataEnvioConfirmado);
        Assert.Equal("operador-teste", destinatario.UsuarioEnvioConfirmadoId);
        Assert.Equal(SituacaoDoEnvio.Pendente, outro.SituacaoEnvio);
    }

    [Fact]
    public void Deve_rejeitar_destinatario_ja_confirmado()
    {
        var acao = CriarPreparada();
        var destinatario = acao.Destinatarios.First();
        acao.ConfirmarEnvio(destinatario.Id, "operador-teste", DateTimeOffset.UtcNow);

        var erro = Assert.Throws<ExcecaoDeConflito>(() => acao.ConfirmarEnvio(destinatario.Id, "operador-teste", DateTimeOffset.UtcNow));

        Assert.Equal("destinatario_ja_confirmado", erro.Codigo);
    }

    [Fact]
    public void Deve_rejeitar_acao_sem_audiencia_preparada()
    {
        var acao = AcaoComercial.Criar(Guid.NewGuid(), "usuario", "Acao", null, Guid.NewGuid(), Guid.NewGuid(), "{}", DateTimeOffset.UtcNow);

        var erro = Assert.Throws<ExcecaoDeConflito>(() => acao.ConfirmarEnvio(Guid.NewGuid(), "operador-teste", DateTimeOffset.UtcNow));

        Assert.Equal("acao_nao_disponivel_para_envio", erro.Codigo);
    }

    [Fact]
    public void Deve_concluir_somente_depois_de_confirmar_todos_os_envios()
    {
        var acao = CriarPreparada();
        var primeiro = acao.Destinatarios.First();
        var segundo = acao.Destinatarios.Last();
        var agora = DateTimeOffset.UtcNow;
        acao.ConfirmarEnvio(primeiro.Id, "operador-teste", agora);

        Assert.Equal(SituacaoDaAcaoComercial.EmProcessamento, acao.Situacao);
        acao.ConfirmarEnvio(segundo.Id, "operador-teste", agora.AddMinutes(1));
        Assert.Equal(SituacaoDaAcaoComercial.Concluida, acao.Situacao);
    }

    [Fact]
    public void Deve_exigir_confirmacao_do_envio_antes_do_resultado_comercial()
    {
        var acao = CriarPreparada();
        var destinatario = acao.Destinatarios.First();

        var erro = Assert.Throws<ExcecaoDeConflito>(() => destinatario.RegistrarResultado(
            ResultadoComercial.Interessado,
            null,
            "operador-teste",
            DateTimeOffset.UtcNow));

        Assert.Equal("envio_nao_confirmado", erro.Codigo);
    }

    private static AcaoComercial CriarPreparada()
    {
        var agora = DateTimeOffset.UtcNow;
        var acao = AcaoComercial.Criar(Guid.NewGuid(), "usuario", "Acao", null, Guid.NewGuid(), Guid.NewGuid(), "{}", agora);
        acao.SolicitarAprovacao(agora);
        acao.Preparar("Servico", [
            new(Guid.NewGuid(), "Cliente 1", "5513999999991", "Ola 1"),
            new(Guid.NewGuid(), "Cliente 2", "5513999999992", "Ola 2")
        ], agora);
        return acao;
    }
}
