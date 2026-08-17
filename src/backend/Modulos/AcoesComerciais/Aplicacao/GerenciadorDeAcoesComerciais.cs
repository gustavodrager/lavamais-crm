using System.Text.Json;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.Modulos.AcoesComerciais.Dominio;
using LavaMais.Crm.Modulos.AcoesComerciais.Infraestrutura;
using LavaMais.Crm.Modulos.Catalogo.Aplicacao;
using LavaMais.Crm.Modulos.ModelosDeMensagem.Aplicacao;
using LavaMais.Crm.Modulos.Segmentacao.Aplicacao;
using LavaMais.Crm.Modulos.Segmentacao.Dominio;
using Microsoft.EntityFrameworkCore;

namespace LavaMais.Crm.Modulos.AcoesComerciais.Aplicacao;

public sealed class GerenciadorDeAcoesComerciais(ContextoDeAcoesComerciais banco, ConsultaDeCatalogo catalogo, ConsultaDeModelos modelos, SimuladorDePublico simulador, IContextoDoUsuario usuario, TimeProvider relogio)
{
    private static readonly JsonSerializerOptions OpcoesJson = new(JsonSerializerDefaults.Web);
    public Task<List<AcaoComercial>> Listar(CancellationToken ct) => banco.Acoes.AsNoTracking().OrderByDescending(x => x.DataCriacao).ToListAsync(ct);
    public Task<AcaoComercial?> Obter(Guid id, CancellationToken ct) => banco.Acoes.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, ct);

    public async Task<AcaoComercial> Criar(DadosDoRascunho dados, CancellationToken ct)
    {
        var json = await ValidarESerializar(dados, ct);
        var acao = AcaoComercial.Criar(usuario.TenantId, usuario.UsuarioIdentidadeId, dados.Nome, dados.Objetivo, dados.ItemDeCatalogoId, dados.VersaoModeloId, json, relogio.GetUtcNow());
        banco.Add(acao); await banco.SaveChangesAsync(ct); return acao;
    }

    public async Task Atualizar(Guid id, DadosDoRascunho dados, CancellationToken ct)
    {
        var acao = await banco.Acoes.SingleOrDefaultAsync(x => x.Id == id, ct) ?? throw new ExcecaoDeRecursoNaoEncontrado("Acao comercial nao encontrada.");
        var json = await ValidarESerializar(dados, ct); acao.Atualizar(dados.Nome, dados.Objetivo, dados.ItemDeCatalogoId, dados.VersaoModeloId, json, relogio.GetUtcNow()); await banco.SaveChangesAsync(ct);
    }

    public async Task<ResultadoDaSimulacao> Simular(Guid id, int pagina, int tamanhoPagina, CancellationToken ct)
    {
        var acao = await banco.Acoes.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, ct) ?? throw new ExcecaoDeRecursoNaoEncontrado("Acao comercial nao encontrada.");
        var criterios = JsonSerializer.Deserialize<CriteriosDeSegmentacao>(acao.CriteriosSegmentacaoJson, OpcoesJson) ?? throw new ExcecaoDeRegraDeNegocio("criterios_invalidos", "Os criterios da acao sao invalidos.");
        return await simulador.Simular(criterios, pagina, tamanhoPagina, ct);
    }

    private async Task<string> ValidarESerializar(DadosDoRascunho dados, CancellationToken ct)
    {
        dados.Criterios.Validar();
        if (await catalogo.ObterAtivo(dados.ItemDeCatalogoId, ct) is null) throw new ExcecaoDeRegraDeNegocio("item_invalido", "O item de catalogo nao existe ou esta inativo.");
        if (dados.VersaoModeloId is not null && await modelos.ObterVersaoPublicada(dados.VersaoModeloId.Value, ct) is null) throw new ExcecaoDeRegraDeNegocio("modelo_invalido", "A versao do modelo nao existe ou nao esta publicada.");
        return JsonSerializer.Serialize(dados.Criterios, OpcoesJson);
    }
}

public sealed record DadosDoRascunho(string Nome, string? Objetivo, Guid ItemDeCatalogoId, Guid? VersaoModeloId, CriteriosDeSegmentacao Criterios);
