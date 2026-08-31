namespace LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Integracoes;

public enum ServicoDeNotificacao
{
    Local = 1,
    Central = 2
}

public enum SituacaoTecnicaDaNotificacao
{
    Pendente = 1,
    Processando = 2,
    Enviada = 3,
    Entregue = 4,
    Lida = 5,
    Falhou = 6
}

public sealed record SolicitacaoDeNotificacao(
    string Canal,
    string ChaveModelo,
    string ChaveIdempotencia,
    string NomeDestinatario,
    string TelefoneDestinatario,
    string Conteudo,
    IReadOnlyDictionary<string, string> Parametros);

public sealed record ReferenciaDeNotificacao(ServicoDeNotificacao Servico, string Id);

public sealed record EstadoConsolidadoDaNotificacao(
    SituacaoTecnicaDaNotificacao Situacao,
    string? CodigoFalha = null);

public interface IDisponibilidadeDeNotificacoes
{
    bool Habilitado { get; }
}
