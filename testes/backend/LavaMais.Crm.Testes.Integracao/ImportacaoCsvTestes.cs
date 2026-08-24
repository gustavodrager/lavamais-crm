using System.Text;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.Modulos.Clientes.Aplicacao;
using LavaMais.Crm.Modulos.Clientes.Dominio;
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

    [Fact]
    [Trait("Categoria", "RequerDocker")]
    public async Task Deve_descartar_alteracoes_da_linha_rejeitada_e_continuar_importacao()
    {
        var ct = TestContext.Current.CancellationToken;
        var contexto = new Contexto(Guid.NewGuid());
        var opcoesClientes = new DbContextOptionsBuilder<ContextoDeClientes>().UseNpgsql(postgres.Conexao, p => p.MigrationsHistoryTable(ContextoDeClientes.TabelaDeHistoricoDasMigrations, ContextoDeClientes.Schema)).Options;
        var opcoesImportacoes = new DbContextOptionsBuilder<ContextoDeImportacoes>().UseNpgsql(postgres.Conexao, p => p.MigrationsHistoryTable(ContextoDeImportacoes.Historico, ContextoDeImportacoes.Schema)).Options;
        await using var bancoClientes = new ContextoDeClientes(opcoesClientes, contexto); await bancoClientes.Database.MigrateAsync(ct);
        await using var bancoImportacoes = new ContextoDeImportacoes(opcoesImportacoes, contexto); await bancoImportacoes.Database.MigrateAsync(ct);
        var gerenciadorClientes = new GerenciadorDeClientes(bancoClientes, contexto, TimeProvider.System);
        await gerenciadorClientes.Criar(new("Nome original", "13997776651", null, "Fisica", null, null, false, null, [], "CLI-1"), ct);
        var gerenciador = new GerenciadorDeImportacoes(bancoImportacoes, gerenciadorClientes, contexto, TimeProvider.System);
        var mapa = new MapeamentoCsv("nome", "whatsapp", "email", null, null, null, null, "codigoExterno");
        var emailInvalido = new string('a', 255) + "@teste.com";
        var csv = $"nome;whatsapp;email;codigoExterno\nNome indevido;13997776651;{emailInvalido};CLI-1\nCliente valido;13997776652;;CLI-2\n";
        await using var fluxo = new MemoryStream(Encoding.UTF8.GetBytes(csv));
        var previa = await gerenciador.PreVisualizar("clientes.csv", fluxo, fluxo.Length, mapa, ct);

        var resultado = await gerenciador.Confirmar(previa.ReferenciaArquivo, mapa, ct);

        bancoClientes.ChangeTracker.Clear();
        var clientes = await bancoClientes.Clientes.AsNoTracking().OrderBy(x => x.CodigoExterno).ToListAsync(ct);
        Assert.Equal(1, resultado.TotalInseridas); Assert.Equal(1, resultado.TotalRejeitadas);
        Assert.Equal("Nome original", clientes[0].Nome); Assert.Equal("Cliente valido", clientes[1].Nome);
    }

    [Fact]
    [Trait("Categoria", "RequerDocker")]
    public async Task Deve_isolar_o_rastreamento_entre_todas_as_linhas_da_importacao()
    {
        var ct = TestContext.Current.CancellationToken;
        var contexto = new Contexto(Guid.NewGuid());
        var opcoesClientes = new DbContextOptionsBuilder<ContextoDeClientes>().UseNpgsql(postgres.Conexao, p => p.MigrationsHistoryTable(ContextoDeClientes.TabelaDeHistoricoDasMigrations, ContextoDeClientes.Schema)).Options;
        var opcoesImportacoes = new DbContextOptionsBuilder<ContextoDeImportacoes>().UseNpgsql(postgres.Conexao, p => p.MigrationsHistoryTable(ContextoDeImportacoes.Historico, ContextoDeImportacoes.Schema)).Options;
        await using var bancoClientes = new ContextoDeClientes(opcoesClientes, contexto); await bancoClientes.Database.MigrateAsync(ct);
        await using var bancoImportacoes = new ContextoDeImportacoes(opcoesImportacoes, contexto); await bancoImportacoes.Database.MigrateAsync(ct);
        var gerenciadorClientes = new GerenciadorDeClientes(bancoClientes, contexto, TimeProvider.System);
        var gerenciador = new GerenciadorDeImportacoes(bancoImportacoes, gerenciadorClientes, contexto, TimeProvider.System);
        var mapa = new MapeamentoCsv("nome", "whatsapp", null, "bairro", "cidade", "tipo", "marketing", "codigoExterno");
        var csv = "nome;whatsapp;bairro;cidade;tipo;marketing;codigoExterno\nAna;13997776651;Centro;Santos;Fisica;true;CLI-1\nBia;13997776652;Forte;Praia Grande;Fisica;true;CLI-2\nCaio;13997776653;;;Fisica;true;CLI-3\n";
        await using var fluxo = new MemoryStream(Encoding.UTF8.GetBytes(csv));
        var previa = await gerenciador.PreVisualizar("clientes.csv", fluxo, fluxo.Length, mapa, ct);

        var resultado = await gerenciador.Confirmar(previa.ReferenciaArquivo, mapa, ct);

        Assert.Equal(3, resultado.TotalInseridas);
        Assert.Equal(0, resultado.TotalRejeitadas);
        Assert.Equal(3, await bancoClientes.Clientes.AsNoTracking().CountAsync(ct));
    }

    [Fact]
    [Trait("Categoria", "RequerDocker")]
    public async Task Deve_incluir_endereco_ao_atualizar_cliente_que_ainda_nao_possui_endereco()
    {
        var ct = TestContext.Current.CancellationToken;
        var contexto = new Contexto(Guid.NewGuid());
        var opcoesClientes = new DbContextOptionsBuilder<ContextoDeClientes>().UseNpgsql(postgres.Conexao, p => p.MigrationsHistoryTable(ContextoDeClientes.TabelaDeHistoricoDasMigrations, ContextoDeClientes.Schema)).Options;
        await using var bancoClientes = new ContextoDeClientes(opcoesClientes, contexto); await bancoClientes.Database.MigrateAsync(ct);
        var gerenciadorClientes = new GerenciadorDeClientes(bancoClientes, contexto, TimeProvider.System);
        var criado = await gerenciadorClientes.Criar(new("Ana", "13997776651", null, "Fisica", null, null, false, null, [], "CLI-1"), ct);
        gerenciadorClientes.DescartarAlteracoesPendentes();

        var resultado = await gerenciadorClientes.ImportarOuAtualizar(new("Ana", "13997776651", null, "Fisica", "ana@exemplo.com", null, true, new DadosDoEndereco(null, null, null, "Centro", "Santos", null, null), [], "CLI-1"), ct);

        gerenciadorClientes.DescartarAlteracoesPendentes();
        var cliente = await bancoClientes.Clientes.AsNoTracking().Include(x => x.Endereco).Include(x => x.Contatos).Include(x => x.Permissoes).SingleAsync(x => x.Id == criado.Id, ct);
        Assert.True(resultado.Atualizado);
        Assert.Equal("Centro", cliente.Endereco!.Bairro);
        Assert.Contains(cliente.Contatos, x => x.Tipo == TipoDeContato.Email && x.ValorNormalizado == "ana@exemplo.com");
        Assert.True(cliente.Permissoes.Single().Permitida);
    }

    private sealed class Contexto(Guid tenantId) : IContextoDoUsuario { public bool Autenticado => true; public Guid TenantId { get; } = tenantId; public string UsuarioIdentidadeId => "administrador-teste"; }
}
