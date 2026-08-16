using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace LavaMais.Crm.Modulos.ModelosDeMensagem.Infraestrutura;

public sealed class FabricaDeContextoDeModelos : IDesignTimeDbContextFactory<ContextoDeModelos>
{
    public ContextoDeModelos CreateDbContext(string[] args)
    {
        var conexao = Environment.GetEnvironmentVariable("ConnectionStrings__Crm") ?? "Host=localhost;Database=lavamais_crm;Username=lavamais;Password=lavamais_local";
        return new(new DbContextOptionsBuilder<ContextoDeModelos>().UseNpgsql(conexao).Options, new ContextoVazio());
    }
    private sealed class ContextoVazio : IContextoDoUsuario { public bool Autenticado => false; public Guid TenantId => Guid.Empty; public string UsuarioIdentidadeId => string.Empty; }
}
