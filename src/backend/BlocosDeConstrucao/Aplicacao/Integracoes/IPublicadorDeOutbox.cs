using System.Data.Common;

namespace LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Integracoes;

public interface IPublicadorDeOutbox
{
    Task Publicar(MensagemDeOutboxSolicitada mensagem, DbTransaction transacao, CancellationToken ct);
}

public sealed record MensagemDeOutboxSolicitada(Guid TenantId, string Tipo, string ChaveUnica, string ConteudoJson, DateTimeOffset Data);
public sealed record MensagemDeEnvioOutbox(Guid TenantId, Guid DestinatarioId, SolicitacaoDeNotificacao Solicitacao);
