using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.Modulos.Catalogo.Dominio;
using LavaMais.Crm.Modulos.Catalogo.Infraestrutura;
using Microsoft.EntityFrameworkCore;

namespace LavaMais.Crm.Modulos.Catalogo.Aplicacao;

public sealed class GerenciadorDoCatalogoDeLavanderia(ContextoDeCatalogo banco, IContextoDoUsuario usuario, TimeProvider relogio)
{
    public Task<List<ArtigoDeLavanderia>> ListarArtigos(CancellationToken ct) => banco.ArtigosDeLavanderia.AsNoTracking().OrderBy(x => x.Categoria).ThenBy(x => x.Nome).ToListAsync(ct);
    public Task<List<ServicoDeLavanderia>> ListarServicos(CancellationToken ct) => banco.ServicosDeLavanderia.AsNoTracking().OrderBy(x => x.Nome).ToListAsync(ct);
    public Task<List<OfertaDeServico>> ListarOfertas(CancellationToken ct) => banco.OfertasDeServico.AsNoTracking().Include(x => x.Artigo).Include(x => x.Servico).OrderBy(x => x.Artigo.Categoria).ThenBy(x => x.Artigo.Nome).ThenBy(x => x.Servico.Nome).ToListAsync(ct);

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
