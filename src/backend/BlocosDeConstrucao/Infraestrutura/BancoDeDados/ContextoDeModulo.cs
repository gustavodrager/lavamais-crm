using Microsoft.EntityFrameworkCore;

namespace LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;

public abstract class ContextoDeModulo(DbContextOptions opcoes) : DbContext(opcoes)
{
    protected override void OnModelCreating(ModelBuilder construtor)
    {
        construtor.ApplyConfigurationsFromAssembly(GetType().Assembly);
        base.OnModelCreating(construtor);
    }
}
