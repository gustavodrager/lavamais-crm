using System.Data.Common;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Integracoes;
using LavaMais.Crm.Modulos.Integracoes.Dominio;
using LavaMais.Crm.Modulos.Integracoes.Infraestrutura;
using Microsoft.EntityFrameworkCore;

namespace LavaMais.Crm.Modulos.Integracoes.Aplicacao;

public sealed class PublicadorDeOutbox(ContextoDeIntegracoes banco) : IPublicadorDeOutbox
{
    public async Task Publicar(IReadOnlyCollection<MensagemDeOutboxSolicitada> mensagens, DbTransaction transacao, CancellationToken ct)
    { banco.Database.SetDbConnection(transacao.Connection!, false); await banco.Database.UseTransactionAsync(transacao, ct); banco.AddRange(mensagens.Select(x => new MensagemDaOutbox(x.TenantId, x.Tipo, x.ChaveUnica, x.ConteudoJson, x.Data))); await banco.SaveChangesAsync(ct); }
}
