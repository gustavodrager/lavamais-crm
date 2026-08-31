using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Integracoes;
using Microsoft.Extensions.Options;

namespace LavaMais.Crm.Modulos.Integracoes.Aplicacao;

public interface IPortaDeNotificacoes
{
    ServicoDeNotificacao Servico { get; }
    Task<ReferenciaDeNotificacao> Criar(Guid tenantId, SolicitacaoDeNotificacao solicitacao, CancellationToken ct);
    Task<EstadoConsolidadoDaNotificacao> Obter(string id, CancellationToken ct);
}

public interface IDespachanteDeNotificacoes
{
    Task<ReferenciaDeNotificacao> Criar(Guid tenantId, SolicitacaoDeNotificacao solicitacao, CancellationToken ct);
    Task<EstadoConsolidadoDaNotificacao> Obter(ReferenciaDeNotificacao referencia, CancellationToken ct);
}

public sealed class RoteadorDeNotificacoes(
    IEnumerable<IPortaDeNotificacoes> portas,
    IOptions<OpcoesDeNotificacoes> opcoes) : IDespachanteDeNotificacoes
{
    private readonly IReadOnlyDictionary<ServicoDeNotificacao, IPortaDeNotificacoes> portas =
        portas.ToDictionary(x => x.Servico);

    public Task<ReferenciaDeNotificacao> Criar(
        Guid tenantId,
        SolicitacaoDeNotificacao solicitacao,
        CancellationToken ct)
    {
        var servico = opcoes.Value.Modo switch
        {
            ModoDeNotificacoes.Local => ServicoDeNotificacao.Local,
            ModoDeNotificacoes.Central => ServicoDeNotificacao.Central,
            _ => throw new ExcecaoDeNotificacaoPermanente(
                "notificacoes_desabilitadas",
                "O envio de notificacoes esta desabilitado neste ambiente.")
        };

        return ObterPorta(servico).Criar(tenantId, solicitacao, ct);
    }

    public Task<EstadoConsolidadoDaNotificacao> Obter(
        ReferenciaDeNotificacao referencia,
        CancellationToken ct) => ObterPorta(referencia.Servico).Obter(referencia.Id, ct);

    private IPortaDeNotificacoes ObterPorta(ServicoDeNotificacao servico) =>
        portas.TryGetValue(servico, out var porta)
            ? porta
            : throw new ExcecaoDeNotificacaoPermanente(
                "adaptador_notificacao_indisponivel",
                $"O adaptador de notificacao {servico} nao esta registrado.");
}
