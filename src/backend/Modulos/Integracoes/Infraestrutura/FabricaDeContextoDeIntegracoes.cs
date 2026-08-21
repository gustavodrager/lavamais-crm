using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
namespace LavaMais.Crm.Modulos.Integracoes.Infraestrutura;

public sealed class FabricaDeContextoDeIntegracoes : IDesignTimeDbContextFactory<ContextoDeIntegracoes> { public ContextoDeIntegracoes CreateDbContext(string[] args) => new(new DbContextOptionsBuilder<ContextoDeIntegracoes>().UseNpgsql(ConfiguracaoPostgres.ObterStringDeConexaoParaFerramentas()).Options, new Vazio()); private sealed class Vazio : IContextoDoUsuario { public bool Autenticado => false; public Guid TenantId => Guid.Empty; public string UsuarioIdentidadeId => ""; } }
