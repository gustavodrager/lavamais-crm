using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Auditoria;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.Modulos.ModelosDeMensagem.Dominio;
using LavaMais.Crm.Modulos.ModelosDeMensagem.Infraestrutura;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using System.Data.Common;
using System.Text.Json;

namespace LavaMais.Crm.Modulos.ModelosDeMensagem.Aplicacao;

public sealed class GerenciadorDeModelos(ContextoDeModelos banco, IContextoDoUsuario usuario, TimeProvider relogio, IRegistradorDeAuditoria auditoria)
{
    private static readonly JsonSerializerOptions OpcoesJson = new(JsonSerializerDefaults.Web);
    public Task<List<ModeloDeMensagem>> Listar(CancellationToken ct) => banco.Modelos.AsNoTracking().Include(x => x.Versoes).OrderBy(x => x.Nome).ToListAsync(ct);

    public async Task<ModeloDeMensagem> Criar(string nome, CancellationToken ct)
    {
        var modelo = ModeloDeMensagem.Criar(usuario.TenantId, nome, relogio.GetUtcNow());
        if (await banco.Modelos.AnyAsync(x => x.NomeNormalizado == modelo.NomeNormalizado, ct)) throw new ExcecaoDeConflito("modelo_duplicado", "Ja existe um modelo com este nome.");
        banco.Add(modelo);
        await SalvarComAuditoria("ModeloDeMensagemCriado", modelo.Id, new { canal = modelo.Canal }, ct);
        return modelo;
    }

    public async Task<VersaoDoModelo> Publicar(Guid id, DadosDaPublicacao dados, CancellationToken ct)
    {
        var modelo = await banco.Modelos.Include(x => x.Versoes).SingleOrDefaultAsync(x => x.Id == id, ct) ?? throw new ExcecaoDeRecursoNaoEncontrado("Modelo de mensagem nao encontrado.");
        var versao = modelo.Publicar(dados.ConteudoPreVisualizacao, dados.Variaveis, relogio.GetUtcNow());
        banco.Entry(versao).State = EntityState.Added;
        await SalvarComAuditoria("ModeloDeMensagemPublicado", modelo.Id, new { versaoId = versao.Id, versao.Numero, quantidadeVariaveis = versao.Variaveis.Length }, ct);
        return versao;
    }

    private async Task SalvarComAuditoria(string tipo, Guid recursoId, object dados, CancellationToken ct)
    {
        await using var transacao = await banco.Database.BeginTransactionAsync(ct);
        await banco.SaveChangesAsync(ct);
        await auditoria.Registrar(new(tipo, "ModeloDeMensagem", recursoId, JsonSerializer.Serialize(dados, OpcoesJson), relogio.GetUtcNow()), transacao.GetDbTransaction(), ct);
        await transacao.CommitAsync(ct);
    }
}

public sealed record DadosDaPublicacao(string ConteudoPreVisualizacao, IReadOnlyCollection<string>? Variaveis);

public sealed class ConsultaDeModelos(ContextoDeModelos banco)
{
    public async Task<VersaoPublicadaDisponivel?> ObterVersaoPublicada(Guid id, CancellationToken ct, DbTransaction? transacao = null)
    {
        if (transacao is not null) { banco.Database.SetDbConnection(transacao.Connection!, false); await banco.Database.UseTransactionAsync(transacao, ct); }
        return await banco.Modelos.AsNoTracking().Where(x => x.Situacao == SituacaoDoModelo.Publicado)
            .SelectMany(x => x.Versoes.Where(v => v.Id == id), (modelo, versao) => new VersaoPublicadaDisponivel(versao.Id, modelo.Nome, versao.Numero, versao.ConteudoPreVisualizacao, versao.Variaveis)).SingleOrDefaultAsync(ct);
    }
}

public sealed record VersaoPublicadaDisponivel(Guid Id, string NomeModelo, int Numero, string ConteudoPreVisualizacao, IReadOnlyCollection<string> Variaveis);
