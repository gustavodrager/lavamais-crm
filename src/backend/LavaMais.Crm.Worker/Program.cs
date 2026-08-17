using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using LavaMais.Crm.Worker;
using LavaMais.Crm.Modulos.Autorizacao.Aplicacao;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.Modulos.AcoesComerciais.Api;
using LavaMais.Crm.Modulos.Auditoria.Api;
using LavaMais.Crm.Modulos.Catalogo.Api;
using LavaMais.Crm.Modulos.Clientes.Api;
using LavaMais.Crm.Modulos.Integracoes.Api;
using LavaMais.Crm.Modulos.ModelosDeMensagem.Api;
using LavaMais.Crm.Modulos.Segmentacao.Api;

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
construtor.Services.AddSingleton<IContextoDoUsuario, ContextoDoWorker>();
construtor.Services.AdicionarModuloClientes(construtor.Configuration); construtor.Services.AdicionarModuloCatalogo(construtor.Configuration); construtor.Services.AdicionarModuloModelos(construtor.Configuration); construtor.Services.AdicionarModuloSegmentacao(); construtor.Services.AdicionarModuloAuditoria(construtor.Configuration); construtor.Services.AdicionarModuloIntegracoes(construtor.Configuration); construtor.Services.AdicionarModuloAcoesComerciais(construtor.Configuration);
construtor.Services.AddHostedService<WorkerDeIntegracoes>();

await construtor.Build().RunAsync();

file sealed class ContextoDoWorker : IContextoDoUsuario { public bool Autenticado => false; public Guid TenantId => Guid.Empty; public string UsuarioIdentidadeId => "worker"; }
