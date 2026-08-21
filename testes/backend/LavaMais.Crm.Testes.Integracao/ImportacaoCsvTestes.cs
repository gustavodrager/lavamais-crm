using System.Text;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.Modulos.Clientes.Aplicacao;
using LavaMais.Crm.Modulos.Clientes.Infraestrutura;
using LavaMais.Crm.Modulos.Importacoes.Aplicacao;
using LavaMais.Crm.Modulos.Importacoes.Infraestrutura;
using Microsoft.EntityFrameworkCore;

namespace LavaMais.Crm.Testes.Integracao;

public sealed class ImportacaoCsvTestes(PostgresCompartilhado postgres)
{
    [Fact]
    [Trait("Categoria", "RequerDocker")]
    public async Task Deve_pre_visualizar_confirmar_e_relatar_linhas_invalidas()
    {
        var ct = TestContext.Current.CancellationToken;
        var contexto = new Contexto(Guid.NewGuid());
        var opcoesClientes = new DbContextOptionsBuilder<ContextoDeClientes>().UseNpgsql(postgres.Conexao, p => p.MigrationsHistoryTable(ContextoDeClientes.TabelaDeHistoricoDasMigrations, ContextoDeClientes.Schema)).Options;
        var opcoesImportacoes = new DbContextOptionsBuilder<ContextoDeImportacoes>().UseNpgsql(postgres.Conexao, p => p.MigrationsHistoryTable(ContextoDeImportacoes.Historico, ContextoDeImportacoes.Schema)).Options;
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
        Assert.Empty(resultado.ConteudoArquivo);
        Assert.Single(await bancoClientes.Clientes.AsNoTracking().ToListAsync(ct));
    }

    [Fact]
    public async Task Deve_ler_campo_com_virgula_e_aspas()
    {
        await using var fluxo = new MemoryStream(Encoding.UTF8.GetBytes("nome,whatsapp\n\"Silva, Maria\",13997776655\n"));
        var linhas = await LeitorDeCsv.Ler(fluxo, TestContext.Current.CancellationToken);
        Assert.Equal("Silva, Maria", linhas[1][0]);
    }

    [Fact]
    public async Task Deve_ler_csv_com_ponto_e_virgula()
    {
        await using var fluxo = new MemoryStream(Encoding.UTF8.GetBytes("nome;whatsapp\nMaria;999776655\n"));
        var linhas = await LeitorDeCsv.Ler(fluxo, TestContext.Current.CancellationToken);
        Assert.Equal(["nome", "whatsapp"], linhas[0]);
        Assert.Equal("999776655", linhas[1][1]);
    }

    [Fact]
    [Trait("Categoria", "RequerDocker")]
    public async Task Deve_atualizar_cliente_por_codigo_externo_e_preservar_dados_de_origem()
    {
        var ct = TestContext.Current.CancellationToken;
        var contexto = new Contexto(Guid.NewGuid());
        var opcoesClientes = new DbContextOptionsBuilder<ContextoDeClientes>().UseNpgsql(postgres.Conexao, p => p.MigrationsHistoryTable(ContextoDeClientes.TabelaDeHistoricoDasMigrations, ContextoDeClientes.Schema)).Options;
        var opcoesImportacoes = new DbContextOptionsBuilder<ContextoDeImportacoes>().UseNpgsql(postgres.Conexao, p => p.MigrationsHistoryTable(ContextoDeImportacoes.Historico, ContextoDeImportacoes.Schema)).Options;
        await using var bancoClientes = new ContextoDeClientes(opcoesClientes, contexto); await bancoClientes.Database.MigrateAsync(ct);
        await using var bancoImportacoes = new ContextoDeImportacoes(opcoesImportacoes, contexto); await bancoImportacoes.Database.MigrateAsync(ct);
        var gerenciadorClientes = new GerenciadorDeClientes(bancoClientes, contexto, TimeProvider.System);
        var gerenciador = new GerenciadorDeImportacoes(bancoImportacoes, gerenciadorClientes, contexto, TimeProvider.System);
        var mapa = new MapeamentoCsv("nome", "whatsapp", null, null, null, null, null, "codigoExterno", "dataCadastroOrigem", 13, true);

        var primeira = "nome;whatsapp;codigoExterno;dataCadastroOrigem\nMaria;999776655;CLI-1;14/08/2026\n";
        await using var fluxoPrimeiro = new MemoryStream(Encoding.UTF8.GetBytes(primeira));
        var previaPrimeira = await gerenciador.PreVisualizar("clientes.csv", fluxoPrimeiro, fluxoPrimeiro.Length, mapa, ct);
        var resultadoPrimeiro = await gerenciador.Confirmar(previaPrimeira.ReferenciaArquivo, mapa, ct);

        var segunda = "nome,whatsapp,codigoExterno,dataCadastroOrigem\nMaria Atualizada,999776655,CLI-1,14/08/2026\n";
        await using var fluxoSegundo = new MemoryStream(Encoding.UTF8.GetBytes(segunda));
        var previaSegunda = await gerenciador.PreVisualizar("clientes.csv", fluxoSegundo, fluxoSegundo.Length, mapa, ct);
        var resultadoSegundo = await gerenciador.Confirmar(previaSegunda.ReferenciaArquivo, mapa, ct);

        bancoClientes.ChangeTracker.Clear();
        var cliente = await bancoClientes.Clientes.AsNoTracking().SingleAsync(ct);
        Assert.Equal(1, resultadoPrimeiro.TotalInseridas);
        Assert.Equal(1, resultadoSegundo.TotalAtualizadas);
        Assert.Equal("Maria Atualizada", cliente.Nome); Assert.Equal("CLI-1", cliente.CodigoExterno);
        Assert.Equal(new DateTimeOffset(2026, 8, 14, 0, 0, 0, TimeSpan.Zero), cliente.DataCadastroOrigem);
    }

    private sealed class Contexto(Guid tenantId) : IContextoDoUsuario { public bool Autenticado => true; public Guid TenantId { get; } = tenantId; public string UsuarioIdentidadeId => "administrador-teste"; }
}
