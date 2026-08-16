using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.Modulos.ModelosDeMensagem.Dominio;
using LavaMais.Crm.Modulos.ModelosDeMensagem.Infraestrutura;
using Microsoft.EntityFrameworkCore;

namespace LavaMais.Crm.Modulos.ModelosDeMensagem.Aplicacao;

public sealed class GerenciadorDeModelos(ContextoDeModelos banco, IContextoDoUsuario usuario, TimeProvider relogio)
{
    public Task<List<ModeloDeMensagem>> Listar(CancellationToken ct) => banco.Modelos.AsNoTracking().Include(x => x.Versoes).OrderBy(x => x.Nome).ToListAsync(ct);

    public async Task<ModeloDeMensagem> Criar(string nome, CancellationToken ct)
    {
        var modelo = ModeloDeMensagem.Criar(usuario.TenantId, nome, relogio.GetUtcNow());
        if (await banco.Modelos.AnyAsync(x => x.NomeNormalizado == modelo.NomeNormalizado, ct)) throw new ExcecaoDeConflito("modelo_duplicado", "Ja existe um modelo com este nome.");
        banco.Add(modelo); await banco.SaveChangesAsync(ct); return modelo;
    }

    public async Task<VersaoDoModelo> Publicar(Guid id, DadosDaPublicacao dados, CancellationToken ct)
    {
        var modelo = await banco.Modelos.Include(x => x.Versoes).SingleOrDefaultAsync(x => x.Id == id, ct) ?? throw new ExcecaoDeRecursoNaoEncontrado("Modelo de mensagem nao encontrado.");
        var versao = modelo.Publicar(dados.ConteudoPreVisualizacao, dados.Variaveis, dados.ChaveTemplateNotificacao, relogio.GetUtcNow());
        banco.Entry(versao).State = EntityState.Added; await banco.SaveChangesAsync(ct); return versao;
    }
}

public sealed record DadosDaPublicacao(string ConteudoPreVisualizacao, IReadOnlyCollection<string>? Variaveis, string ChaveTemplateNotificacao);
