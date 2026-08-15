using System.Text;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.Modulos.Clientes.Aplicacao;
using LavaMais.Crm.Modulos.Clientes.Infraestrutura;
using LavaMais.Crm.Modulos.Importacoes.Aplicacao;
using LavaMais.Crm.Modulos.Importacoes.Infraestrutura;
using Microsoft.EntityFrameworkCore;
using Testcontainers.PostgreSql;

namespace LavaMais.Crm.Testes.Integracao;

public sealed class ImportacaoCsvTestes
{
    [Fact]
    [Trait("Categoria", "RequerDocker")]
    public async Task Deve_pre_visualizar_confirmar_e_relatar_linhas_invalidas()
    {
        var ct = TestContext.Current.CancellationToken;
        await using var postgres = new PostgreSqlBuilder("postgres:17-alpine").WithDatabase("importacoes_testes").WithUsername("lavamais").WithPassword("senha_de_teste").Build();
        await postgres.StartAsync(ct);
        var contexto = new Contexto(Guid.NewGuid());
        var opcoesClientes = new DbContextOptionsBuilder<ContextoDeClientes>().UseNpgsql(postgres.GetConnectionString(), p => p.MigrationsHistoryTable(ContextoDeClientes.TabelaDeHistoricoDasMigrations, ContextoDeClientes.Schema)).Options;
        var opcoesImportacoes = new DbContextOptionsBuilder<ContextoDeImportacoes>().UseNpgsql(postgres.GetConnectionString(), p => p.MigrationsHistoryTable(ContextoDeImportacoes.Historico, ContextoDeImportacoes.Schema)).Options;
        await using var bancoClientes = new ContextoDeClientes(opcoesClientes, contexto); await bancoClientes.Database.MigrateAsync(ct);
        await using var bancoImportacoes = new ContextoDeImportacoes(opcoesImportacoes, contexto); await bancoImportacoes.Database.MigrateAsync(ct);
        var gerenciadorClientes = new GerenciadorDeClientes(bancoClientes, contexto, TimeProvider.System);
        var gerenciador = new GerenciadorDeImportacoes(bancoImportacoes, gerenciadorClientes, contexto, TimeProvider.System);
        var csv = "nome,whatsapp,bairro,marketing\nMaria,13997776655,Boqueirao,sim\nSem telefone,,Centro,nao\n";
        await using var fluxo = new MemoryStream(Encoding.UTF8.GetBytes(csv));
        var mapa = new MapeamentoCsv("nome", "whatsapp", null, "bairro", null, null, "marketing");

        var previa = await gerenciador.PreVisualizar("clientes.csv", fluxo, fluxo.Length, mapa, ct);
        await using var bancoConfirmacao = new ContextoDeImportacoes(opcoesImportacoes, contexto);
        var gerenciadorConfirmacao = new GerenciadorDeImportacoes(bancoConfirmacao, gerenciadorClientes, contexto, TimeProvider.System);
        var resultado = await gerenciadorConfirmacao.Confirmar(previa.ReferenciaArquivo, mapa, ct);

        Assert.Equal(2, previa.TotalLinhas); Assert.Equal(1, resultado.TotalInseridas); Assert.Equal(1, resultado.TotalRejeitadas);
        Assert.Single(await bancoClientes.Clientes.AsNoTracking().ToListAsync(ct));
    }

    [Fact]
    public async Task Deve_ler_campo_com_virgula_e_aspas()
    {
        await using var fluxo = new MemoryStream(Encoding.UTF8.GetBytes("nome,whatsapp\n\"Silva, Maria\",13997776655\n"));
        var linhas = await LeitorDeCsv.Ler(fluxo, TestContext.Current.CancellationToken);
        Assert.Equal("Silva, Maria", linhas[1][0]);
    }

    private sealed class Contexto(Guid tenantId) : IContextoDoUsuario { public bool Autenticado => true; public Guid TenantId { get; } = tenantId; public string UsuarioIdentidadeId => "administrador-teste"; }
}
