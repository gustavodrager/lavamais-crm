using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace LavaMais.Crm.Modulos.MovimentacoesComerciais.Infraestrutura;

public sealed class FabricaDeContextoDeMovimentacoesComerciais : IDesignTimeDbContextFactory<ContextoDeMovimentacoesComerciais>
{
    public ContextoDeMovimentacoesComerciais CreateDbContext(string[] args) => new(new DbContextOptionsBuilder<ContextoDeMovimentacoesComerciais>().UseNpgsql(ConfiguracaoPostgres.ObterStringDeConexaoParaFerramentas()).Options, new ContextoVazio());
    private sealed class ContextoVazio : IContextoDoUsuario { public bool Autenticado => false; public Guid TenantId => Guid.Empty; public string UsuarioIdentidadeId => "design-time"; }
}
