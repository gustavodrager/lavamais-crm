namespace LavaMais.Crm.BlocosDeConstrucao.Aplicacao.MovimentacoesComerciais;

public interface IConsultaDeClienteParaMovimentacao
{
    Task<ClienteDisponivelParaMovimentacao?> ObterAtivo(Guid id, CancellationToken cancellationToken);
}

public interface IConsultaDeCatalogoParaMovimentacao
{
    Task<ItemDeCatalogoDisponivelParaMovimentacao?> ObterServicoAtivo(Guid id, CancellationToken cancellationToken);
}

public sealed record ClienteDisponivelParaMovimentacao(Guid Id, string Nome);

public sealed record ItemDeCatalogoDisponivelParaMovimentacao(Guid Id, string Nome);
