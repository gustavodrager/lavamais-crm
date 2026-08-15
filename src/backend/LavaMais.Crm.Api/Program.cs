using LavaMais.Crm.BlocosDeConstrucao.Api;

var construtor = WebApplication.CreateBuilder(args);

construtor.Logging.ClearProviders();
construtor.Logging.AddJsonConsole(opcoes => opcoes.IncludeScopes = true);
construtor.Services.AdicionarFundacaoDaApi(construtor.Configuration);
construtor.Services.AddOpenApi();

var aplicacao = construtor.Build();

aplicacao.UsarFundacaoDaApi();
aplicacao.MapOpenApi("/openapi/{documentName}.json");

await aplicacao.RunAsync();

public partial class Program;
