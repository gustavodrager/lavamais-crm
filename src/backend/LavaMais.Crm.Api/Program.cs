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
using LavaMais.Crm.Modulos.ModelosDeMensagem.Api;
using LavaMais.Crm.Modulos.Segmentacao.Api;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
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
construtor.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(opcoes =>
{
    var secao = construtor.Configuration.GetRequiredSection("Autenticacao");
    var validarAudiencia = secao.GetValue("ValidarAudiencia", true);
    if (!construtor.Environment.IsDevelopment() && !validarAudiencia)
        throw new InvalidOperationException("A validacao de audiencia so pode ser desabilitada em Development.");

    opcoes.Authority = secao["Autoridade"];
    opcoes.RequireHttpsMetadata = secao.GetValue("ExigirHttps", true);
    opcoes.MapInboundClaims = false;
    opcoes.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = secao["Emissor"],
        ValidateAudience = validarAudiencia,
        ValidAudience = secao["Audiencia"],
        NameClaimType = "sub"
    };
    opcoes.Events = new JwtBearerEvents
    {
        OnTokenValidated = contexto => contexto.Principal?.HasClaim(claim => claim.Type == "sub") == true
            ? Task.CompletedTask
            : Task.FromException(new SecurityTokenValidationException("Token sem claim sub."))
    };
});
construtor.Services.AddOpenApi();
construtor.Services.ConfigureHttpJsonOptions(opcoes =>
    opcoes.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));

var aplicacao = construtor.Build();

aplicacao.UsarFundacaoDaApi();
aplicacao.UseAuthentication();
aplicacao.UseAuthorization();
aplicacao.MapOpenApi("/openapi/{documentName}.json");
aplicacao.MapearModuloAutorizacao();
aplicacao.MapearModuloAuditoria();
aplicacao.MapearModuloCatalogo();
aplicacao.MapearModuloClientes();
aplicacao.MapearModuloImportacoes();
aplicacao.MapearModuloModelos();
aplicacao.MapearModuloAcoesComerciais();

await aplicacao.RunAsync();

public partial class Program;
