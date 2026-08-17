using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using LavaMais.Crm.Modulos.AcoesComerciais.Dominio;
using Microsoft.EntityFrameworkCore;

namespace LavaMais.Crm.Modulos.AcoesComerciais.Infraestrutura;

public sealed class ContextoDeAcoesComerciais(DbContextOptions<ContextoDeAcoesComerciais> opcoes, IContextoDoUsuario usuario) : ContextoDeModulo(opcoes)
{
    public const string Schema = "acoes_comerciais";
    public const string Historico = "__historico_migrations";
    public DbSet<AcaoComercial> Acoes => Set<AcaoComercial>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.HasDefaultSchema(Schema);
        b.Entity<AcaoComercial>(e =>
        {
            e.ToTable("acoes_comerciais"); e.HasKey(x => x.Id); e.Property(x => x.Id).HasColumnName("id"); e.Property(x => x.TenantId).HasColumnName("tenant_id");
            e.Property(x => x.Nome).HasColumnName("nome").HasMaxLength(160); e.Property(x => x.Objetivo).HasColumnName("objetivo").HasMaxLength(1000);
            e.Property(x => x.ItemDeCatalogoId).HasColumnName("item_de_catalogo_id"); e.Property(x => x.VersaoModeloId).HasColumnName("versao_modelo_id");
            e.Property(x => x.CriteriosSegmentacaoJson).HasColumnName("criterios_segmentacao_json").HasColumnType("jsonb"); e.Property(x => x.Situacao).HasColumnName("situacao").HasConversion<string>().HasMaxLength(30);
            e.Property(x => x.UsuarioCriacaoId).HasColumnName("usuario_criacao_id").HasMaxLength(200); e.Property(x => x.DataCriacao).HasColumnName("data_criacao"); e.Property(x => x.DataAtualizacao).HasColumnName("data_atualizacao"); e.Property(x => x.Versao).IsRowVersion();
            e.HasQueryFilter(x => x.TenantId == usuario.TenantId); e.HasIndex(x => new { x.TenantId, x.Situacao });
        });
        base.OnModelCreating(b);
    }
}
