using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace LavaMais.Crm.Modulos.Importacoes.Infraestrutura;

public sealed class FabricaDeContextoDeImportacoes : IDesignTimeDbContextFactory<ContextoDeImportacoes>
{
    public ContextoDeImportacoes CreateDbContext(string[] args) => new(new DbContextOptionsBuilder<ContextoDeImportacoes>().UseNpgsql(Environment.GetEnvironmentVariable("ConnectionStrings__Crm") ?? "Host=localhost;Database=lavamais_crm;Username=lavamais;Password=lavamais_local").Options, new Vazio());
    private sealed class Vazio : IContextoDoUsuario { public bool Autenticado => false; public Guid TenantId => Guid.Empty; public string UsuarioIdentidadeId => string.Empty; }
}
