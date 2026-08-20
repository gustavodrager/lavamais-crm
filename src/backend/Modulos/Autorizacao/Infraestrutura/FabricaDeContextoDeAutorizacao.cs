using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace LavaMais.Crm.Modulos.Autorizacao.Infraestrutura;

public sealed class FabricaDeContextoDeAutorizacao : IDesignTimeDbContextFactory<ContextoDeAutorizacao>
{
    public ContextoDeAutorizacao CreateDbContext(string[] args)
    {
        var conexao = ConfiguracaoPostgres.ObterStringDeConexaoParaFerramentas();
        var opcoes = new DbContextOptionsBuilder<ContextoDeAutorizacao>().UseNpgsql(conexao).Options;
        return new ContextoDeAutorizacao(opcoes, new ContextoDeDesign());
    }

    private sealed class ContextoDeDesign : IContextoDoUsuario
    {
        public bool Autenticado => false;
        public Guid TenantId => Guid.Empty;
        public string UsuarioIdentidadeId => string.Empty;
    }
}
