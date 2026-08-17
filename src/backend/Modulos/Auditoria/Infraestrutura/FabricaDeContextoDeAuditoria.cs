using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace LavaMais.Crm.Modulos.Auditoria.Infraestrutura;

public sealed class FabricaDeContextoDeAuditoria : IDesignTimeDbContextFactory<ContextoDeAuditoria>
{
    public ContextoDeAuditoria CreateDbContext(string[] args) => new(new DbContextOptionsBuilder<ContextoDeAuditoria>().UseNpgsql(Environment.GetEnvironmentVariable("ConnectionStrings__Crm") ?? "Host=localhost;Database=lavamais_crm;Username=lavamais;Password=lavamais_local").Options, new Vazio());
    private sealed class Vazio : IContextoDoUsuario { public bool Autenticado => false; public Guid TenantId => Guid.Empty; public string UsuarioIdentidadeId => string.Empty; }
}
