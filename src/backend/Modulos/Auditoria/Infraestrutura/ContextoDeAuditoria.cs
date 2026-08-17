using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using LavaMais.Crm.Modulos.Auditoria.Dominio;
using Microsoft.EntityFrameworkCore;

namespace LavaMais.Crm.Modulos.Auditoria.Infraestrutura;

public sealed class ContextoDeAuditoria(DbContextOptions<ContextoDeAuditoria> opcoes, IContextoDoUsuario usuario) : ContextoDeModulo(opcoes)
{
    public const string Schema = "auditoria"; public const string Historico = "__historico_migrations";
    public DbSet<RegistroDeAuditoria> Registros => Set<RegistroDeAuditoria>();
    protected override void OnModelCreating(ModelBuilder b)
    {
        b.HasDefaultSchema(Schema); b.Entity<RegistroDeAuditoria>(e =>
        {
            e.ToTable("registros_de_auditoria"); e.HasKey(x => x.Id); e.Property(x => x.Id).HasColumnName("id"); e.Property(x => x.TenantId).HasColumnName("tenant_id");
            e.Property(x => x.UsuarioIdentidadeId).HasColumnName("usuario_identidade_id").HasMaxLength(200); e.Property(x => x.Tipo).HasColumnName("tipo").HasMaxLength(100);
            e.Property(x => x.Recurso).HasColumnName("recurso").HasMaxLength(100); e.Property(x => x.RecursoId).HasColumnName("recurso_id"); e.Property(x => x.DadosJson).HasColumnName("dados_json").HasColumnType("jsonb"); e.Property(x => x.Data).HasColumnName("data");
            e.HasQueryFilter(x => x.TenantId == usuario.TenantId); e.HasIndex(x => new { x.TenantId, x.Recurso, x.RecursoId });
        }); base.OnModelCreating(b);
    }
}
