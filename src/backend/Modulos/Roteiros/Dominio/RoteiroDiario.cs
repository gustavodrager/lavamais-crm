using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;

namespace LavaMais.Crm.Modulos.Roteiros.Dominio;

public enum SituacaoDoRoteiro { EmPreparacao = 1, Publicado = 2, EmAndamento = 3, Finalizado = 4 }
public enum TipoDaParada { Coleta = 1, Entrega = 2 }
public enum SituacaoDaParada { Pendente = 1, EmDeslocamento = 2, Concluida = 3, NaoRealizada = 4 }

public sealed class RoteiroDiario
{
    private readonly List<ParadaDoRoteiro> _paradas = [];
    private RoteiroDiario() { }
    private RoteiroDiario(Guid tenantId, DateOnly data, string motorista, DateTimeOffset agora)
    {
        if (tenantId == Guid.Empty) throw new ExcecaoDeRegraDeNegocio("tenant_invalido", "O tenant e obrigatorio.");
        Id = Guid.NewGuid(); TenantId = tenantId; Data = data; NomeMotorista = Limpar(motorista, 120, "motorista_invalido"); Situacao = SituacaoDoRoteiro.EmPreparacao; DataCriacao = DataAtualizacao = agora;
    }
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public DateOnly Data { get; private set; }
    public string NomeMotorista { get; private set; } = string.Empty;
    public SituacaoDoRoteiro Situacao { get; private set; }
    public DateTimeOffset DataCriacao { get; private set; }
    public DateTimeOffset DataAtualizacao { get; private set; }
    public uint Versao { get; private set; }
    public IReadOnlyCollection<ParadaDoRoteiro> Paradas => _paradas;
    public static RoteiroDiario Criar(Guid tenantId, DateOnly data, string motorista, DateTimeOffset agora) => new(tenantId, data, motorista, agora);
    public ParadaDoRoteiro Adicionar(Guid clienteId, string nome, string whatsapp, string endereco, TipoDaParada tipo, string periodo, string? observacao, DateTimeOffset agora)
    {
        if (Situacao != SituacaoDoRoteiro.EmPreparacao) throw new ExcecaoDeConflito("roteiro_publicado", "Nao e possivel adicionar paradas depois da publicacao.");
        if (_paradas.Any(x => x.ClienteId == clienteId && x.Tipo == tipo && x.Situacao == SituacaoDaParada.Pendente)) throw new ExcecaoDeConflito("parada_duplicada", "Este cliente ja possui uma parada pendente deste tipo.");
        var parada = ParadaDoRoteiro.Criar(TenantId, Id, clienteId, nome, whatsapp, endereco, tipo, periodo, observacao, _paradas.Count + 1, agora); _paradas.Add(parada); DataAtualizacao = agora; return parada;
    }
    public void Reordenar(IReadOnlyList<Guid> ids, DateTimeOffset agora)
    {
        if (Situacao != SituacaoDoRoteiro.EmPreparacao) throw new ExcecaoDeConflito("roteiro_publicado", "Nao e possivel reordenar depois da publicacao.");
        if (ids.Count != _paradas.Count || ids.Distinct().Count() != ids.Count || ids.Any(id => _paradas.All(x => x.Id != id))) throw new ExcecaoDeRegraDeNegocio("ordem_invalida", "A ordem deve conter todas as paradas uma unica vez.");
        for (var i = 0; i < ids.Count; i++) _paradas.Single(x => x.Id == ids[i]).DefinirOrdem(i + 1); DataAtualizacao = agora;
    }
    public void AtualizarParada(Guid paradaId, TipoDaParada tipo, string periodo, string? observacao, DateTimeOffset agora)
    {
        if (Situacao != SituacaoDoRoteiro.EmPreparacao) throw new ExcecaoDeConflito("roteiro_publicado", "Nao e possivel editar depois da publicacao.");
        var parada = _paradas.SingleOrDefault(x => x.Id == paradaId) ?? throw new ExcecaoDeRecursoNaoEncontrado("Parada nao encontrada.");
        if (_paradas.Any(x => x.Id != paradaId && x.ClienteId == parada.ClienteId && x.Tipo == tipo && x.Situacao == SituacaoDaParada.Pendente)) throw new ExcecaoDeConflito("parada_duplicada", "Este cliente ja possui uma parada pendente deste tipo.");
        parada.Atualizar(tipo, periodo, observacao); DataAtualizacao = agora;
    }
    public void RemoverParada(Guid paradaId, DateTimeOffset agora)
    {
        if (Situacao != SituacaoDoRoteiro.EmPreparacao) throw new ExcecaoDeConflito("roteiro_publicado", "Nao e possivel remover depois da publicacao.");
        var parada = _paradas.SingleOrDefault(x => x.Id == paradaId) ?? throw new ExcecaoDeRecursoNaoEncontrado("Parada nao encontrada.");
        _paradas.Remove(parada);
        for (var i = 0; i < _paradas.Count; i++) _paradas[i].DefinirOrdem(i + 1);
        DataAtualizacao = agora;
    }
    public void Publicar(DateTimeOffset agora) { if (_paradas.Count == 0) throw new ExcecaoDeRegraDeNegocio("roteiro_vazio", "Inclua ao menos uma parada antes de publicar."); if (Situacao != SituacaoDoRoteiro.EmPreparacao) throw new ExcecaoDeConflito("roteiro_ja_publicado", "O roteiro ja foi publicado."); Situacao = SituacaoDoRoteiro.Publicado; DataAtualizacao = agora; }
    public void AtualizarSituacao(DateTimeOffset agora) { if (_paradas.Count > 0 && _paradas.All(x => x.Situacao is SituacaoDaParada.Concluida or SituacaoDaParada.NaoRealizada)) Situacao = SituacaoDoRoteiro.Finalizado; else if (_paradas.Any(x => x.Situacao != SituacaoDaParada.Pendente)) Situacao = SituacaoDoRoteiro.EmAndamento; DataAtualizacao = agora; }
    private static string Limpar(string? valor, int limite, string codigo) { var x = valor?.Trim(); if (string.IsNullOrWhiteSpace(x) || x.Length > limite) throw new ExcecaoDeRegraDeNegocio(codigo, $"O valor deve possuir entre 1 e {limite} caracteres."); return x; }
}

public sealed class ParadaDoRoteiro
{
    private ParadaDoRoteiro() { }
    public Guid Id { get; private set; } public Guid TenantId { get; private set; } public Guid RoteiroId { get; private set; } public Guid ClienteId { get; private set; }
    public string NomeCliente { get; private set; } = string.Empty; public string Whatsapp { get; private set; } = string.Empty; public string EnderecoCompleto { get; private set; } = string.Empty;
    public TipoDaParada Tipo { get; private set; } public string Periodo { get; private set; } = string.Empty; public string? Observacao { get; private set; } public int Ordem { get; private set; }
    public SituacaoDaParada Situacao { get; private set; } public DateTimeOffset DataCriacao { get; private set; } public DateTimeOffset? DataInicio { get; private set; } public DateTimeOffset? DataConclusao { get; private set; } public string? MotivoNaoRealizacao { get; private set; }
    internal static ParadaDoRoteiro Criar(Guid tenant, Guid roteiro, Guid cliente, string nome, string whatsapp, string endereco, TipoDaParada tipo, string periodo, string? observacao, int ordem, DateTimeOffset agora) => new() { Id = Guid.NewGuid(), TenantId = tenant, RoteiroId = roteiro, ClienteId = cliente, NomeCliente = Limpar(nome, 200), Whatsapp = Limpar(whatsapp, 30), EnderecoCompleto = Limpar(endereco, 500), Tipo = tipo, Periodo = Limpar(periodo, 80), Observacao = Opcional(observacao, 500), Ordem = ordem, Situacao = SituacaoDaParada.Pendente, DataCriacao = agora };
    internal void DefinirOrdem(int ordem) => Ordem = ordem;
    internal void Atualizar(TipoDaParada tipo, string periodo, string? observacao) { Tipo = tipo; Periodo = Limpar(periodo, 80); Observacao = Opcional(observacao, 500); }
    public void Iniciar(DateTimeOffset agora) { if (Situacao != SituacaoDaParada.Pendente) throw new ExcecaoDeConflito("parada_indisponivel", "A parada nao esta pendente."); Situacao = SituacaoDaParada.EmDeslocamento; DataInicio = agora; }
    public void Concluir(DateTimeOffset agora) { if (Situacao is not (SituacaoDaParada.Pendente or SituacaoDaParada.EmDeslocamento)) throw new ExcecaoDeConflito("parada_indisponivel", "A parada nao pode ser concluida."); Situacao = SituacaoDaParada.Concluida; DataConclusao = agora; }
    public void NaoRealizar(string motivo, DateTimeOffset agora) { if (Situacao is not (SituacaoDaParada.Pendente or SituacaoDaParada.EmDeslocamento)) throw new ExcecaoDeConflito("parada_indisponivel", "A parada nao pode ser alterada."); MotivoNaoRealizacao = Limpar(motivo, 300); Situacao = SituacaoDaParada.NaoRealizada; DataConclusao = agora; }
    private static string Limpar(string? x, int limite) { var v = x?.Trim(); if (string.IsNullOrWhiteSpace(v) || v.Length > limite) throw new ExcecaoDeRegraDeNegocio("dado_parada_invalido", $"O valor deve possuir entre 1 e {limite} caracteres."); return v; }
    private static string? Opcional(string? x, int limite) { var v = string.IsNullOrWhiteSpace(x) ? null : x.Trim(); if (v?.Length > limite) throw new ExcecaoDeRegraDeNegocio("dado_parada_invalido", $"O valor deve possuir ate {limite} caracteres."); return v; }
}
