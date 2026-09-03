using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Auditoria;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.Modulos.Autorizacao.Dominio;
using LavaMais.Crm.Modulos.Autorizacao.Infraestrutura;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using System.Text.Json;

namespace LavaMais.Crm.Modulos.Autorizacao.Aplicacao;

public sealed class GerenciadorDeUsuariosCrm(ContextoDeAutorizacao banco, IContextoDoUsuario contexto, TimeProvider relogio, IRegistradorDeAuditoria auditoria)
{
    private static readonly JsonSerializerOptions OpcoesJson = new(JsonSerializerDefaults.Web);
    public Task<List<UsuarioCrm>> Listar(CancellationToken cancellationToken) =>
        banco.UsuariosCrm.AsNoTracking().OrderBy(usuario => usuario.UsuarioIdentidadeId).ToListAsync(cancellationToken);

    public async Task<UsuarioCrm> Criar(string usuarioIdentidadeId, PapelDoCrm papel, CancellationToken cancellationToken)
    {
        var existe = await banco.UsuariosCrm.AnyAsync(usuario => usuario.UsuarioIdentidadeId == usuarioIdentidadeId, cancellationToken);
        if (existe) throw new ExcecaoDeConflito("usuario_ja_cadastrado", "O usuario ja possui papel neste tenant.");

        var usuario = UsuarioCrm.Criar(contexto.TenantId, usuarioIdentidadeId, papel, relogio.GetUtcNow());
        banco.Add(usuario);
        await SalvarComAuditoria("UsuarioCrmCriado", usuario.Id, new { papel }, cancellationToken);
        return usuario;
    }

    public async Task AlterarPapel(Guid id, PapelDoCrm papel, CancellationToken cancellationToken)
    {
        var usuario = await banco.UsuariosCrm.SingleOrDefaultAsync(item => item.Id == id, cancellationToken)
            ?? throw new ExcecaoDeRecursoNaoEncontrado("Usuario do CRM nao encontrado.");
        usuario.AlterarPapel(papel, relogio.GetUtcNow());
        await SalvarComAuditoria("PapelDoUsuarioCrmAlterado", usuario.Id, new { papel }, cancellationToken);
    }

    public async Task Inativar(Guid id, CancellationToken cancellationToken)
    {
        var usuario = await banco.UsuariosCrm.SingleOrDefaultAsync(item => item.Id == id, cancellationToken)
            ?? throw new ExcecaoDeRecursoNaoEncontrado("Usuario do CRM nao encontrado.");
        usuario.Inativar(relogio.GetUtcNow());
        await SalvarComAuditoria("UsuarioCrmInativado", usuario.Id, new { }, cancellationToken);
    }

    private async Task SalvarComAuditoria(string tipo, Guid recursoId, object dados, CancellationToken ct)
    {
        await using var transacao = await banco.Database.BeginTransactionAsync(ct);
        await banco.SaveChangesAsync(ct);
        await auditoria.Registrar(new(tipo, "UsuarioCrm", recursoId, JsonSerializer.Serialize(dados, OpcoesJson), relogio.GetUtcNow()), transacao.GetDbTransaction(), ct);
        await transacao.CommitAsync(ct);
    }
}
