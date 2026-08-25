using LavaMais.Crm.BlocosDeConstrucao.Api;
using LavaMais.Crm.BlocosDeConstrucao.Api.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.Modulos.AcoesComerciais.Api;
using LavaMais.Crm.Modulos.Auditoria.Api;
using LavaMais.Crm.Modulos.Autorizacao.Api;
using LavaMais.Crm.Modulos.Catalogo.Api;
using LavaMais.Crm.Modulos.Clientes.Api;
using LavaMais.Crm.Modulos.Importacoes.Api;
using LavaMais.Crm.Modulos.Integracoes.Api;
using LavaMais.Crm.Modulos.Identidade.Api;
using LavaMais.Crm.Modulos.ModelosDeMensagem.Api;
using LavaMais.Crm.Modulos.MovimentacoesComerciais.Api;
using LavaMais.Crm.Modulos.Roteiros.Api;
using LavaMais.Crm.Modulos.Segmentacao.Api;
using System.Text.Json.Serialization;

var construtor = WebApplication.CreateBuilder(args);

construtor.Logging.ClearProviders();
construtor.Logging.AddJsonConsole(opcoes => opcoes.IncludeScopes = true);
construtor.Services.AdicionarFundacaoDaApi(construtor.Configuration);
construtor.Services.AddHttpContextAccessor();
construtor.Services.AddScoped<IContextoDoUsuario, ContextoDoUsuarioHttp>();
construtor.Services.AdicionarModuloAutorizacao(construtor.Configuration);
construtor.Services.AdicionarModuloAuditoria(construtor.Configuration);
construtor.Services.AdicionarModuloCatalogo(construtor.Configuration);
construtor.Services.AdicionarModuloClientes(construtor.Configuration);
construtor.Services.AdicionarModuloImportacoes(construtor.Configuration);
construtor.Services.AdicionarModuloIntegracoes(construtor.Configuration);
construtor.Services.AdicionarModuloModelos(construtor.Configuration);
construtor.Services.AdicionarModuloSegmentacao();
construtor.Services.AdicionarModuloAcoesComerciais(construtor.Configuration);
construtor.Services.AdicionarModuloMovimentacoesComerciais(construtor.Configuration);
construtor.Services.AdicionarModuloRoteiros(construtor.Configuration);
construtor.Services.AdicionarModuloIdentidade(construtor.Configuration);
construtor.Services.AddOpenApi();
construtor.Services.ConfigureHttpJsonOptions(opcoes =>
    opcoes.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));

var aplicacao = construtor.Build();

aplicacao.UsarFundacaoDaApi();
aplicacao.UseRateLimiter();
aplicacao.UseAuthentication();
aplicacao.UseAuthorization();
aplicacao.MapOpenApi("/openapi/{documentName}.json");
aplicacao.MapearModuloIdentidade();
aplicacao.MapearModuloAutorizacao();
aplicacao.MapearModuloAuditoria();
aplicacao.MapearModuloCatalogo();
aplicacao.MapearModuloClientes();
aplicacao.MapearModuloImportacoes();
aplicacao.MapearModuloModelos();
aplicacao.MapearModuloAcoesComerciais();
aplicacao.MapearModuloMovimentacoesComerciais();
aplicacao.MapearModuloRoteiros();

await aplicacao.RunAsync();

public partial class Program;
