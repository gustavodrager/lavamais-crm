using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.Modulos.Autorizacao.Dominio;
using LavaMais.Crm.Modulos.Autorizacao.Infraestrutura;
using Microsoft.EntityFrameworkCore;

namespace LavaMais.Crm.Modulos.Autorizacao.Aplicacao;

public sealed class GerenciadorDeUsuariosCrm(ContextoDeAutorizacao banco, IContextoDoUsuario contexto, TimeProvider relogio)
{
    public Task<List<UsuarioCrm>> Listar(CancellationToken cancellationToken) =>
        banco.UsuariosCrm.AsNoTracking().OrderBy(usuario => usuario.UsuarioIdentidadeId).ToListAsync(cancellationToken);

    public async Task<UsuarioCrm> Criar(string usuarioIdentidadeId, PapelDoCrm papel, CancellationToken cancellationToken)
    {
        var existe = await banco.UsuariosCrm.AnyAsync(usuario => usuario.UsuarioIdentidadeId == usuarioIdentidadeId, cancellationToken);
        if (existe) throw new ExcecaoDeConflito("usuario_ja_cadastrado", "O usuario ja possui papel neste tenant.");

        var usuario = UsuarioCrm.Criar(contexto.TenantId, usuarioIdentidadeId, papel, relogio.GetUtcNow());
        banco.Add(usuario);
        await banco.SaveChangesAsync(cancellationToken);
        return usuario;
    }

    public async Task AlterarPapel(Guid id, PapelDoCrm papel, CancellationToken cancellationToken)
    {
        var usuario = await banco.UsuariosCrm.SingleOrDefaultAsync(item => item.Id == id, cancellationToken)
            ?? throw new ExcecaoDeRecursoNaoEncontrado("Usuario do CRM nao encontrado.");
        usuario.AlterarPapel(papel, relogio.GetUtcNow());
        await banco.SaveChangesAsync(cancellationToken);
    }

    public async Task Inativar(Guid id, CancellationToken cancellationToken)
    {
        var usuario = await banco.UsuariosCrm.SingleOrDefaultAsync(item => item.Id == id, cancellationToken)
            ?? throw new ExcecaoDeRecursoNaoEncontrado("Usuario do CRM nao encontrado.");
        usuario.Inativar(relogio.GetUtcNow());
        await banco.SaveChangesAsync(cancellationToken);
    }
}
