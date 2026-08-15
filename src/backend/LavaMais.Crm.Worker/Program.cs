using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using LavaMais.Crm.Worker;
using LavaMais.Crm.Modulos.Autorizacao.Aplicacao;

var construtor = Host.CreateApplicationBuilder(args);

if (args.FirstOrDefault() == "provisionar-administrador")
{
    if (args.Length != 3 || !Guid.TryParse(args[1], out var tenantId) || string.IsNullOrWhiteSpace(args[2]))
        throw new ArgumentException("Uso: provisionar-administrador <tenant-id> <usuario-identidade-id>");

    var conexao = construtor.Configuration.GetConnectionString(ConfiguracaoPostgres.NomeDaConexao)
        ?? throw new InvalidOperationException("A conexao do CRM nao foi configurada.");
    await ProvisionadorDeAdministrador.Provisionar(conexao, tenantId, args[2], CancellationToken.None);
    return;
}

construtor.Logging.ClearProviders();
construtor.Logging.AddJsonConsole(opcoes => opcoes.IncludeScopes = true);
construtor.Services.AdicionarPostgres(construtor.Configuration);
construtor.Services.AddHostedService<WorkerDaFundacao>();

await construtor.Build().RunAsync();
