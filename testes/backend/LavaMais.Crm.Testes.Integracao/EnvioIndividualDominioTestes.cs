using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;
using LavaMais.Crm.Modulos.AcoesComerciais.Dominio;

namespace LavaMais.Crm.Testes.Integracao;

public sealed class EnvioIndividualDominioTestes
{
    [Fact]
    public void Deve_solicitar_somente_o_destinatario_selecionado()
    {
        var acao = CriarPreparada();
        var destinatario = acao.Destinatarios.First();
        var outro = acao.Destinatarios.Last();

        var solicitado = acao.SolicitarEnvio(destinatario.Id, DateTimeOffset.UtcNow);

        Assert.Same(destinatario, solicitado);
        Assert.Equal(SituacaoDaAcaoComercial.EmProcessamento, acao.Situacao);
        Assert.Equal(SituacaoDoEnvio.AguardandoSolicitacao, destinatario.SituacaoEnvio);
        Assert.Equal(SituacaoDoEnvio.Pendente, outro.SituacaoEnvio);
        Assert.Equal($"acao:{acao.Id}:destinatario:{destinatario.Id}:v1", destinatario.ChaveIdempotencia);
    }

    [Fact]
    public void Deve_rejeitar_destinatario_ja_solicitado()
    {
        var acao = CriarPreparada();
        var destinatario = acao.Destinatarios.First();
        acao.SolicitarEnvio(destinatario.Id, DateTimeOffset.UtcNow);

        var erro = Assert.Throws<ExcecaoDeConflito>(() => acao.SolicitarEnvio(destinatario.Id, DateTimeOffset.UtcNow));

        Assert.Equal("destinatario_ja_solicitado", erro.Codigo);
    }

    [Fact]
    public void Deve_rejeitar_acao_sem_audiencia_preparada()
    {
        var acao = AcaoComercial.Criar(Guid.NewGuid(), "usuario", "Acao", null, Guid.NewGuid(), Guid.NewGuid(), "{}", DateTimeOffset.UtcNow);

        var erro = Assert.Throws<ExcecaoDeConflito>(() => acao.SolicitarEnvio(Guid.NewGuid(), DateTimeOffset.UtcNow));

        Assert.Equal("acao_nao_disponivel_para_envio", erro.Codigo);
    }

    [Fact]
    public void Deve_concluir_somente_depois_de_solicitar_e_finalizar_todos()
    {
        var acao = CriarPreparada();
        var primeiro = acao.Destinatarios.First();
        var segundo = acao.Destinatarios.Last();
        var agora = DateTimeOffset.UtcNow;
        acao.SolicitarEnvio(primeiro.Id, agora);
        primeiro.RegistrarSolicitacao("notificacao-1");
        primeiro.AtualizarEstado(SituacaoDoEnvio.Entregue, null, agora);

        acao.RecalcularConclusao(agora);

        Assert.Equal(SituacaoDaAcaoComercial.EmProcessamento, acao.Situacao);
        acao.SolicitarEnvio(segundo.Id, agora);
        segundo.RegistrarSolicitacao("notificacao-2");
        segundo.AtualizarEstado(SituacaoDoEnvio.Falhou, "falha_teste", agora);
        acao.RecalcularConclusao(agora);
        Assert.Equal(SituacaoDaAcaoComercial.ConcluidaComFalhas, acao.Situacao);
    }

    private static AcaoComercial CriarPreparada()
    {
        var agora = DateTimeOffset.UtcNow;
        var acao = AcaoComercial.Criar(Guid.NewGuid(), "usuario", "Acao", null, Guid.NewGuid(), Guid.NewGuid(), "{}", agora);
        acao.Preparar("Servico", [
            new(Guid.NewGuid(), "Cliente 1", "5513999999991", "Ola 1", "template", "{}"),
            new(Guid.NewGuid(), "Cliente 2", "5513999999992", "Ola 2", "template", "{}")
        ], agora);
        return acao;
    }
}
