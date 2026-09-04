namespace LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Clientes;

public interface IConsultaDeMovimentacoesParaClientes
{
    Task<IReadOnlyCollection<Guid>> ListarClienteIdsComMovimentacao(CancellationToken cancellationToken);
}
