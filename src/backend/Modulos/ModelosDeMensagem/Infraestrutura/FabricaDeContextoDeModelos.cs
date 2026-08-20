using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace LavaMais.Crm.Modulos.ModelosDeMensagem.Infraestrutura;

public sealed class FabricaDeContextoDeModelos : IDesignTimeDbContextFactory<ContextoDeModelos>
{
    public ContextoDeModelos CreateDbContext(string[] args)
    {
        var conexao = ConfiguracaoPostgres.ObterStringDeConexaoParaFerramentas();
        return new(new DbContextOptionsBuilder<ContextoDeModelos>().UseNpgsql(conexao).Options, new ContextoVazio());
    }
    private sealed class ContextoVazio : IContextoDoUsuario { public bool Autenticado => false; public Guid TenantId => Guid.Empty; public string UsuarioIdentidadeId => string.Empty; }
}
