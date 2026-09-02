using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using Microsoft.EntityFrameworkCore;

namespace LavaMais.Crm.Modulos.Integracoes.Infraestrutura;

public sealed class ContextoDeIntegracoes : ContextoDeModulo
{
    public const string Schema = "integracoes";
    public const string Historico = "__historico_migrations";

    public ContextoDeIntegracoes(DbContextOptions<ContextoDeIntegracoes> opcoes, IContextoDoUsuario usuario)
        : base(opcoes) => _ = usuario;

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.HasDefaultSchema(Schema);
        base.OnModelCreating(b);
    }
}
