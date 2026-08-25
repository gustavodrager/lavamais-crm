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
    public DbSet<ArtigoDeLavanderia> ArtigosDeLavanderia => Set<ArtigoDeLavanderia>();
    public DbSet<ServicoDeLavanderia> ServicosDeLavanderia => Set<ServicoDeLavanderia>();
    public DbSet<OfertaDeServico> OfertasDeServico => Set<OfertaDeServico>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.HasDefaultSchema(Schema);
        b.Entity<ItemDeCatalogo>(e =>
        {
            e.ToTable("itens_de_catalogo"); e.HasKey(x => x.Id); e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.TenantId).HasColumnName("tenant_id"); e.Property(x => x.Tipo).HasColumnName("tipo").HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.Nome).HasColumnName("nome").HasMaxLength(160); e.Property(x => x.NomeNormalizado).HasColumnName("nome_normalizado").HasMaxLength(160);
            e.Property(x => x.Descricao).HasColumnName("descricao").HasMaxLength(1000); e.Property(x => x.Categoria).HasColumnName("categoria").HasMaxLength(100);
            e.Property(x => x.CodigoExterno).HasColumnName("codigo_externo").HasMaxLength(100); e.Property(x => x.DataCadastroOrigem).HasColumnName("data_cadastro_origem");
            e.Property(x => x.ValorReferencia).HasColumnName("valor_referencia").HasPrecision(18, 2); e.Property(x => x.Situacao).HasColumnName("situacao").HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.DataCriacao).HasColumnName("data_criacao"); e.Property(x => x.DataAtualizacao).HasColumnName("data_atualizacao"); e.Property(x => x.Versao).IsRowVersion();
            e.HasQueryFilter(x => x.TenantId == usuario.TenantId); e.HasIndex(x => new { x.TenantId, x.NomeNormalizado }).IsUnique(); e.HasIndex(x => new { x.TenantId, x.CodigoExterno }).IsUnique().HasFilter("codigo_externo IS NOT NULL");
        });
        b.Entity<ArtigoDeLavanderia>(e =>
        {
            e.ToTable("artigos_de_lavanderia"); e.HasKey(x => x.Id); e.Property(x => x.Id).HasColumnName("id"); e.Property(x => x.TenantId).HasColumnName("tenant_id");
            e.Property(x => x.Nome).HasColumnName("nome").HasMaxLength(160); e.Property(x => x.NomeNormalizado).HasColumnName("nome_normalizado").HasMaxLength(160);
            e.Property(x => x.Categoria).HasColumnName("categoria").HasMaxLength(100); e.Property(x => x.Situacao).HasColumnName("situacao").HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.DataCriacao).HasColumnName("data_criacao"); e.Property(x => x.DataAtualizacao).HasColumnName("data_atualizacao"); e.Property(x => x.Versao).IsRowVersion();
            e.HasQueryFilter(x => x.TenantId == usuario.TenantId); e.HasIndex(x => new { x.TenantId, x.NomeNormalizado }).IsUnique();
        });
        b.Entity<ServicoDeLavanderia>(e =>
        {
            e.ToTable("servicos_de_lavanderia"); e.HasKey(x => x.Id); e.Property(x => x.Id).HasColumnName("id"); e.Property(x => x.TenantId).HasColumnName("tenant_id");
            e.Property(x => x.Nome).HasColumnName("nome").HasMaxLength(160); e.Property(x => x.NomeNormalizado).HasColumnName("nome_normalizado").HasMaxLength(160); e.Property(x => x.Descricao).HasColumnName("descricao").HasMaxLength(1000);
            e.Property(x => x.Situacao).HasColumnName("situacao").HasConversion<string>().HasMaxLength(20); e.Property(x => x.DataCriacao).HasColumnName("data_criacao"); e.Property(x => x.DataAtualizacao).HasColumnName("data_atualizacao"); e.Property(x => x.Versao).IsRowVersion();
            e.HasQueryFilter(x => x.TenantId == usuario.TenantId); e.HasIndex(x => new { x.TenantId, x.NomeNormalizado }).IsUnique();
        });
        b.Entity<OfertaDeServico>(e =>
        {
            e.ToTable("ofertas_de_servico"); e.HasKey(x => x.Id); e.Property(x => x.Id).HasColumnName("id"); e.Property(x => x.TenantId).HasColumnName("tenant_id");
            e.Property(x => x.ArtigoDeLavanderiaId).HasColumnName("artigo_de_lavanderia_id"); e.Property(x => x.ServicoDeLavanderiaId).HasColumnName("servico_de_lavanderia_id");
            e.Property(x => x.PrecoUnitario).HasColumnName("preco_unitario").HasPrecision(18, 2); e.Property(x => x.Situacao).HasColumnName("situacao").HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.DataCriacao).HasColumnName("data_criacao"); e.Property(x => x.DataAtualizacao).HasColumnName("data_atualizacao"); e.Property(x => x.Versao).IsRowVersion();
            e.HasQueryFilter(x => x.TenantId == usuario.TenantId); e.HasIndex(x => new { x.TenantId, x.ArtigoDeLavanderiaId, x.ServicoDeLavanderiaId }).IsUnique();
            e.HasOne(x => x.Artigo).WithMany().HasForeignKey(x => x.ArtigoDeLavanderiaId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Servico).WithMany().HasForeignKey(x => x.ServicoDeLavanderiaId).OnDelete(DeleteBehavior.Restrict);
        });
        base.OnModelCreating(b);
    }
}
