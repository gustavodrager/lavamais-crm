using LavaMais.Crm.ImportadorEssence;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Auditoria;
using Microsoft.Extensions.DependencyInjection;

namespace LavaMais.Crm.Testes.Unidade;

public sealed class ExecutorDaCargaTestes
{
    [Fact]
    public void ProvedorDaCargaConfirmadaIncluiAuditoria()
    {
        var opcoes = new OpcoesDaCarga(
            OperacaoDaCarga.CargaHistorica,
            AmbienteDaCarga.Homologacao,
            Guid.NewGuid(),
            "clientes.csv",
            "movimentacoes.csv",
            "produtos.csv",
            "relatorio.json",
            true,
            false);

        using var provedor = ExecutorDaCarga.CriarProvedor(opcoes);
        using var escopo = provedor.CreateScope();

        Assert.NotNull(escopo.ServiceProvider.GetRequiredService<IRegistradorDeAuditoria>());
    }

    [Fact]
    public void ProducaoExigeConfirmacaoLiteral()
    {
        var excecao = Assert.Throws<ArgumentException>(() => OpcoesDaCarga.Interpretar([
            "--ambiente", "Producao",
            "--tenant-id", Guid.NewGuid().ToString(),
            "--clientes", "inexistente.csv",
            "--movimentacoes", "inexistente.csv",
            "--produtos", "inexistente.csv",
            "--relatorio", "relatorio.json"
        ]));

        Assert.Contains("--confirmar-producao", excecao.Message);
    }
}
