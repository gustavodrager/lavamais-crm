using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using LavaMais.Crm.Modulos.Identidade.Dominio;
using Microsoft.EntityFrameworkCore;

namespace LavaMais.Crm.Modulos.Identidade.Infraestrutura;

public sealed class ContextoDeIdentidade(DbContextOptions<ContextoDeIdentidade> opcoes) : ContextoDeModulo(opcoes)
{
    public const string Schema = "identidade"; public const string Historico = "__historico_migrations";
    public DbSet<UsuarioDeIdentidade> Usuarios => Set<UsuarioDeIdentidade>();
    public DbSet<SessaoDeIdentidade> Sessoes => Set<SessaoDeIdentidade>();
    protected override void OnModelCreating(ModelBuilder b)
    {
        b.HasDefaultSchema(Schema);
        b.Entity<UsuarioDeIdentidade>(e => { e.ToTable("usuarios"); e.HasKey(x => x.Id); e.Property(x => x.Id).HasColumnName("id"); e.Property(x => x.TenantId).HasColumnName("tenant_id"); e.Property(x => x.Telefone).HasColumnName("telefone").HasMaxLength(20); e.Property(x => x.Nome).HasColumnName("nome").HasMaxLength(150); e.Property(x => x.SenhaProtegida).HasColumnName("senha_protegida").HasMaxLength(500); e.Property(x => x.Papel).HasColumnName("papel").HasMaxLength(30); e.Property(x => x.Ativo).HasColumnName("ativo"); e.Property(x => x.DataCriacao).HasColumnName("data_criacao"); e.Property(x => x.DataAtualizacao).HasColumnName("data_atualizacao"); e.Property(x => x.Versao).HasColumnName("versao").IsConcurrencyToken(); e.HasIndex(x => x.Telefone).IsUnique(); });
        b.Entity<SessaoDeIdentidade>(e => { e.ToTable("sessoes"); e.HasKey(x => x.Id); e.Property(x => x.Id).HasColumnName("id"); e.Property(x => x.UsuarioId).HasColumnName("usuario_id"); e.Property(x => x.TokenHash).HasColumnName("token_hash").HasMaxLength(64); e.Property(x => x.DataCriacao).HasColumnName("data_criacao"); e.Property(x => x.ExpiraEm).HasColumnName("expira_em"); e.Property(x => x.DataRevogacao).HasColumnName("data_revogacao"); e.HasIndex(x => x.TokenHash).IsUnique(); e.HasOne<UsuarioDeIdentidade>().WithMany().HasForeignKey(x => x.UsuarioId); });
        base.OnModelCreating(b);
    }
}
