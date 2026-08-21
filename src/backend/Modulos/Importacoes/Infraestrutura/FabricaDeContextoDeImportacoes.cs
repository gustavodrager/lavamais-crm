using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace LavaMais.Crm.Modulos.Importacoes.Infraestrutura;

public sealed class FabricaDeContextoDeImportacoes : IDesignTimeDbContextFactory<ContextoDeImportacoes>
{
    public ContextoDeImportacoes CreateDbContext(string[] args) => new(new DbContextOptionsBuilder<ContextoDeImportacoes>().UseNpgsql(ConfiguracaoPostgres.ObterStringDeConexaoParaFerramentas()).Options, new Vazio());
    private sealed class Vazio : IContextoDoUsuario { public bool Autenticado => false; public Guid TenantId => Guid.Empty; public string UsuarioIdentidadeId => string.Empty; }
}
