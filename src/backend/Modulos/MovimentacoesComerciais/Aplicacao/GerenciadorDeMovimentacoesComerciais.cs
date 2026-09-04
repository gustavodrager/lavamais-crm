using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Auditoria;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Clientes;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.MovimentacoesComerciais;
using LavaMais.Crm.Modulos.MovimentacoesComerciais.Dominio;
using LavaMais.Crm.Modulos.MovimentacoesComerciais.Infraestrutura;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using System.Text.Json;

namespace LavaMais.Crm.Modulos.MovimentacoesComerciais.Aplicacao;

public sealed class GerenciadorDeMovimentacoesComerciais(ContextoDeMovimentacoesComerciais banco, IConsultaDeClienteParaMovimentacao clientes, IConsultaDeCatalogoParaMovimentacao catalogo, IContextoDoUsuario usuario, TimeProvider relogio, IRegistradorDeAuditoria auditoria)
{
    private static readonly JsonSerializerOptions OpcoesJson = new(JsonSerializerDefaults.Web);
    public async Task<MovimentacaoComercial> Registrar(DadosDaMovimentacao dados, CancellationToken ct)
    {
        var codigo = string.IsNullOrWhiteSpace(dados.CodigoExterno) ? null : dados.CodigoExterno.Trim();
        if (codigo is not null && await banco.Movimentacoes.AnyAsync(x => x.CodigoExterno == codigo, ct)) throw new ExcecaoDeConflito("codigo_externo_duplicado", "Ja existe uma movimentacao com este codigo do Essence.");
        return await RegistrarInternamente(dados, codigo, OrigemDaMovimentacao.Recepcao, false, ct);
    }

    public async Task<ResultadoDaImportacaoDeMovimentacao> RegistrarImportada(DadosDaMovimentacao dados, CancellationToken ct)
    {
        var codigo = string.IsNullOrWhiteSpace(dados.CodigoExterno)
            ? throw new ExcecaoDeRegraDeNegocio("codigo_externo_obrigatorio", "O codigo externo e obrigatorio para importar uma movimentacao.")
            : dados.CodigoExterno.Trim();
        var data = dados.DataMovimentacao
            ?? throw new ExcecaoDeRegraDeNegocio("data_movimentacao_obrigatoria", "A data da movimentacao e obrigatoria para a importacao.");
        if (dados.Linhas is null || dados.Linhas.Count == 0)
            throw new ExcecaoDeRegraDeNegocio("linhas_obrigatorias", "Informe ao menos uma linha.");
        if (dados.Linhas.Any(x => x.PrecoUnitario is null))
            throw new ExcecaoDeRegraDeNegocio("preco_importado_obrigatorio", "Toda linha importada deve informar o preco praticado.");
        if (dados.Linhas.Any(x => x.Quantidade <= 0 || x.PrecoUnitario < 0))
            throw new ExcecaoDeRegraDeNegocio("linha_importada_invalida", "Quantidade e preco das linhas importadas devem ser validos.");
        if (dados.Linhas.Select(x => x.OfertaDeServicoId).Distinct().Count() != dados.Linhas.Count)
            throw new ExcecaoDeRegraDeNegocio("oferta_duplicada", "Uma oferta deve aparecer apenas uma vez.");

        var valorEsperado = dados.Linhas.Sum(x => x.Quantidade * x.PrecoUnitario!.Value);
        var existente = await banco.Movimentacoes.AsNoTracking().Include(x => x.Linhas)
            .SingleOrDefaultAsync(x => x.CodigoExterno == codigo, ct);
        if (existente is not null)
        {
            var linhasDivergentes = existente.Linhas.Count != dados.Linhas.Count
                || dados.Linhas.Any(esperada => !existente.Linhas.Any(atual =>
                    atual.OfertaDeServicoId == esperada.OfertaDeServicoId
                    && atual.Quantidade == esperada.Quantidade
                    && atual.PrecoUnitarioPraticado == esperada.PrecoUnitario!.Value));
            if (existente.ClienteId != dados.ClienteId
                || existente.DataMovimentacao != data.ToUniversalTime()
                || existente.ValorTotal != valorEsperado
                || existente.Origem != OrigemDaMovimentacao.ImportacaoEssence
                || linhasDivergentes)
                throw new ExcecaoDeConflito("movimentacao_importada_divergente", "O ticket ja existe no CRM com dados diferentes da carga.");
            return new(existente, true);
        }

        var movimentacao = await RegistrarInternamente(dados, codigo, OrigemDaMovimentacao.ImportacaoEssence, true, ct);
        return new(movimentacao, false);
    }

    public async Task<ResultadoDaSubstituicaoDeComposicao> SubstituirComposicaoImportada(
        string codigoExterno,
        IReadOnlyCollection<DadosDaLinha> linhas,
        string? observacao,
        CancellationToken ct)
    {
        var codigo = string.IsNullOrWhiteSpace(codigoExterno)
            ? throw new ExcecaoDeRegraDeNegocio("codigo_externo_obrigatorio", "O codigo externo e obrigatorio para substituir a composicao.")
            : codigoExterno.Trim();
        if (linhas.Count == 0)
            throw new ExcecaoDeRegraDeNegocio("linhas_obrigatorias", "Informe ao menos uma linha.");
        if (linhas.Any(x => x.PrecoUnitario is null || x.Quantidade <= 0 || x.PrecoUnitario < 0))
            throw new ExcecaoDeRegraDeNegocio("linha_importada_invalida", "Quantidade e preco das linhas importadas devem ser validos.");
        if (linhas.Select(x => x.OfertaDeServicoId).Distinct().Count() != linhas.Count)
            throw new ExcecaoDeRegraDeNegocio("oferta_duplicada", "Uma oferta deve aparecer apenas uma vez.");

        var movimentacao = await banco.Movimentacoes
            .SingleOrDefaultAsync(x => x.CodigoExterno == codigo, ct);
        if (movimentacao is null)
            return new(SituacaoDaSubstituicaoDeComposicao.Ausente, null);
        if (movimentacao.Origem != OrigemDaMovimentacao.ImportacaoEssence)
            throw new ExcecaoDeConflito("origem_incompativel", "O codigo informado pertence a uma movimentacao que nao veio da carga do Essence.");

        var preparadas = await PrepararLinhas(linhas, true, ct);
        var linhasAtuais = await banco.Linhas.AsNoTracking()
            .Where(x => x.MovimentacaoComercialId == movimentacao.Id)
            .ToListAsync(ct);
        var observacaoNormalizada = string.IsNullOrWhiteSpace(observacao) ? null : observacao.Trim();
        var inalterada = movimentacao.Observacao == observacaoNormalizada
            && linhasAtuais.Count == preparadas.Count
            && preparadas.All(esperada => linhasAtuais.Any(atual =>
                atual.OfertaDeServicoId == esperada.OfertaDeServicoId
                && atual.Quantidade == esperada.Quantidade
                && atual.PrecoUnitarioPraticado == esperada.PrecoPraticado));
        if (inalterada)
            return new(SituacaoDaSubstituicaoDeComposicao.Inalterada, movimentacao);

        await using var transacao = await banco.Database.BeginTransactionAsync(ct);
        await banco.Linhas
            .Where(x => x.MovimentacaoComercialId == movimentacao.Id)
            .ExecuteDeleteAsync(ct);
        movimentacao.SubstituirComposicaoImportada(preparadas, observacaoNormalizada);
        banco.Linhas.AddRange(movimentacao.Linhas);
        await banco.SaveChangesAsync(ct);
        await RegistrarAuditoria("ComposicaoDeMovimentacaoImportadaSubstituida", movimentacao.Id, new { quantidadeLinhas = linhas.Count }, transacao, ct);
        await transacao.CommitAsync(ct);
        return new(SituacaoDaSubstituicaoDeComposicao.Atualizada, movimentacao);
    }

    public void DescartarAlteracoesPendentes() => banco.ChangeTracker.Clear();

    public Task<List<MovimentacaoComercial>> Listar(Guid? clienteId, int limite, CancellationToken ct)
    {
        IQueryable<MovimentacaoComercial> consulta = banco.Movimentacoes.AsNoTracking().Include(x => x.Linhas);
        if (clienteId is not null) consulta = consulta.Where(x => x.ClienteId == clienteId);
        return consulta.OrderByDescending(x => x.DataMovimentacao).Take(Math.Clamp(limite, 1, 100)).ToListAsync(ct);
    }

    public Task<MovimentacaoComercial?> Obter(Guid id, CancellationToken ct) =>
        banco.Movimentacoes.AsNoTracking()
            .Include(x => x.Linhas)
            .SingleOrDefaultAsync(x => x.Id == id, ct);

    public async Task Cancelar(Guid id, string motivo, uint versaoEsperada, CancellationToken ct)
    {
        var movimentacao = await banco.Movimentacoes.SingleOrDefaultAsync(x => x.Id == id, ct) ?? throw new ExcecaoDeRecursoNaoEncontrado("Movimentacao comercial nao encontrada.");
        if (movimentacao.Versao != versaoEsperada) throw new ExcecaoDeConflito("versao_desatualizada", "A movimentacao comercial foi alterada por outro usuario.");
        movimentacao.Cancelar(motivo, usuario.UsuarioIdentidadeId, relogio.GetUtcNow());
        await using var transacao = await banco.Database.BeginTransactionAsync(ct);
        try
        {
            await banco.SaveChangesAsync(ct);
            await RegistrarAuditoria("MovimentacaoComercialCancelada", movimentacao.Id, new { }, transacao, ct);
            await transacao.CommitAsync(ct);
        }
        catch (DbUpdateConcurrencyException) { throw new ExcecaoDeConflito("versao_desatualizada", "A movimentacao comercial foi alterada por outro usuario."); }
    }

    private async Task<MovimentacaoComercial> RegistrarInternamente(
        DadosDaMovimentacao dados,
        string? codigo,
        OrigemDaMovimentacao origem,
        bool importacao,
        CancellationToken ct)
    {
        var cliente = await clientes.ObterAtivo(dados.ClienteId, ct)
            ?? throw new ExcecaoDeRegraDeNegocio("cliente_indisponivel", "O cliente informado nao esta ativo ou nao pertence ao tenant.");
        if (dados.Linhas is null || dados.Linhas.Count == 0)
            throw new ExcecaoDeRegraDeNegocio("linhas_obrigatorias", "Informe ao menos uma linha.");
        if (dados.Linhas.Select(x => x.OfertaDeServicoId).Distinct().Count() != dados.Linhas.Count)
            throw new ExcecaoDeRegraDeNegocio("oferta_duplicada", "Uma oferta deve aparecer apenas uma vez.");

        var linhas = await PrepararLinhas(dados.Linhas, importacao, ct);

        var agora = relogio.GetUtcNow();
        var movimentacao = MovimentacaoComercial.Registrar(
            usuario.TenantId,
            cliente.Id,
            cliente.Nome,
            linhas,
            dados.DataMovimentacao ?? agora,
            codigo,
            dados.Observacao,
            origem,
            usuario.UsuarioIdentidadeId,
            agora);
        banco.Add(movimentacao);
        await using var transacao = await banco.Database.BeginTransactionAsync(ct);
        await banco.SaveChangesAsync(ct);
        await RegistrarAuditoria("MovimentacaoComercialRegistrada", movimentacao.Id, new { origem, quantidadeLinhas = linhas.Count }, transacao, ct);
        await transacao.CommitAsync(ct);
        return movimentacao;
    }

    private async Task<List<LinhaPreparada>> PrepararLinhas(
        IReadOnlyCollection<DadosDaLinha> dados,
        bool importacao,
        CancellationToken ct)
    {
        var linhas = new List<LinhaPreparada>(dados.Count);
        foreach (var linha in dados)
        {
            var oferta = importacao
                ? await catalogo.ObterOfertaParaImportacao(linha.OfertaDeServicoId, ct)
                : await catalogo.ObterOfertaAtiva(linha.OfertaDeServicoId, ct);
            if (oferta is null)
                throw new ExcecaoDeRegraDeNegocio("oferta_indisponivel", "A oferta informada nao esta disponivel ou nao pertence ao tenant.");
            linhas.Add(new(
                oferta.Id,
                oferta.ArtigoId,
                oferta.NomeArtigo,
                oferta.ServicoId,
                oferta.NomeServico,
                linha.Quantidade,
                oferta.PrecoUnitario,
                linha.PrecoUnitario ?? oferta.PrecoUnitario));
        }
        return linhas;
    }

    private Task RegistrarAuditoria(string tipo, Guid recursoId, object dados, IDbContextTransaction transacao, CancellationToken ct) =>
        auditoria.Registrar(new(tipo, "MovimentacaoComercial", recursoId, JsonSerializer.Serialize(dados, OpcoesJson), relogio.GetUtcNow()), transacao.GetDbTransaction(), ct);
}

public sealed record DadosDaMovimentacao(Guid ClienteId, IReadOnlyCollection<DadosDaLinha> Linhas, DateTimeOffset? DataMovimentacao, string? CodigoExterno, string? Observacao);
public sealed record DadosDaLinha(Guid OfertaDeServicoId, int Quantidade, decimal? PrecoUnitario);
public sealed record ResultadoDaImportacaoDeMovimentacao(MovimentacaoComercial Movimentacao, bool Existente);

public sealed class ConsultaDeMovimentacoesParaClientes(ContextoDeMovimentacoesComerciais banco) : IConsultaDeMovimentacoesParaClientes
{
    public async Task<IReadOnlyCollection<Guid>> ListarClienteIdsComMovimentacao(CancellationToken cancellationToken) =>
        await banco.Movimentacoes.AsNoTracking()
            .Where(x => x.Situacao == SituacaoDaMovimentacao.Registrada)
            .Select(x => x.ClienteId)
            .Distinct()
            .ToArrayAsync(cancellationToken);
}
public enum SituacaoDaSubstituicaoDeComposicao { Ausente, Inalterada, Atualizada }
public sealed record ResultadoDaSubstituicaoDeComposicao(
    SituacaoDaSubstituicaoDeComposicao Situacao,
    MovimentacaoComercial? Movimentacao);
