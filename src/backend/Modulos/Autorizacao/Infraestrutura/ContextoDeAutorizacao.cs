using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using LavaMais.Crm.Modulos.Autorizacao.Dominio;
using Microsoft.EntityFrameworkCore;

namespace LavaMais.Crm.Modulos.Autorizacao.Infraestrutura;

public sealed class ContextoDeAutorizacao(
    DbContextOptions<ContextoDeAutorizacao> opcoes,
    IContextoDoUsuario contextoDoUsuario) : ContextoDeModulo(opcoes)
{
    public const string Schema = "autorizacao";
    public const string TabelaDeHistoricoDasMigrations = "__historico_migrations";

    public DbSet<UsuarioCrm> UsuariosCrm => Set<UsuarioCrm>();

    protected override void OnModelCreating(ModelBuilder construtor)
    {
        construtor.HasDefaultSchema(Schema);
        construtor.Entity<UsuarioCrm>(entidade =>
        {
            entidade.ToTable("usuarios_crm");
            entidade.HasKey(usuario => usuario.Id).HasName("pk_usuarios_crm");
            entidade.Property(usuario => usuario.Id).HasColumnName("id");
            entidade.Property(usuario => usuario.TenantId).HasColumnName("tenant_id");
            entidade.Property(usuario => usuario.UsuarioIdentidadeId).HasColumnName("usuario_identidade_id").HasMaxLength(200);
            entidade.Property(usuario => usuario.Papel).HasColumnName("papel").HasConversion<string>().HasMaxLength(30);
            entidade.Property(usuario => usuario.Situacao).HasColumnName("situacao").HasConversion<string>().HasMaxLength(20);
            entidade.Property(usuario => usuario.DataCriacao).HasColumnName("data_criacao");
            entidade.Property(usuario => usuario.DataAtualizacao).HasColumnName("data_atualizacao");
            entidade.Property(usuario => usuario.Versao).IsRowVersion();
            entidade.HasIndex(usuario => new { usuario.TenantId, usuario.UsuarioIdentidadeId })
                .IsUnique()
                .HasDatabaseName("ux_usuarios_crm_tenant_usuario");
            entidade.HasQueryFilter(usuario => usuario.TenantId == contextoDoUsuario.TenantId);
        });
        base.OnModelCreating(construtor);
    }
}
