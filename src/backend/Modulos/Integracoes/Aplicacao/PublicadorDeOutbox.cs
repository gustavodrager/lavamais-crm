using System.Data.Common;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Integracoes;
using LavaMais.Crm.Modulos.Integracoes.Dominio;
using LavaMais.Crm.Modulos.Integracoes.Infraestrutura;
using Microsoft.EntityFrameworkCore;

namespace LavaMais.Crm.Modulos.Integracoes.Aplicacao;

public sealed class PublicadorDeOutbox(ContextoDeIntegracoes banco) : IPublicadorDeOutbox
{
    public async Task Publicar(MensagemDeOutboxSolicitada mensagem, DbTransaction transacao, CancellationToken ct)
    {
        banco.Database.SetDbConnection(transacao.Connection!, false);
        await banco.Database.UseTransactionAsync(transacao, ct);
        banco.Add(new MensagemDaOutbox(mensagem.TenantId, mensagem.Tipo, mensagem.ChaveUnica, mensagem.ConteudoJson, mensagem.Data));
        await banco.SaveChangesAsync(ct);
    }
}
