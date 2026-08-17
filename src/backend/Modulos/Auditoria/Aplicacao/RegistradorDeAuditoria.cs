using System.Data.Common;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Auditoria;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.Modulos.Auditoria.Dominio;
using LavaMais.Crm.Modulos.Auditoria.Infraestrutura;
using Microsoft.EntityFrameworkCore;

namespace LavaMais.Crm.Modulos.Auditoria.Aplicacao;

public sealed class RegistradorDeAuditoria(ContextoDeAuditoria banco, IContextoDoUsuario usuario) : IRegistradorDeAuditoria
{
    public async Task Registrar(RegistroDeAuditoriaSolicitado registro, DbTransaction transacao, CancellationToken ct)
    {
        banco.Database.SetDbConnection(transacao.Connection!, false); await banco.Database.UseTransactionAsync(transacao, ct);
        banco.Add(new RegistroDeAuditoria(usuario.TenantId, usuario.UsuarioIdentidadeId, registro.Tipo, registro.Recurso, registro.RecursoId, registro.DadosJson, registro.Data)); await banco.SaveChangesAsync(ct);
    }

    public Task<List<RegistroDeAuditoria>> Listar(string? recurso, Guid? recursoId, CancellationToken ct)
    {
        var consulta = banco.Registros.AsNoTracking(); if (!string.IsNullOrWhiteSpace(recurso)) consulta = consulta.Where(x => x.Recurso == recurso); if (recursoId is not null) consulta = consulta.Where(x => x.RecursoId == recursoId);
        return consulta.OrderByDescending(x => x.Data).Take(200).ToListAsync(ct);
    }

    public Task<RegistroDeAuditoria?> Obter(Guid id, CancellationToken ct) => banco.Registros.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, ct);
}
