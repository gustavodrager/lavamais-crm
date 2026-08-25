using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;

namespace LavaMais.Crm.Modulos.MovimentacoesComerciais.Dominio;

public enum OrigemDaMovimentacao { Recepcao = 1, ImportacaoEssence = 2, IntegracaoEssence = 3 }
public enum SituacaoDaMovimentacao { Registrada = 1, Cancelada = 2 }

public sealed class MovimentacaoComercial
{
    private MovimentacaoComercial() { }
    private MovimentacaoComercial(Guid tenantId, Guid clienteId, string nomeCliente, Guid itemId, string nomeItem, decimal valorTotal, DateTimeOffset dataMovimentacao, string? codigoExterno, string? observacao, OrigemDaMovimentacao origem, string usuarioId, DateTimeOffset agora)
    {
        if (tenantId == Guid.Empty) throw new ExcecaoDeRegraDeNegocio("tenant_invalido", "O tenant e obrigatorio.");
        if (clienteId == Guid.Empty) throw new ExcecaoDeRegraDeNegocio("cliente_invalido", "O cliente e obrigatorio.");
        if (itemId == Guid.Empty) throw new ExcecaoDeRegraDeNegocio("servico_invalido", "O servico e obrigatorio.");
        if (valorTotal < 0) throw new ExcecaoDeRegraDeNegocio("valor_invalido", "O valor total nao pode ser negativo.");
        if (!Enum.IsDefined(origem)) throw new ExcecaoDeRegraDeNegocio("origem_invalida", "A origem da movimentacao e invalida.");
        Id = Guid.NewGuid(); TenantId = tenantId; ClienteId = clienteId; NomeClienteSnapshot = LimparObrigatorio(nomeCliente, 200, "nome_cliente_invalido");
        ItemDeCatalogoId = itemId; NomeItemSnapshot = LimparObrigatorio(nomeItem, 160, "nome_servico_invalido"); ValorTotal = valorTotal;
        DataMovimentacao = dataMovimentacao.ToUniversalTime(); CodigoExterno = Limpar(codigoExterno, 100, "codigo_externo_invalido"); Observacao = Limpar(observacao, 500, "observacao_invalida");
        Origem = origem; Situacao = SituacaoDaMovimentacao.Registrada; UsuarioRegistroId = LimparObrigatorio(usuarioId, 200, "usuario_invalido"); DataCriacao = agora;
    }

    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public Guid ClienteId { get; private set; }
    public string NomeClienteSnapshot { get; private set; } = string.Empty;
    public Guid ItemDeCatalogoId { get; private set; }
    public string NomeItemSnapshot { get; private set; } = string.Empty;
    public decimal ValorTotal { get; private set; }
    public DateTimeOffset DataMovimentacao { get; private set; }
    public string? CodigoExterno { get; private set; }
    public string? Observacao { get; private set; }
    public OrigemDaMovimentacao Origem { get; private set; }
    public SituacaoDaMovimentacao Situacao { get; private set; }
    public string UsuarioRegistroId { get; private set; } = string.Empty;
    public DateTimeOffset DataCriacao { get; private set; }
    public string? UsuarioCancelamentoId { get; private set; }
    public DateTimeOffset? DataCancelamento { get; private set; }
    public string? MotivoCancelamento { get; private set; }
    public uint Versao { get; private set; }

    public static MovimentacaoComercial Registrar(Guid tenantId, Guid clienteId, string nomeCliente, Guid itemId, string nomeItem, decimal valorTotal, DateTimeOffset dataMovimentacao, string? codigoExterno, string? observacao, OrigemDaMovimentacao origem, string usuarioId, DateTimeOffset agora) =>
        new(tenantId, clienteId, nomeCliente, itemId, nomeItem, valorTotal, dataMovimentacao, codigoExterno, observacao, origem, usuarioId, agora);

    public void Cancelar(string motivo, string usuarioId, DateTimeOffset agora)
    {
        if (Situacao == SituacaoDaMovimentacao.Cancelada) throw new ExcecaoDeConflito("movimentacao_ja_cancelada", "A movimentacao ja esta cancelada.");
        MotivoCancelamento = LimparObrigatorio(motivo, 300, "motivo_cancelamento_invalido"); UsuarioCancelamentoId = LimparObrigatorio(usuarioId, 200, "usuario_invalido"); DataCancelamento = agora; Situacao = SituacaoDaMovimentacao.Cancelada;
    }

    private static string LimparObrigatorio(string? valor, int limite, string codigo) => Limpar(valor, limite, codigo) ?? throw new ExcecaoDeRegraDeNegocio(codigo, "O valor e obrigatorio.");
    private static string? Limpar(string? valor, int limite, string codigo) { var limpo = string.IsNullOrWhiteSpace(valor) ? null : valor.Trim(); if (limpo?.Length > limite) throw new ExcecaoDeRegraDeNegocio(codigo, $"O valor deve possuir ate {limite} caracteres."); return limpo; }
}
