namespace LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Roteiros;

public interface IConsultaDeClienteParaRoteiro
{
    Task<ClienteDisponivelParaRoteiro?> ObterAtivo(Guid id, CancellationToken ct);
}

public sealed record ClienteDisponivelParaRoteiro(Guid Id, string Nome, string Whatsapp, string EnderecoCompleto);
