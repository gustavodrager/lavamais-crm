using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using LavaMais.Crm.Modulos.ModelosDeMensagem.Dominio;
using Microsoft.EntityFrameworkCore;

namespace LavaMais.Crm.Modulos.ModelosDeMensagem.Infraestrutura;

public sealed class ContextoDeModelos(DbContextOptions<ContextoDeModelos> opcoes, IContextoDoUsuario usuario) : ContextoDeModulo(opcoes)
{
    public const string Schema = "comunicacao";
    public const string Historico = "__historico_migrations";
    public DbSet<ModeloDeMensagem> Modelos => Set<ModeloDeMensagem>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.HasDefaultSchema(Schema);
        b.Entity<ModeloDeMensagem>(e =>
        {
            e.ToTable("modelos_de_mensagem"); e.HasKey(x => x.Id); e.Property(x => x.Id).HasColumnName("id"); e.Property(x => x.TenantId).HasColumnName("tenant_id");
            e.Property(x => x.Nome).HasColumnName("nome").HasMaxLength(160); e.Property(x => x.NomeNormalizado).HasColumnName("nome_normalizado").HasMaxLength(160);
            e.Property(x => x.Canal).HasColumnName("canal").HasConversion<string>().HasMaxLength(20); e.Property(x => x.Situacao).HasColumnName("situacao").HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.VersaoAtualId).HasColumnName("versao_atual_id"); e.Property(x => x.DataCriacao).HasColumnName("data_criacao"); e.Property(x => x.DataAtualizacao).HasColumnName("data_atualizacao"); e.Property(x => x.Versao).IsRowVersion();
            e.HasQueryFilter(x => x.TenantId == usuario.TenantId); e.HasIndex(x => new { x.TenantId, x.NomeNormalizado }).IsUnique();
            e.HasMany(x => x.Versoes).WithOne().HasForeignKey(x => x.ModeloId).OnDelete(DeleteBehavior.Restrict);
        });
        b.Entity<VersaoDoModelo>(e =>
        {
            e.ToTable("versoes_dos_modelos"); e.HasKey(x => x.Id); e.Property(x => x.Id).HasColumnName("id"); e.Property(x => x.TenantId).HasColumnName("tenant_id");
            e.Property(x => x.ModeloId).HasColumnName("modelo_id"); e.Property(x => x.Numero).HasColumnName("numero"); e.Property(x => x.ConteudoPreVisualizacao).HasColumnName("conteudo_pre_visualizacao").HasMaxLength(2000);
            e.Property(x => x.Variaveis).HasColumnName("variaveis").HasColumnType("text[]"); e.Property(x => x.DataPublicacao).HasColumnName("data_publicacao");
            e.HasQueryFilter(x => x.TenantId == usuario.TenantId); e.HasIndex(x => new { x.TenantId, x.ModeloId, x.Numero }).IsUnique();
        });
        base.OnModelCreating(b);
    }
}
