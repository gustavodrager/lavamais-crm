using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using LavaMais.Crm.Modulos.Catalogo.Dominio;
using Microsoft.EntityFrameworkCore;

namespace LavaMais.Crm.Modulos.Catalogo.Infraestrutura;

public sealed class ContextoDeCatalogo(DbContextOptions<ContextoDeCatalogo> opcoes, IContextoDoUsuario usuario) : ContextoDeModulo(opcoes)
{
    public const string Schema = "catalogo";
    public const string Historico = "__historico_migrations";
    public DbSet<ItemDeCatalogo> Itens => Set<ItemDeCatalogo>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.HasDefaultSchema(Schema);
        b.Entity<ItemDeCatalogo>(e =>
        {
            e.ToTable("itens_de_catalogo"); e.HasKey(x => x.Id); e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.TenantId).HasColumnName("tenant_id"); e.Property(x => x.Tipo).HasColumnName("tipo").HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.Nome).HasColumnName("nome").HasMaxLength(160); e.Property(x => x.NomeNormalizado).HasColumnName("nome_normalizado").HasMaxLength(160);
            e.Property(x => x.Descricao).HasColumnName("descricao").HasMaxLength(1000); e.Property(x => x.Categoria).HasColumnName("categoria").HasMaxLength(100);
            e.Property(x => x.ValorReferencia).HasColumnName("valor_referencia").HasPrecision(18, 2); e.Property(x => x.Situacao).HasColumnName("situacao").HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.DataCriacao).HasColumnName("data_criacao"); e.Property(x => x.DataAtualizacao).HasColumnName("data_atualizacao"); e.Property(x => x.Versao).IsRowVersion();
            e.HasQueryFilter(x => x.TenantId == usuario.TenantId); e.HasIndex(x => new { x.TenantId, x.NomeNormalizado }).IsUnique();
        });
        base.OnModelCreating(b);
    }
}
