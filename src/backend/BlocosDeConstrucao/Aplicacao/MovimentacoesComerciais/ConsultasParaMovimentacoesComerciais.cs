namespace LavaMais.Crm.BlocosDeConstrucao.Aplicacao.MovimentacoesComerciais;

public interface IConsultaDeClienteParaMovimentacao
{
    Task<ClienteDisponivelParaMovimentacao?> ObterAtivo(Guid id, CancellationToken cancellationToken);
}

public interface IConsultaDeCatalogoParaMovimentacao
{
    Task<OfertaDisponivelParaMovimentacao?> ObterOfertaAtiva(Guid id, CancellationToken cancellationToken);
    Task<OfertaDisponivelParaMovimentacao?> ObterOfertaParaImportacao(Guid id, CancellationToken cancellationToken);
}

public sealed record ClienteDisponivelParaMovimentacao(Guid Id, string Nome);

public sealed record OfertaDisponivelParaMovimentacao(
    Guid Id,
    Guid ArtigoId,
    string NomeArtigo,
    Guid ServicoId,
    string NomeServico,
    decimal PrecoUnitario);
