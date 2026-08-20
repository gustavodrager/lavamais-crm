using System.Data.Common;

namespace LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Integracoes;

public interface IPublicadorDeOutbox
{
    Task Publicar(MensagemDeOutboxSolicitada mensagem, DbTransaction transacao, CancellationToken ct);
}

public sealed record MensagemDeOutboxSolicitada(Guid TenantId, string Tipo, string ChaveUnica, string ConteudoJson, DateTimeOffset Data);
public sealed record MensagemDeEnvioOutbox(Guid TenantId, Guid DestinatarioId, SolicitacaoNotificationHub Solicitacao);
public sealed record SolicitacaoNotificationHub(string Source, string Channel, string TemplateKey, string IdempotencyKey, string RecipientName, string RecipientPhone, IReadOnlyDictionary<string, string> Payload);
