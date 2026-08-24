using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace LavaMais.Crm.Modulos.Identidade.Infraestrutura;
public sealed class FabricaDeContextoDeIdentidade : IDesignTimeDbContextFactory<ContextoDeIdentidade>
{
    public ContextoDeIdentidade CreateDbContext(string[] args) { var c = ConfiguracaoPostgres.ObterStringDeConexaoParaFerramentas(); return new(new DbContextOptionsBuilder<ContextoDeIdentidade>().UseNpgsql(c, x => x.MigrationsHistoryTable(ContextoDeIdentidade.Historico, ContextoDeIdentidade.Schema)).Options); }
}
