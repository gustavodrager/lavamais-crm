using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace LavaMais.Crm.Modulos.AcoesComerciais.Infraestrutura;

public sealed class FabricaDeContextoDeAcoesComerciais : IDesignTimeDbContextFactory<ContextoDeAcoesComerciais>
{
    public ContextoDeAcoesComerciais CreateDbContext(string[] args)
    {
        var conexao = ConfiguracaoPostgres.ObterStringDeConexaoParaFerramentas();
        return new(new DbContextOptionsBuilder<ContextoDeAcoesComerciais>().UseNpgsql(conexao).Options, new ContextoVazio());
    }
    private sealed class ContextoVazio : IContextoDoUsuario { public bool Autenticado => false; public Guid TenantId => Guid.Empty; public string UsuarioIdentidadeId => string.Empty; }
}
