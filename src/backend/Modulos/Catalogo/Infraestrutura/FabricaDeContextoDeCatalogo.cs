using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace LavaMais.Crm.Modulos.Catalogo.Infraestrutura;

public sealed class FabricaDeContextoDeCatalogo : IDesignTimeDbContextFactory<ContextoDeCatalogo>
{
    public ContextoDeCatalogo CreateDbContext(string[] args)
    {
        var conexao = ConfiguracaoPostgres.ObterStringDeConexaoParaFerramentas();
        return new(new DbContextOptionsBuilder<ContextoDeCatalogo>().UseNpgsql(conexao).Options, new ContextoVazio());
    }
    private sealed class ContextoVazio : IContextoDoUsuario { public bool Autenticado => false; public Guid TenantId => Guid.Empty; public string UsuarioIdentidadeId => string.Empty; }
}
