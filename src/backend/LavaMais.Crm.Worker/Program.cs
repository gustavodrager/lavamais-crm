using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using LavaMais.Crm.Worker;

var construtor = Host.CreateApplicationBuilder(args);

construtor.Logging.ClearProviders();
construtor.Logging.AddJsonConsole(opcoes => opcoes.IncludeScopes = true);
construtor.Services.AdicionarPostgres(construtor.Configuration);
construtor.Services.AddHostedService<WorkerDaFundacao>();

await construtor.Build().RunAsync();
