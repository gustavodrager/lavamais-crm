using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;

namespace LavaMais.Crm.Modulos.ModelosDeMensagem.Dominio;

public enum CanalDeMensagem { Whatsapp = 1 }
public enum SituacaoDoModelo { Rascunho = 1, Publicado = 2, Inativo = 3 }

public sealed class ModeloDeMensagem
{
    private ModeloDeMensagem() { }
    private ModeloDeMensagem(Guid tenantId, string nome, DateTimeOffset agora)
    {
        Id = Guid.NewGuid(); TenantId = tenantId; Nome = ValidarNome(nome); NomeNormalizado = Nome.ToUpperInvariant();
        Canal = CanalDeMensagem.Whatsapp; Situacao = SituacaoDoModelo.Rascunho; DataCriacao = agora; DataAtualizacao = agora;
    }

    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public string Nome { get; private set; } = string.Empty;
    public string NomeNormalizado { get; private set; } = string.Empty;
    public CanalDeMensagem Canal { get; private set; }
    public SituacaoDoModelo Situacao { get; private set; }
    public Guid? VersaoAtualId { get; private set; }
    public DateTimeOffset DataCriacao { get; private set; }
    public DateTimeOffset DataAtualizacao { get; private set; }
    public uint Versao { get; private set; }
    public ICollection<VersaoDoModelo> Versoes { get; private set; } = new List<VersaoDoModelo>();

    public static ModeloDeMensagem Criar(Guid tenantId, string nome, DateTimeOffset agora)
    {
        if (tenantId == Guid.Empty) throw new ExcecaoDeRegraDeNegocio("tenant_invalido", "O tenant e obrigatorio.");
        return new(tenantId, nome, agora);
    }

    public VersaoDoModelo Publicar(string conteudoPreVisualizacao, IReadOnlyCollection<string>? variaveis, DateTimeOffset agora)
    {
        if (Situacao == SituacaoDoModelo.Inativo) throw new ExcecaoDeRegraDeNegocio("modelo_inativo", "Um modelo inativo nao pode ser publicado.");
        if (string.IsNullOrWhiteSpace(conteudoPreVisualizacao)) throw new ExcecaoDeRegraDeNegocio("conteudo_obrigatorio", "O conteudo de pre-visualizacao e obrigatorio.");
        var nomes = (variaveis ?? []).Where(x => x is not null).Select(x => x.Trim()).Where(x => x.Length > 0).Distinct(StringComparer.OrdinalIgnoreCase).ToArray();
        if (nomes.Any(x => x is not ("nomeCliente" or "itemCatalogo"))) throw new ExcecaoDeRegraDeNegocio("variavel_invalida", "O modelo possui uma variavel nao permitida.");
        var versao = new VersaoDoModelo(TenantId, Id, Versoes.Count + 1, conteudoPreVisualizacao.Trim(), nomes, agora);
        Versoes.Add(versao); VersaoAtualId = versao.Id; Situacao = SituacaoDoModelo.Publicado; DataAtualizacao = agora; return versao;
    }

    private static string ValidarNome(string nome) => string.IsNullOrWhiteSpace(nome) ? throw new ExcecaoDeRegraDeNegocio("nome_obrigatorio", "O nome do modelo e obrigatorio.") : nome.Trim();
}

public sealed class VersaoDoModelo
{
    private VersaoDoModelo() { }
    internal VersaoDoModelo(Guid tenantId, Guid modeloId, int numero, string conteudo, string[] variaveis, DateTimeOffset agora)
    { Id = Guid.NewGuid(); TenantId = tenantId; ModeloId = modeloId; Numero = numero; ConteudoPreVisualizacao = conteudo; Variaveis = variaveis; DataPublicacao = agora; }
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public Guid ModeloId { get; private set; }
    public int Numero { get; private set; }
    public string ConteudoPreVisualizacao { get; private set; } = string.Empty;
    public string[] Variaveis { get; private set; } = [];
    public DateTimeOffset DataPublicacao { get; private set; }
}
