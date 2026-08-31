using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using LavaMais.Crm.Modulos.Catalogo.Api;
using LavaMais.Crm.Modulos.Catalogo.Aplicacao;
using LavaMais.Crm.Modulos.Catalogo.Dominio;
using LavaMais.Crm.Modulos.Catalogo.Infraestrutura;
using LavaMais.Crm.Modulos.Clientes.Api;
using LavaMais.Crm.Modulos.Clientes.Aplicacao;
using LavaMais.Crm.Modulos.Clientes.Infraestrutura;
using LavaMais.Crm.Modulos.MovimentacoesComerciais.Api;
using LavaMais.Crm.Modulos.MovimentacoesComerciais.Aplicacao;
using LavaMais.Crm.Modulos.MovimentacoesComerciais.Infraestrutura;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace LavaMais.Crm.ImportadorEssence;

internal static class ExecutorDaCarga
{
    private static readonly CultureInfo CulturaBrasileira = new("pt-BR");

    public static async Task<int> Executar(string[] argumentos, CancellationToken ct)
    {
        OpcoesDaCarga opcoes;
        DadosDaCarga dados;
        try
        {
            opcoes = OpcoesDaCarga.Interpretar(argumentos);
            dados = await LeituraDaCarga.Ler(opcoes, ct);
            ValidarBloqueioDeProducao();
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine(ex.Message);
            Console.Error.WriteLine(OpcoesDaCarga.Ajuda);
            return 1;
        }

        var relatorio = CriarRelatorio(opcoes, dados);
        if (!opcoes.Confirmar)
        {
            PrepararSimulacao(opcoes.Operacao, dados, relatorio);
            relatorio.DataFim = DateTimeOffset.UtcNow;
            await SalvarRelatorio(opcoes.ArquivoRelatorio, relatorio, ct);
            ExibirResumo(relatorio);
            Console.WriteLine("Simulacao concluida sem alterar o banco. Use --confirmar somente apos revisar o relatorio.");
            return 0;
        }

        try
        {
            using var provedor = CriarProvedor(opcoes);
            using var escopo = provedor.CreateScope();
            await ValidarBanco(escopo.ServiceProvider, ct);
            await ExecutarOperacao(escopo.ServiceProvider, opcoes.Operacao, dados, relatorio, ct);
        }
        catch (Exception ex)
        {
            relatorio.Erros.Add(new("fatal", 0, "carga", ex.Message));
        }

        relatorio.DataFim = DateTimeOffset.UtcNow;
        await SalvarRelatorio(opcoes.ArquivoRelatorio, relatorio, ct);
        ExibirResumo(relatorio);
        return relatorio.Erros.Count == 0 ? 0 : 2;
    }

    private static ServiceProvider CriarProvedor(OpcoesDaCarga opcoes)
    {
        var conexao = ConfiguracaoPostgres.ObterStringDeConexaoParaFerramentas();
        var configuracao = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            [$"ConnectionStrings:{ConfiguracaoPostgres.NomeDaConexao}"] = conexao
        }).Build();
        var servicos = new ServiceCollection();
        servicos.AddSingleton<IContextoDoUsuario>(new ContextoDoImportador(opcoes.TenantId, opcoes.Ambiente));
        servicos.AddSingleton(TimeProvider.System);
        servicos.AdicionarModuloClientes(configuracao);
        servicos.AdicionarModuloCatalogo(configuracao);
        servicos.AdicionarModuloMovimentacoesComerciais(configuracao);
        return servicos.BuildServiceProvider(new ServiceProviderOptions { ValidateOnBuild = true, ValidateScopes = true });
    }

    private static async Task ValidarBanco(IServiceProvider servicos, CancellationToken ct)
    {
        var contextos = new DbContext[]
        {
            servicos.GetRequiredService<ContextoDeClientes>(),
            servicos.GetRequiredService<ContextoDeCatalogo>(),
            servicos.GetRequiredService<ContextoDeMovimentacoesComerciais>()
        };
        foreach (var contexto in contextos)
        {
            if (!await contexto.Database.CanConnectAsync(ct))
                throw new InvalidOperationException("Nao foi possivel conectar ao PostgreSQL configurado.");
            var pendentes = (await contexto.Database.GetPendingMigrationsAsync(ct)).ToArray();
            if (pendentes.Length > 0)
                throw new InvalidOperationException($"O banco possui migrations pendentes para {contexto.GetType().Name}: {string.Join(", ", pendentes)}");
        }
    }

    private static Task ExecutarOperacao(
        IServiceProvider servicos,
        OperacaoDaCarga operacao,
        DadosDaCarga dados,
        RelatorioDaCarga relatorio,
        CancellationToken ct) => operacao switch
        {
            OperacaoDaCarga.CargaHistorica => CarregarHistorico(servicos, dados, relatorio, ct),
            OperacaoDaCarga.ComposicaoSintetica => AplicarComposicaoSintetica(servicos, dados, relatorio, ct),
            OperacaoDaCarga.ReversaoComposicaoSintetica => ReverterComposicaoSintetica(servicos, dados, relatorio, ct),
            _ => throw new ArgumentOutOfRangeException(nameof(operacao), operacao, "Operacao de carga desconhecida.")
        };

    private static async Task CarregarHistorico(
        IServiceProvider servicos,
        DadosDaCarga dados,
        RelatorioDaCarga relatorio,
        CancellationToken ct)
    {
        var clientes = servicos.GetRequiredService<GerenciadorDeClientes>();
        var catalogo = servicos.GetRequiredService<GerenciadorDeCatalogo>();
        var catalogoLavanderia = servicos.GetRequiredService<GerenciadorDoCatalogoDeLavanderia>();
        var movimentacoes = servicos.GetRequiredService<GerenciadorDeMovimentacoesComerciais>();
        var clientesCarregados = new Dictionary<string, Guid>(StringComparer.OrdinalIgnoreCase);

        foreach (var entrada in dados.Clientes)
        {
            try
            {
                var resultado = await clientes.ImportarDadosBasicosDaOrigem(
                    new(entrada.CodigoExterno, entrada.Nome, entrada.Whatsapp),
                    ct);
                clientesCarregados[entrada.CodigoExterno] = resultado.Cliente.Id;
                if (resultado.Atualizado) relatorio.Clientes.Atualizados++;
                else relatorio.Clientes.Inseridos++;
            }
            catch (Exception ex)
            {
                relatorio.Clientes.Rejeitados++;
                relatorio.Erros.Add(new("cliente", entrada.Linha, entrada.CodigoExterno, ex.Message));
            }
            finally
            {
                clientes.DescartarAlteracoesPendentes();
            }
        }

        var ofertaHistorica = await catalogoLavanderia.ObterOuCriarOfertaHistoricaDoEssence(ct);
        catalogo.DescartarAlteracoesPendentes();

        foreach (var entrada in dados.Movimentacoes)
        {
            if (!clientesCarregados.TryGetValue(entrada.CodigoCliente, out var clienteId))
            {
                relatorio.Movimentacoes.SemClienteCarregado++;
                relatorio.Movimentacoes.ValorSemClienteCarregado += entrada.Total;
                relatorio.Pendencias.Add(new("movimentacao_sem_cliente", entrada.Linha, entrada.Ticket, $"Cliente {entrada.CodigoCliente} nao foi carregado."));
                continue;
            }

            try
            {
                var resultado = await movimentacoes.RegistrarImportada(new(
                    clienteId,
                    [new(ofertaHistorica.OfertaId, 1, entrada.Total)],
                    entrada.DataHora,
                    entrada.Ticket,
                    CriarObservacao(entrada)), ct);
                if (resultado.Existente) relatorio.Movimentacoes.Existentes++;
                else relatorio.Movimentacoes.Inseridas++;
                relatorio.Movimentacoes.ValorCarregado += entrada.Total;
            }
            catch (Exception ex)
            {
                relatorio.Movimentacoes.Rejeitadas++;
                relatorio.Erros.Add(new("movimentacao", entrada.Linha, entrada.Ticket, ex.Message));
            }
            finally
            {
                movimentacoes.DescartarAlteracoesPendentes();
            }
        }

        foreach (var entrada in dados.Produtos)
        {
            try
            {
                var resultado = await catalogo.ImportarOuAtualizar(CriarItemDeReferencia(entrada), ct);
                if (resultado.Atualizado) relatorio.Produtos.Atualizados++;
                else relatorio.Produtos.Inseridos++;
            }
            catch (Exception ex)
            {
                relatorio.Produtos.Rejeitados++;
                relatorio.Erros.Add(new("produto", entrada.Linha, entrada.Nome, ex.Message));
            }
            finally
            {
                catalogo.DescartarAlteracoesPendentes();
            }
        }
    }

    private static async Task AplicarComposicaoSintetica(
        IServiceProvider servicos,
        DadosDaCarga dados,
        RelatorioDaCarga relatorio,
        CancellationToken ct)
    {
        var composicoes = CompositorSinteticoDeProdutos.Planejar(dados.Movimentacoes, dados.Produtos);
        RegistrarPlanoDeComposicao(dados, composicoes, relatorio);
        var catalogo = servicos.GetRequiredService<GerenciadorDoCatalogoDeLavanderia>();
        var movimentacoes = servicos.GetRequiredService<GerenciadorDeMovimentacoesComerciais>();
        var definicoes = dados.Produtos.Where(x => x.Quantidade > 0).Select(x => new DefinicaoDeProdutoSinteticoDoEssence(
            x.Nome.Trim().ToUpperInvariant(),
            x.Nome.Trim(),
            x.Total > 0 ? decimal.Round(x.Total / x.Quantidade, 2, MidpointRounding.AwayFromZero) : 0m)).ToArray();
        var ofertas = await catalogo.ObterOuCriarOfertasSinteticasDoEssence(definicoes, ct);

        foreach (var composicao in composicoes)
        {
            try
            {
                var linhas = composicao.Linhas.Select(linha =>
                {
                    var oferta = ofertas[linha.ChaveProduto];
                    return new DadosDaLinha(oferta.OfertaId, linha.Quantidade, linha.PrecoUnitario);
                }).ToArray();
                var observacao = CompositorSinteticoDeProdutos.AdicionarMarcador(CriarObservacao(composicao.Movimentacao));
                var resultado = await movimentacoes.SubstituirComposicaoImportada(
                    composicao.Movimentacao.Ticket,
                    linhas,
                    observacao,
                    ct);
                if (resultado.Situacao == SituacaoDaSubstituicaoDeComposicao.Ausente)
                {
                    relatorio.ComposicaoSintetica.MovimentacoesAusentes++;
                    relatorio.Pendencias.Add(new(
                        "movimentacao_ausente_para_composicao",
                        composicao.Movimentacao.Linha,
                        composicao.Movimentacao.Ticket,
                        $"O ticket do cliente {composicao.Movimentacao.CodigoCliente} nao existe no CRM."));
                    continue;
                }

                if (resultado.Situacao == SituacaoDaSubstituicaoDeComposicao.Atualizada)
                    relatorio.ComposicaoSintetica.MovimentacoesAtualizadas++;
                else
                    relatorio.ComposicaoSintetica.MovimentacoesInalteradas++;
                relatorio.ComposicaoSintetica.LinhasAplicadas += composicao.Linhas.Count;
                relatorio.ComposicaoSintetica.PecasAplicadas += composicao.PecasDistribuidas;
                relatorio.ComposicaoSintetica.ValorAplicado += composicao.Movimentacao.Total;
            }
            catch (Exception ex)
            {
                relatorio.ComposicaoSintetica.MovimentacoesRejeitadas++;
                relatorio.Erros.Add(new(
                    "composicao_sintetica",
                    composicao.Movimentacao.Linha,
                    composicao.Movimentacao.Ticket,
                    ex.Message));
            }
            finally
            {
                movimentacoes.DescartarAlteracoesPendentes();
            }
        }
    }

    private static async Task ReverterComposicaoSintetica(
        IServiceProvider servicos,
        DadosDaCarga dados,
        RelatorioDaCarga relatorio,
        CancellationToken ct)
    {
        RegistrarPlanoDeReversao(dados, relatorio);
        var catalogo = servicos.GetRequiredService<GerenciadorDoCatalogoDeLavanderia>();
        var movimentacoes = servicos.GetRequiredService<GerenciadorDeMovimentacoesComerciais>();
        var ofertaHistorica = await catalogo.ObterOuCriarOfertaHistoricaDoEssence(ct);
        foreach (var entrada in dados.Movimentacoes.OrderBy(x => x.DataHora).ThenBy(x => x.Ticket, StringComparer.Ordinal))
        {
            try
            {
                var resultado = await movimentacoes.SubstituirComposicaoImportada(
                    entrada.Ticket,
                    [new DadosDaLinha(ofertaHistorica.OfertaId, 1, entrada.Total)],
                    CriarObservacao(entrada),
                    ct);
                if (resultado.Situacao == SituacaoDaSubstituicaoDeComposicao.Ausente)
                {
                    relatorio.ComposicaoSintetica.MovimentacoesAusentes++;
                    relatorio.Pendencias.Add(new(
                        "movimentacao_ausente_para_reversao",
                        entrada.Linha,
                        entrada.Ticket,
                        $"O ticket do cliente {entrada.CodigoCliente} nao existe no CRM."));
                    continue;
                }

                if (resultado.Situacao == SituacaoDaSubstituicaoDeComposicao.Atualizada)
                    relatorio.ComposicaoSintetica.MovimentacoesAtualizadas++;
                else
                    relatorio.ComposicaoSintetica.MovimentacoesInalteradas++;
                relatorio.ComposicaoSintetica.LinhasAplicadas++;
                relatorio.ComposicaoSintetica.PecasAplicadas++;
                relatorio.ComposicaoSintetica.ValorAplicado += entrada.Total;
            }
            catch (Exception ex)
            {
                relatorio.ComposicaoSintetica.MovimentacoesRejeitadas++;
                relatorio.Erros.Add(new("reversao_composicao_sintetica", entrada.Linha, entrada.Ticket, ex.Message));
            }
            finally
            {
                movimentacoes.DescartarAlteracoesPendentes();
            }
        }
    }

    private static DadosDoItemDeCatalogo CriarItemDeReferencia(ProdutoDaCarga entrada)
    {
        var nomeOriginal = entrada.Nome.Trim();
        var nome = $"Essence - {nomeOriginal}";
        if (nome.Length > 160) nome = nome[..160];
        var chave = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(nomeOriginal.ToUpperInvariant())))[..16];
        decimal? valorReferencia = entrada.Quantidade > 0 && entrada.Total > 0
            ? decimal.Round(entrada.Total / entrada.Quantidade, 2, MidpointRounding.AwayFromZero)
            : null;
        var descricao = $"Referencia agregada do relatorio do Essence, sem vinculo com tickets. " +
            $"Periodo: {entrada.PeriodoInicio:dd/MM/yyyy} a {entrada.PeriodoFim:dd/MM/yyyy}. " +
            $"Quantidade observada: {entrada.Quantidade}. Valor total observado: {entrada.Total.ToString("C", CulturaBrasileira)}. " +
            "O tipo e o servico ainda exigem conciliacao; este registro nao representa preco vigente.";
        return new(
            TipoDeItemDeCatalogo.Produto,
            nome,
            descricao,
            "Referencia historica Essence",
            valorReferencia,
            SituacaoDoItemDeCatalogo.Inativo,
            $"ESSENCE-RANK-{chave}");
    }

    private static string CriarObservacao(MovimentacaoDaCarga entrada)
    {
        var partes = new List<string>
        {
            "Importado do Essence.",
            $"Pecas: {entrada.Pecas}.",
            $"Pacote: {(entrada.Pacote ? "sim" : "nao")}.",
            $"Subtotal na origem: {entrada.Subtotal.ToString("C", CulturaBrasileira)}.",
            $"Desconto na origem: {entrada.Desconto.ToString("C", CulturaBrasileira)}."
        };
        if (entrada.ValorUtilizacaoPacote is not null)
            partes.Add($"Valor de utilizacao do pacote: {entrada.ValorUtilizacaoPacote.Value.ToString("C", CulturaBrasileira)}.");
        if (!string.IsNullOrWhiteSpace(entrada.Atendente))
            partes.Add($"Atendente na origem: {entrada.Atendente}.");
        var observacao = string.Join(" ", partes);
        return observacao.Length <= 500 ? observacao : observacao[..500];
    }

    private static RelatorioDaCarga CriarRelatorio(OpcoesDaCarga opcoes, DadosDaCarga dados)
    {
        var relatorio = new RelatorioDaCarga
        {
            Modo = opcoes.Confirmar ? "confirmacao" : "simulacao",
            Operacao = opcoes.Operacao.ToString(),
            Ambiente = opcoes.Ambiente.ToString(),
            TenantId = opcoes.TenantId,
            Arquivos = new(
                opcoes.ArquivoClientes is null ? null : Path.GetFileName(opcoes.ArquivoClientes),
                Path.GetFileName(opcoes.ArquivoMovimentacoes),
                opcoes.ArquivoProdutos is null ? null : Path.GetFileName(opcoes.ArquivoProdutos))
        };
        relatorio.Clientes.Recebidos = dados.Clientes.Count;
        relatorio.Movimentacoes.Recebidas = dados.Movimentacoes.Count;
        relatorio.Movimentacoes.ValorRecebido = dados.Movimentacoes.Sum(x => x.Total);
        relatorio.Produtos.Recebidos = dados.Produtos.Count;
        relatorio.Produtos.QuantidadeObservada = dados.Produtos.Sum(x => x.Quantidade);
        relatorio.Produtos.ValorObservado = dados.Produtos.Sum(x => x.Total);
        return relatorio;
    }

    private static void PrepararSimulacao(
        OperacaoDaCarga operacao,
        DadosDaCarga dados,
        RelatorioDaCarga relatorio)
    {
        switch (operacao)
        {
            case OperacaoDaCarga.CargaHistorica:
                RegistrarClientesAusentes(dados, relatorio);
                break;
            case OperacaoDaCarga.ComposicaoSintetica:
                var composicoes = CompositorSinteticoDeProdutos.Planejar(dados.Movimentacoes, dados.Produtos);
                RegistrarPlanoDeComposicao(dados, composicoes, relatorio);
                break;
            case OperacaoDaCarga.ReversaoComposicaoSintetica:
                RegistrarPlanoDeReversao(dados, relatorio);
                break;
            default:
                throw new ArgumentOutOfRangeException(nameof(operacao), operacao, "Operacao de simulacao desconhecida.");
        }
    }

    private static void RegistrarPlanoDeComposicao(
        DadosDaCarga dados,
        IReadOnlyCollection<ComposicaoSinteticaDaMovimentacao> composicoes,
        RelatorioDaCarga relatorio)
    {
        relatorio.ComposicaoSintetica.ProdutosBase = dados.Produtos.Count(x => x.Quantidade > 0);
        relatorio.ComposicaoSintetica.QuantidadeBase = dados.Produtos.Where(x => x.Quantidade > 0).Sum(x => x.Quantidade);
        relatorio.ComposicaoSintetica.MovimentacoesPlanejadas = composicoes.Count;
        relatorio.ComposicaoSintetica.LinhasPlanejadas = composicoes.Sum(x => x.Linhas.Count);
        relatorio.ComposicaoSintetica.PecasDistribuidas = composicoes.Sum(x => x.PecasDistribuidas);
        relatorio.ComposicaoSintetica.MovimentacoesSemPecasAjustadas = composicoes.Count(x => x.PecasAjustadas);
        relatorio.ComposicaoSintetica.ValorPlanejado = composicoes.Sum(x => x.Movimentacao.Total);
    }

    private static void RegistrarPlanoDeReversao(DadosDaCarga dados, RelatorioDaCarga relatorio)
    {
        relatorio.ComposicaoSintetica.MovimentacoesPlanejadas = dados.Movimentacoes.Count;
        relatorio.ComposicaoSintetica.LinhasPlanejadas = dados.Movimentacoes.Count;
        relatorio.ComposicaoSintetica.PecasDistribuidas = dados.Movimentacoes.Count;
        relatorio.ComposicaoSintetica.ValorPlanejado = dados.Movimentacoes.Sum(x => x.Total);
    }

    private static void RegistrarClientesAusentes(DadosDaCarga dados, RelatorioDaCarga relatorio)
    {
        var codigos = dados.Clientes.Select(x => x.CodigoExterno).ToHashSet(StringComparer.OrdinalIgnoreCase);
        foreach (var grupo in dados.Movimentacoes.Where(x => !codigos.Contains(x.CodigoCliente)).GroupBy(x => x.CodigoCliente))
        {
            var quantidade = grupo.Count();
            var valor = grupo.Sum(x => x.Total);
            relatorio.Movimentacoes.SemClienteCarregado += quantidade;
            relatorio.Movimentacoes.ValorSemClienteCarregado += valor;
            relatorio.Pendencias.Add(new("cliente_ausente_da_carga", 0, grupo.Key, $"{quantidade} ticket(s), total {valor.ToString("C", CulturaBrasileira)}."));
        }
    }

    private static async Task SalvarRelatorio(string caminho, RelatorioDaCarga relatorio, CancellationToken ct)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(caminho)!);
        var opcoes = new JsonSerializerOptions { WriteIndented = true, PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        await File.WriteAllTextAsync(caminho, JsonSerializer.Serialize(relatorio, opcoes), new UTF8Encoding(false), ct);
    }

    private static void ExibirResumo(RelatorioDaCarga relatorio)
    {
        Console.WriteLine($"Operacao: {relatorio.Operacao} ({relatorio.Modo}).");
        Console.WriteLine($"Clientes: {relatorio.Clientes.Recebidos} recebidos, {relatorio.Clientes.Inseridos} inseridos, {relatorio.Clientes.Atualizados} atualizados, {relatorio.Clientes.Rejeitados} rejeitados.");
        Console.WriteLine($"Movimentacoes: {relatorio.Movimentacoes.Recebidas} recebidas, {relatorio.Movimentacoes.Inseridas} inseridas, {relatorio.Movimentacoes.Existentes} existentes, {relatorio.Movimentacoes.SemClienteCarregado} sem cliente, {relatorio.Movimentacoes.Rejeitadas} rejeitadas.");
        Console.WriteLine($"Produtos de referencia: {relatorio.Produtos.Recebidos} recebidos, {relatorio.Produtos.Inseridos} inseridos, {relatorio.Produtos.Atualizados} atualizados, {relatorio.Produtos.Rejeitados} rejeitados.");
        if (relatorio.ComposicaoSintetica.MovimentacoesPlanejadas > 0)
        {
            Console.WriteLine($"Composicoes: {relatorio.ComposicaoSintetica.MovimentacoesPlanejadas} planejadas, {relatorio.ComposicaoSintetica.MovimentacoesAtualizadas} atualizadas, {relatorio.ComposicaoSintetica.MovimentacoesInalteradas} inalteradas, {relatorio.ComposicaoSintetica.MovimentacoesAusentes} ausentes, {relatorio.ComposicaoSintetica.MovimentacoesRejeitadas} rejeitadas.");
            Console.WriteLine($"Plano sintetico: {relatorio.ComposicaoSintetica.LinhasPlanejadas} linhas, {relatorio.ComposicaoSintetica.PecasDistribuidas} pecas, {relatorio.ComposicaoSintetica.ValorPlanejado.ToString("C", CulturaBrasileira)}.");
            Console.WriteLine($"Aplicacao sintetica: {relatorio.ComposicaoSintetica.LinhasAplicadas} linhas, {relatorio.ComposicaoSintetica.PecasAplicadas} pecas, {relatorio.ComposicaoSintetica.ValorAplicado.ToString("C", CulturaBrasileira)}.");
        }
        Console.WriteLine($"Ocorrencias: {relatorio.Erros.Count} erro(s), {relatorio.Pendencias.Count} pendencia(s).");
    }

    private static void ValidarBloqueioDeProducao()
    {
        var ambienteRailway = Environment.GetEnvironmentVariable("RAILWAY_ENVIRONMENT_NAME") ?? string.Empty;
        if (ambienteRailway.Contains("prod", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("A carga em producao permanece bloqueada pela decisao operacional vigente.");
    }

    private sealed record ContextoDoImportador(Guid TenantId, AmbienteDaCarga Ambiente) : IContextoDoUsuario
    {
        public bool Autenticado => true;
        public string UsuarioIdentidadeId => $"importador-essence:{Ambiente.ToString().ToLowerInvariant()}";
    }
}
