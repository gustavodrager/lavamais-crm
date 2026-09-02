using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.Modulos.Catalogo.Dominio;
using LavaMais.Crm.Modulos.Catalogo.Infraestrutura;
using Microsoft.EntityFrameworkCore;

namespace LavaMais.Crm.Modulos.Catalogo.Aplicacao;

public sealed class GerenciadorDoCatalogoDeLavanderia(ContextoDeCatalogo banco, IContextoDoUsuario usuario, TimeProvider relogio)
{
    private const string NomeDoArtigoHistoricoEssence = "Itens sem detalhamento do Essence";
    private const string NomeDoServicoHistoricoEssence = "Movimentacao historica importada";
    private const string NomeDoServicoSinteticoEssence = "Composicao sintetica de homologacao";
    private const string PrefixoDoArtigoSinteticoEssence = "HML sintetico - ";
    private const string CategoriaSinteticaEssence = "Composicao sintetica HML";

    public Task<List<ArtigoDeLavanderia>> ListarArtigos(CancellationToken ct) => banco.ArtigosDeLavanderia.AsNoTracking().OrderBy(x => x.Categoria).ThenBy(x => x.Nome).ToListAsync(ct);
    public Task<List<ServicoDeLavanderia>> ListarServicos(CancellationToken ct) => banco.ServicosDeLavanderia.AsNoTracking().OrderBy(x => x.Nome).ToListAsync(ct);
    public Task<List<OfertaDeServico>> ListarOfertas(CancellationToken ct) => banco.OfertasDeServico.AsNoTracking().Include(x => x.Artigo).Include(x => x.Servico)
        .Where(x => x.Situacao == SituacaoDoCatalogoDeLavanderia.Ativo
            && x.Artigo.Situacao == SituacaoDoCatalogoDeLavanderia.Ativo
            && x.Servico.Situacao == SituacaoDoCatalogoDeLavanderia.Ativo)
        .OrderBy(x => x.Artigo.Categoria).ThenBy(x => x.Artigo.Nome).ThenBy(x => x.Servico.Nome).ToListAsync(ct);

    public async Task<OfertaHistoricaDoEssence> ObterOuCriarOfertaHistoricaDoEssence(CancellationToken ct)
    {
        var agora = relogio.GetUtcNow();
        var artigo = await banco.ArtigosDeLavanderia.SingleOrDefaultAsync(x => x.NomeNormalizado == NomeDoArtigoHistoricoEssence.ToUpperInvariant(), ct);
        if (artigo is null)
        {
            artigo = ArtigoDeLavanderia.Criar(usuario.TenantId, NomeDoArtigoHistoricoEssence, "Referencia historica", agora);
            artigo.AlterarSituacao(SituacaoDoCatalogoDeLavanderia.Inativo, agora);
            banco.Add(artigo);
        }

        var servico = await banco.ServicosDeLavanderia.SingleOrDefaultAsync(x => x.NomeNormalizado == NomeDoServicoHistoricoEssence.ToUpperInvariant(), ct);
        if (servico is null)
        {
            servico = ServicoDeLavanderia.Criar(usuario.TenantId, NomeDoServicoHistoricoEssence, "Uso exclusivo para tickets importados sem composicao de itens.", agora);
            servico.AlterarSituacao(SituacaoDoCatalogoDeLavanderia.Inativo, agora);
            banco.Add(servico);
        }

        await banco.SaveChangesAsync(ct);
        var oferta = await banco.OfertasDeServico.SingleOrDefaultAsync(
            x => x.ArtigoDeLavanderiaId == artigo.Id && x.ServicoDeLavanderiaId == servico.Id,
            ct);
        if (oferta is null)
        {
            oferta = OfertaDeServico.Criar(usuario.TenantId, artigo.Id, servico.Id, 0m, agora);
            oferta.AlterarSituacao(SituacaoDoCatalogoDeLavanderia.Inativo, agora);
            banco.Add(oferta);
            await banco.SaveChangesAsync(ct);
        }

        return new(oferta.Id, artigo.Id, artigo.Nome, servico.Id, servico.Nome);
    }

    public async Task<IReadOnlyDictionary<string, OfertaSinteticaDoEssence>> ObterOuCriarOfertasSinteticasDoEssence(
        IReadOnlyCollection<DefinicaoDeProdutoSinteticoDoEssence> definicoes,
        CancellationToken ct)
    {
        if (definicoes.Count == 0)
            throw new ArgumentException("Informe ao menos um produto para criar as ofertas sinteticas.", nameof(definicoes));
        var repetidas = definicoes.GroupBy(x => x.Chave, StringComparer.Ordinal).Where(x => x.Count() > 1).Select(x => x.Key).ToArray();
        if (repetidas.Length > 0)
            throw new ArgumentException($"Existem chaves de produtos sinteticos repetidas: {string.Join(", ", repetidas)}", nameof(definicoes));
        var nomesPorChave = definicoes.ToDictionary(
            x => x.Chave,
            x => CriarNomeDoArtigoSintetico(x.Nome),
            StringComparer.Ordinal);
        var nomesRepetidos = nomesPorChave.Values
            .GroupBy(x => x, StringComparer.OrdinalIgnoreCase)
            .Where(x => x.Count() > 1)
            .Select(x => x.Key)
            .ToArray();
        if (nomesRepetidos.Length > 0)
            throw new ArgumentException($"Existem nomes de produtos sinteticos repetidos apos a normalizacao: {string.Join(", ", nomesRepetidos)}", nameof(definicoes));

        var agora = relogio.GetUtcNow();
        var nomeNormalizadoDoServico = NomeDoServicoSinteticoEssence.ToUpperInvariant();
        var servico = await banco.ServicosDeLavanderia.SingleOrDefaultAsync(x => x.NomeNormalizado == nomeNormalizadoDoServico, ct);
        if (servico is null)
        {
            servico = ServicoDeLavanderia.Criar(
                usuario.TenantId,
                NomeDoServicoSinteticoEssence,
                "Uso exclusivo em composicoes sinteticas de homologacao; nao representa o servico real do Essence.",
                agora);
            servico.AlterarSituacao(SituacaoDoCatalogoDeLavanderia.Inativo, agora);
            banco.Add(servico);
        }
        else if (servico.Situacao != SituacaoDoCatalogoDeLavanderia.Inativo)
        {
            servico.AlterarSituacao(SituacaoDoCatalogoDeLavanderia.Inativo, agora);
        }

        var nomesNormalizados = nomesPorChave.Values.Select(x => x.ToUpperInvariant()).ToArray();
        var artigos = (await banco.ArtigosDeLavanderia
                .Where(x => nomesNormalizados.Contains(x.NomeNormalizado))
                .ToListAsync(ct))
            .ToDictionary(x => x.NomeNormalizado, StringComparer.Ordinal);
        foreach (var nome in nomesPorChave.Values)
        {
            var normalizado = nome.ToUpperInvariant();
            if (!artigos.TryGetValue(normalizado, out var artigo))
            {
                artigo = ArtigoDeLavanderia.Criar(usuario.TenantId, nome, CategoriaSinteticaEssence, agora);
                artigo.AlterarSituacao(SituacaoDoCatalogoDeLavanderia.Inativo, agora);
                banco.Add(artigo);
                artigos[normalizado] = artigo;
            }
            else if (artigo.Situacao != SituacaoDoCatalogoDeLavanderia.Inativo)
            {
                artigo.AlterarSituacao(SituacaoDoCatalogoDeLavanderia.Inativo, agora);
            }
        }

        await banco.SaveChangesAsync(ct);
        var artigosIds = artigos.Values.Select(x => x.Id).ToArray();
        var ofertas = (await banco.OfertasDeServico
                .Where(x => x.ServicoDeLavanderiaId == servico.Id && artigosIds.Contains(x.ArtigoDeLavanderiaId))
                .ToListAsync(ct))
            .ToDictionary(x => x.ArtigoDeLavanderiaId);
        foreach (var definicao in definicoes)
        {
            var artigo = artigos[nomesPorChave[definicao.Chave].ToUpperInvariant()];
            if (!ofertas.TryGetValue(artigo.Id, out var oferta))
            {
                oferta = OfertaDeServico.Criar(usuario.TenantId, artigo.Id, servico.Id, definicao.ValorUnitarioReferencia, agora);
                oferta.AlterarSituacao(SituacaoDoCatalogoDeLavanderia.Inativo, agora);
                banco.Add(oferta);
                ofertas[artigo.Id] = oferta;
            }
            else if (oferta.Situacao != SituacaoDoCatalogoDeLavanderia.Inativo)
            {
                oferta.AlterarSituacao(SituacaoDoCatalogoDeLavanderia.Inativo, agora);
            }
        }
        await banco.SaveChangesAsync(ct);

        return definicoes.ToDictionary(
            definicao => definicao.Chave,
            definicao =>
            {
                var artigo = artigos[nomesPorChave[definicao.Chave].ToUpperInvariant()];
                var oferta = ofertas[artigo.Id];
                return new OfertaSinteticaDoEssence(
                    definicao.Chave,
                    oferta.Id,
                    artigo.Id,
                    artigo.Nome,
                    servico.Id,
                    servico.Nome,
                    oferta.PrecoUnitario);
            },
            StringComparer.Ordinal);
    }

    public async Task<ResultadoDaCargaInicial> CarregarCatalogoInicial(CancellationToken ct)
    {
        var agora = relogio.GetUtcNow();
        var artigosExistentes = await banco.ArtigosDeLavanderia.ToDictionaryAsync(x => x.NomeNormalizado, ct);
        var servicosExistentes = await banco.ServicosDeLavanderia.ToDictionaryAsync(x => x.NomeNormalizado, ct);
        var artigosCriados = 0; var servicosCriados = 0; var ofertasCriadas = 0;
        foreach (var definicao in Servicos)
        {
            var chave = definicao.Nome.ToUpperInvariant();
            if (servicosExistentes.ContainsKey(chave)) continue;
            var servico = ServicoDeLavanderia.Criar(usuario.TenantId, definicao.Nome, definicao.Descricao, agora); banco.Add(servico); servicosExistentes[chave] = servico; servicosCriados++;
        }
        foreach (var definicao in Artigos)
        {
            var chave = definicao.Nome.ToUpperInvariant();
            if (artigosExistentes.ContainsKey(chave)) continue;
            var artigo = ArtigoDeLavanderia.Criar(usuario.TenantId, definicao.Nome, definicao.Categoria, agora); banco.Add(artigo); artigosExistentes[chave] = artigo; artigosCriados++;
        }
        await banco.SaveChangesAsync(ct);
        var existentes = await banco.OfertasDeServico.Select(x => new { x.ArtigoDeLavanderiaId, x.ServicoDeLavanderiaId }).ToListAsync(ct);
        var chaves = existentes.Select(x => (x.ArtigoDeLavanderiaId, x.ServicoDeLavanderiaId)).ToHashSet();
        foreach (var artigo in Artigos)
            foreach (var nomeServico in artigo.Servicos)
            {
                var entidadeArtigo = artigosExistentes[artigo.Nome.ToUpperInvariant()]; var servico = servicosExistentes[nomeServico.ToUpperInvariant()];
                if (!chaves.Add((entidadeArtigo.Id, servico.Id))) continue;
                banco.Add(OfertaDeServico.Criar(usuario.TenantId, entidadeArtigo.Id, servico.Id, CalcularPreco(artigo.PrecoBase, nomeServico), agora)); ofertasCriadas++;
            }
        await banco.SaveChangesAsync(ct);
        return new(artigosCriados, servicosCriados, ofertasCriadas);
    }

    private static decimal CalcularPreco(decimal baseLavagem, string servico) => decimal.Round(servico switch
    {
        "Lavagem" => baseLavagem,
        "Passadoria" => Math.Max(5, baseLavagem * 0.55m),
        "Lavagem e passadoria" => baseLavagem * 1.35m,
        "Lavagem a seco" => baseLavagem * 1.65m,
        "Lavagem delicada" => baseLavagem * 1.45m,
        "Higienizacao" => baseLavagem * 1.25m,
        "Impermeabilizacao" => baseLavagem * 1.80m,
        "Remocao de manchas" => baseLavagem * 0.65m,
        "Desodorizacao" => baseLavagem * 0.45m,
        "Engomagem" => baseLavagem * 0.50m,
        "Limpeza de couro" => baseLavagem * 2.10m,
        "Pequenos reparos" => baseLavagem * 0.75m,
        _ => baseLavagem
    }, 2);

    private static string CriarNomeDoArtigoSintetico(string nome)
    {
        var original = nome.Trim();
        var limite = 160 - PrefixoDoArtigoSinteticoEssence.Length;
        if (original.Length > limite) original = original[..limite];
        return $"{PrefixoDoArtigoSinteticoEssence}{original}";
    }

    private static readonly DefinicaoDeServico[] Servicos =
    [
        new("Lavagem", "Lavagem profissional por unidade."), new("Passadoria", "Passadoria profissional por unidade."),
        new("Lavagem e passadoria", "Servico combinado de lavagem e passadoria."), new("Lavagem a seco", "Limpeza profissional a seco."),
        new("Lavagem delicada", "Cuidado para tecidos e acabamentos delicados."), new("Higienizacao", "Higienizacao profunda do artigo."),
        new("Impermeabilizacao", "Protecao impermeabilizante apropriada ao artigo."), new("Remocao de manchas", "Tratamento localizado de manchas."),
        new("Desodorizacao", "Tratamento para neutralizacao de odores."), new("Engomagem", "Aplicacao de goma e acabamento."),
        new("Limpeza de couro", "Limpeza especifica para couro."), new("Pequenos reparos", "Ajustes e reparos simples, sujeitos a avaliacao.")
    ];

    private static readonly DefinicaoDeArtigo[] Artigos =
    [
        new("Camisa", "Vestuario", 12, ["Lavagem", "Passadoria", "Lavagem e passadoria", "Lavagem a seco", "Remocao de manchas", "Engomagem"]),
        new("Camiseta", "Vestuario", 10, ["Lavagem", "Passadoria", "Lavagem e passadoria", "Remocao de manchas"]),
        new("Calca", "Vestuario", 14, ["Lavagem", "Passadoria", "Lavagem e passadoria", "Lavagem a seco", "Remocao de manchas"]),
        new("Jeans", "Vestuario", 16, ["Lavagem", "Passadoria", "Lavagem e passadoria", "Remocao de manchas"]),
        new("Bermuda", "Vestuario", 11, ["Lavagem", "Passadoria", "Lavagem e passadoria"]),
        new("Saia", "Vestuario", 15, ["Lavagem", "Passadoria", "Lavagem e passadoria", "Lavagem delicada"]),
        new("Vestido", "Vestuario", 25, ["Lavagem", "Passadoria", "Lavagem e passadoria", "Lavagem a seco", "Lavagem delicada"]),
        new("Vestido de festa", "Vestuario", 55, ["Lavagem a seco", "Lavagem delicada", "Remocao de manchas"]),
        new("Terno", "Vestuario", 48, ["Lavagem a seco", "Passadoria", "Remocao de manchas"]),
        new("Paleto", "Vestuario", 32, ["Lavagem a seco", "Passadoria"]), new("Gravata", "Vestuario", 12, ["Lavagem a seco", "Lavagem delicada"]),
        new("Blazer", "Vestuario", 30, ["Lavagem a seco", "Passadoria"]), new("Casaco", "Vestuario", 32, ["Lavagem", "Lavagem a seco", "Lavagem delicada"]),
        new("Jaqueta", "Vestuario", 28, ["Lavagem", "Lavagem a seco", "Lavagem delicada"]), new("Roupa de couro", "Vestuario", 70, ["Limpeza de couro", "Desodorizacao"]),
        new("Uniforme", "Comercial", 14, ["Lavagem", "Passadoria", "Lavagem e passadoria", "Engomagem"]),
        new("Jaleco", "Comercial", 16, ["Lavagem", "Passadoria", "Lavagem e passadoria", "Remocao de manchas"]),
        new("Lencol solteiro", "Cama", 14, ["Lavagem", "Passadoria", "Lavagem e passadoria"]), new("Lencol casal", "Cama", 18, ["Lavagem", "Passadoria", "Lavagem e passadoria"]),
        new("Fronha", "Cama", 6, ["Lavagem", "Passadoria", "Lavagem e passadoria"]), new("Colcha", "Cama", 35, ["Lavagem", "Lavagem delicada", "Higienizacao"]),
        new("Cobertor solteiro", "Cama", 32, ["Lavagem", "Higienizacao", "Desodorizacao"]), new("Cobertor casal", "Cama", 42, ["Lavagem", "Higienizacao", "Desodorizacao"]),
        new("Edredom solteiro", "Cama", 45, ["Lavagem", "Higienizacao", "Desodorizacao"]), new("Edredom casal", "Cama", 55, ["Lavagem", "Higienizacao", "Desodorizacao"]),
        new("Edredom queen", "Cama", 65, ["Lavagem", "Higienizacao", "Desodorizacao"]), new("Edredom king", "Cama", 75, ["Lavagem", "Higienizacao", "Desodorizacao"]),
        new("Travesseiro", "Cama", 25, ["Lavagem", "Higienizacao", "Desodorizacao"]), new("Protetor de colchao", "Cama", 28, ["Lavagem", "Higienizacao"]),
        new("Toalha de banho", "Banho", 10, ["Lavagem", "Lavagem e passadoria"]), new("Toalha de rosto", "Banho", 6, ["Lavagem", "Lavagem e passadoria"]),
        new("Toalha de mesa", "Mesa", 18, ["Lavagem", "Passadoria", "Lavagem e passadoria", "Remocao de manchas"]),
        new("Cortina pequena", "Tapetes e cortinas", 45, ["Lavagem", "Higienizacao", "Passadoria"]), new("Cortina grande", "Tapetes e cortinas", 75, ["Lavagem", "Higienizacao", "Passadoria"]),
        new("Tapete pequeno", "Tapetes e cortinas", 45, ["Higienizacao", "Impermeabilizacao", "Remocao de manchas", "Desodorizacao"]),
        new("Tapete medio", "Tapetes e cortinas", 75, ["Higienizacao", "Impermeabilizacao", "Remocao de manchas", "Desodorizacao"]),
        new("Tapete grande", "Tapetes e cortinas", 120, ["Higienizacao", "Impermeabilizacao", "Remocao de manchas", "Desodorizacao"]),
        new("Sofa de um lugar", "Estofados", 90, ["Higienizacao", "Impermeabilizacao", "Remocao de manchas", "Desodorizacao"]),
        new("Sofa de dois lugares", "Estofados", 150, ["Higienizacao", "Impermeabilizacao", "Remocao de manchas", "Desodorizacao"]),
        new("Sofa de tres lugares", "Estofados", 210, ["Higienizacao", "Impermeabilizacao", "Remocao de manchas", "Desodorizacao"]),
        new("Poltrona", "Estofados", 85, ["Higienizacao", "Impermeabilizacao", "Desodorizacao"]), new("Cadeira estofada", "Estofados", 35, ["Higienizacao", "Impermeabilizacao"]),
        new("Colchao solteiro", "Estofados", 120, ["Higienizacao", "Impermeabilizacao", "Desodorizacao"]), new("Colchao casal", "Estofados", 180, ["Higienizacao", "Impermeabilizacao", "Desodorizacao"]),
        new("Tenis", "Calcados", 45, ["Higienizacao", "Remocao de manchas", "Desodorizacao"]), new("Sapato", "Calcados", 35, ["Higienizacao", "Limpeza de couro", "Desodorizacao"]),
        new("Bota", "Calcados", 45, ["Higienizacao", "Limpeza de couro", "Desodorizacao"]), new("Bolsa", "Acessorios", 50, ["Higienizacao", "Lavagem delicada", "Limpeza de couro"]),
        new("Mala", "Acessorios", 65, ["Higienizacao", "Remocao de manchas", "Desodorizacao"]), new("Pelucia", "Infantil", 30, ["Lavagem delicada", "Higienizacao", "Desodorizacao"]),
        new("Carrinho de bebe", "Infantil", 100, ["Higienizacao", "Remocao de manchas", "Desodorizacao"]), new("Bebe conforto", "Infantil", 75, ["Higienizacao", "Remocao de manchas", "Desodorizacao"])
    ];

    private sealed record DefinicaoDeServico(string Nome, string Descricao);
    private sealed record DefinicaoDeArtigo(string Nome, string Categoria, decimal PrecoBase, string[] Servicos);
}

public sealed record ResultadoDaCargaInicial(int ArtigosCriados, int ServicosCriados, int OfertasCriadas);
public sealed record OfertaHistoricaDoEssence(Guid OfertaId, Guid ArtigoId, string NomeArtigo, Guid ServicoId, string NomeServico);
public sealed record DefinicaoDeProdutoSinteticoDoEssence(string Chave, string Nome, decimal ValorUnitarioReferencia);
public sealed record OfertaSinteticaDoEssence(
    string Chave,
    Guid OfertaId,
    Guid ArtigoId,
    string NomeArtigo,
    Guid ServicoId,
    string NomeServico,
    decimal PrecoUnitario);
