using System.Text.Json;
using System.Data;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Auditoria;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Integracoes;
using LavaMais.Crm.Modulos.AcoesComerciais.Dominio;
using LavaMais.Crm.Modulos.AcoesComerciais.Infraestrutura;
using LavaMais.Crm.Modulos.Catalogo.Aplicacao;
using LavaMais.Crm.Modulos.ModelosDeMensagem.Aplicacao;
using LavaMais.Crm.Modulos.Segmentacao.Aplicacao;
using LavaMais.Crm.Modulos.Segmentacao.Dominio;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace LavaMais.Crm.Modulos.AcoesComerciais.Aplicacao;

public sealed class GerenciadorDeAcoesComerciais(ContextoDeAcoesComerciais banco, ConsultaDeCatalogo catalogo, ConsultaDeModelos modelos, SimuladorDePublico simulador, IRegistradorDeAuditoria auditoria, IPublicadorDeOutbox outbox, IContextoDoUsuario usuario, TimeProvider relogio) : IProjecaoDeEnvios
{
    private static readonly JsonSerializerOptions OpcoesJson = new(JsonSerializerDefaults.Web);
    public Task<List<AcaoComercial>> Listar(CancellationToken ct) => banco.Acoes.AsNoTracking().OrderByDescending(x => x.DataCriacao).ToListAsync(ct);
    public Task<AcaoComercial?> Obter(Guid id, CancellationToken ct) => banco.Acoes.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, ct);
    public Task<AcaoComercial?> ObterDetalhe(Guid id, CancellationToken ct) => banco.Acoes.AsNoTracking().Include(x => x.Destinatarios).SingleOrDefaultAsync(x => x.Id == id, ct);

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

    public async Task Preparar(Guid id, uint versaoEsperada, CancellationToken ct)
    {
        await using var transacao = await banco.Database.BeginTransactionAsync(IsolationLevel.RepeatableRead, ct);
        var acao = await banco.Acoes.Include(x => x.Destinatarios).SingleOrDefaultAsync(x => x.Id == id, ct) ?? throw new ExcecaoDeRecursoNaoEncontrado("Acao comercial nao encontrada.");
        if (acao.Versao != versaoEsperada) throw new ExcecaoDeConflito("versao_desatualizada", "A acao comercial foi alterada por outro usuario.");
        var transacaoBanco = transacao.GetDbTransaction();
        var item = await catalogo.ObterAtivo(acao.ItemDeCatalogoId, ct, transacaoBanco) ?? throw new ExcecaoDeRegraDeNegocio("item_invalido", "O item de catalogo nao existe ou esta inativo.");
        if (acao.VersaoModeloId is null) throw new ExcecaoDeRegraDeNegocio("modelo_obrigatorio", "Selecione uma versao publicada de modelo.");
        var modelo = await modelos.ObterVersaoPublicada(acao.VersaoModeloId.Value, ct, transacaoBanco) ?? throw new ExcecaoDeRegraDeNegocio("modelo_invalido", "A versao do modelo nao existe ou nao esta publicada.");
        var criterios = JsonSerializer.Deserialize<CriteriosDeSegmentacao>(acao.CriteriosSegmentacaoJson, OpcoesJson) ?? throw new ExcecaoDeRegraDeNegocio("criterios_invalidos", "Os criterios da acao sao invalidos.");
        var primeira = await simulador.Simular(criterios, 1, 100, ct, transacaoBanco); var elegiveis = primeira.Clientes.Where(x => x.Elegivel).ToList();
        var totalPaginas = (int)Math.Ceiling(primeira.QuantidadeEncontrada / 100m);
        for (var pagina = 2; pagina <= totalPaginas; pagina++) elegiveis.AddRange((await simulador.Simular(criterios, pagina, 100, ct, transacaoBanco)).Clientes.Where(x => x.Elegivel));
        var destinatarios = elegiveis.Select(x => new DestinatarioPreparado(x.ClienteId, x.Nome, x.Whatsapp!, Renderizar(modelo.ConteudoPreVisualizacao, x.Nome, item.Nome), modelo.ChaveTemplateNotificacao,
            JsonSerializer.Serialize(modelo.Variaveis.ToDictionary(v => v, v => v == "nomeCliente" ? x.Nome : item.Nome), OpcoesJson))).ToArray();
        var agora = relogio.GetUtcNow(); acao.Preparar(item.Nome, destinatarios, agora); banco.AddRange(acao.Destinatarios);
        try { await banco.SaveChangesAsync(ct); }
        catch (DbUpdateConcurrencyException) { throw new ExcecaoDeConflito("versao_desatualizada", "A acao comercial foi alterada por outro usuario."); }
        await auditoria.Registrar(new("AcaoComercialPreparada", "AcaoComercial", acao.Id, JsonSerializer.Serialize(new { acao.QuantidadeDestinatarios }, OpcoesJson), agora), transacaoBanco, ct);
        await transacao.CommitAsync(ct);
    }

    public Task<List<DestinatarioDaAcao>> ListarDestinatarios(Guid id, CancellationToken ct) => banco.Acoes.AsNoTracking().Where(x => x.Id == id).SelectMany(x => x.Destinatarios).OrderBy(x => x.NomeClienteSnapshot).ToListAsync(ct);

    public async Task<EnvioIndividualAceito> EnviarDestinatario(Guid acaoId, Guid destinatarioId, uint versaoEsperada, CancellationToken ct)
    {
        await using var tx = await banco.Database.BeginTransactionAsync(ct);
        var acao = await banco.Acoes.Include(x => x.Destinatarios)
            .SingleOrDefaultAsync(x => x.Id == acaoId && x.Destinatarios.Any(d => d.Id == destinatarioId), ct)
            ?? throw new ExcecaoDeRecursoNaoEncontrado("Destinatario da acao nao encontrado.");
        var destinatario = acao.Destinatarios.Single(x => x.Id == destinatarioId);
        if (destinatario.Versao != versaoEsperada)
            throw new ExcecaoDeConflito("versao_desatualizada", "O destinatario foi alterado por outro usuario.");

        var agora = relogio.GetUtcNow();
        acao.SolicitarEnvio(destinatarioId, agora);
        try
        {
            await banco.SaveChangesAsync(ct);
            var solicitacao = new SolicitacaoNotificationHub(
                "lavamais-crm",
                "Whatsapp",
                destinatario.ChaveTemplateNotificacaoSnapshot,
                destinatario.ChaveIdempotencia!,
                destinatario.NomeClienteSnapshot,
                destinatario.DestinoSnapshot,
                JsonSerializer.Deserialize<Dictionary<string, string>>(destinatario.PayloadNotificacaoJson, OpcoesJson)!);
            var mensagem = new MensagemDeOutboxSolicitada(
                acao.TenantId,
                "SolicitarNotificacao",
                destinatario.ChaveIdempotencia!,
                JsonSerializer.Serialize(new MensagemDeEnvioOutbox(acao.TenantId, destinatario.Id, solicitacao), OpcoesJson),
                agora);
            var dbtx = tx.GetDbTransaction();
            await outbox.Publicar(mensagem, dbtx, ct);
            await auditoria.Registrar(new("EnvioIndividualSolicitado", "DestinatarioDaAcao", destinatario.Id, JsonSerializer.Serialize(new { acaoId }, OpcoesJson), agora), dbtx, ct);
            await tx.CommitAsync(ct);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ExcecaoDeConflito("versao_desatualizada", "O destinatario foi alterado por outro usuario.");
        }

        return new(destinatario.Id, destinatario.SituacaoEnvio, destinatario.Versao);
    }

    public async Task RegistrarSolicitacao(Guid tenantId, Guid destinatarioId, string notificacaoId, System.Data.Common.DbTransaction transacao, CancellationToken ct)
    { banco.Database.SetDbConnection(transacao.Connection!, false); await banco.Database.UseTransactionAsync(transacao, ct); var d = await banco.Set<DestinatarioDaAcao>().IgnoreQueryFilters().SingleAsync(x => x.TenantId == tenantId && x.Id == destinatarioId, ct); d.RegistrarSolicitacao(notificacaoId); await banco.SaveChangesAsync(ct); }
    public async Task<IReadOnlyCollection<NotificacaoPendente>> ListarPendentes(int limite, CancellationToken ct) => await banco.Set<DestinatarioDaAcao>().IgnoreQueryFilters().AsNoTracking().Where(x => x.NotificacaoExternaId != null && x.SituacaoEnvio != SituacaoDoEnvio.Entregue && x.SituacaoEnvio != SituacaoDoEnvio.Lido && x.SituacaoEnvio != SituacaoDoEnvio.Falhou).OrderBy(x => x.DataUltimaReconciliacao ?? DateTimeOffset.MinValue).ThenBy(x => x.Id).Take(limite).Select(x => new NotificacaoPendente(x.TenantId, x.Id, x.NotificacaoExternaId!)).ToListAsync(ct);
    public async Task AtualizarEstado(Guid tenantId, Guid destinatarioId, string estadoExterno, string? codigoFalha, CancellationToken ct)
    { var d = await banco.Set<DestinatarioDaAcao>().IgnoreQueryFilters().SingleAsync(x => x.TenantId == tenantId && x.Id == destinatarioId, ct); var estado = estadoExterno.ToUpperInvariant() switch { "PENDING" or "PROCESSING" => SituacaoDoEnvio.Solicitado, "SENT" => SituacaoDoEnvio.Enviado, "DELIVERED" => SituacaoDoEnvio.Entregue, "READ" => SituacaoDoEnvio.Lido, "FAILED" or "UNDELIVERABLE" => SituacaoDoEnvio.Falhou, _ => d.SituacaoEnvio }; var agora = relogio.GetUtcNow(); d.AtualizarEstado(estado, codigoFalha, agora); var acao = await banco.Acoes.IgnoreQueryFilters().Include(x => x.Destinatarios).SingleAsync(x => x.TenantId == tenantId && x.Id == d.AcaoComercialId, ct); acao.RecalcularConclusao(agora); await banco.SaveChangesAsync(ct); }

    public async Task RegistrarResultado(Guid acaoId, Guid destinatarioId, ResultadoComercial resultado, decimal? valorConvertido, uint versaoEsperada, CancellationToken ct)
    {
        await using var tx = await banco.Database.BeginTransactionAsync(ct);
        var destinatario = await banco.Set<DestinatarioDaAcao>().SingleOrDefaultAsync(x => x.AcaoComercialId == acaoId && x.Id == destinatarioId, ct) ?? throw new ExcecaoDeRecursoNaoEncontrado("Destinatario da acao nao encontrado.");
        if (destinatario.Versao != versaoEsperada) throw new ExcecaoDeConflito("versao_desatualizada", "O destinatario foi alterado por outro usuario.");
        var agora = relogio.GetUtcNow(); destinatario.RegistrarResultado(resultado, valorConvertido, usuario.UsuarioIdentidadeId, agora);
        try { await banco.SaveChangesAsync(ct); } catch (DbUpdateConcurrencyException) { throw new ExcecaoDeConflito("versao_desatualizada", "O destinatario foi alterado por outro usuario."); }
        await auditoria.Registrar(new("ResultadoComercialAlterado", "DestinatarioDaAcao", destinatario.Id, JsonSerializer.Serialize(new { acaoId, resultado, valorConvertido }, OpcoesJson), agora), tx.GetDbTransaction(), ct);
        await tx.CommitAsync(ct);
    }

    private static string Renderizar(string conteudo, string nomeCliente, string itemCatalogo) => conteudo.Replace("{{nomeCliente}}", nomeCliente, StringComparison.Ordinal).Replace("{{itemCatalogo}}", itemCatalogo, StringComparison.Ordinal);

    private async Task<string> ValidarESerializar(DadosDoRascunho dados, CancellationToken ct)
    {
        dados.Criterios.Validar();
        if (await catalogo.ObterAtivo(dados.ItemDeCatalogoId, ct) is null) throw new ExcecaoDeRegraDeNegocio("item_invalido", "O item de catalogo nao existe ou esta inativo.");
        if (dados.VersaoModeloId is not null && await modelos.ObterVersaoPublicada(dados.VersaoModeloId.Value, ct) is null) throw new ExcecaoDeRegraDeNegocio("modelo_invalido", "A versao do modelo nao existe ou nao esta publicada.");
        return JsonSerializer.Serialize(dados.Criterios, OpcoesJson);
    }
}

public sealed record DadosDoRascunho(string Nome, string? Objetivo, Guid ItemDeCatalogoId, Guid? VersaoModeloId, CriteriosDeSegmentacao Criterios);
public sealed record EnvioIndividualAceito(Guid Id, SituacaoDoEnvio SituacaoEnvio, uint Versao);
