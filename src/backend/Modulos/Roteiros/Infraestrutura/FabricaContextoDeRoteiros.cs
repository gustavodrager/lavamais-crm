using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace LavaMais.Crm.Modulos.Roteiros.Infraestrutura;
public sealed class FabricaContextoDeRoteiros : IDesignTimeDbContextFactory<ContextoDeRoteiros>
{
    public ContextoDeRoteiros CreateDbContext(string[] args) { var conexao = ConfiguracaoPostgres.ObterStringDeConexaoParaFerramentas(); var opcoes = new DbContextOptionsBuilder<ContextoDeRoteiros>().UseNpgsql(conexao, x => x.MigrationsHistoryTable(ContextoDeRoteiros.Historico, ContextoDeRoteiros.Schema)).Options; return new(opcoes, new UsuarioDesign()); }
    private sealed class UsuarioDesign : IContextoDoUsuario { public bool Autenticado => false; public Guid TenantId => Guid.Empty; public string UsuarioIdentidadeId => "design"; }
}
