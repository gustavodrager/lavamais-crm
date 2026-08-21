using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using LavaMais.Crm.Modulos.Importacoes.Dominio;
using Microsoft.EntityFrameworkCore;

namespace LavaMais.Crm.Modulos.Importacoes.Infraestrutura;

public sealed class ContextoDeImportacoes(DbContextOptions<ContextoDeImportacoes> opcoes, IContextoDoUsuario usuario) : ContextoDeModulo(opcoes)
{
    public const string Schema = "importacoes"; public const string Historico = "__historico_migrations";
    public DbSet<ImportacaoDeClientes> Importacoes => Set<ImportacaoDeClientes>();
    protected override void OnModelCreating(ModelBuilder b)
    {
        b.HasDefaultSchema(Schema);
        b.Entity<ImportacaoDeClientes>(e => { e.ToTable("importacoes_de_clientes"); e.HasKey(x => x.Id); e.Property(x => x.Id).HasColumnName("id"); e.Property(x => x.TenantId).HasColumnName("tenant_id"); e.Property(x => x.NomeArquivo).HasColumnName("nome_arquivo").HasMaxLength(255); e.Property(x => x.ConteudoArquivo).HasColumnName("conteudo_arquivo"); e.Property(x => x.UsuarioIdentidadeId).HasColumnName("usuario_identidade_id").HasMaxLength(200); e.Property(x => x.Situacao).HasColumnName("situacao").HasConversion<string>().HasMaxLength(30); e.Property(x => x.TotalLinhas).HasColumnName("total_linhas"); e.Property(x => x.TotalInseridas).HasColumnName("total_inseridas"); e.Property(x => x.TotalAtualizadas).HasColumnName("total_atualizadas"); e.Property(x => x.TotalRejeitadas).HasColumnName("total_rejeitadas"); e.Property(x => x.DataCriacao).HasColumnName("data_criacao"); e.Property(x => x.DataConclusao).HasColumnName("data_conclusao"); e.Property(x => x.Versao).HasColumnName("versao").IsConcurrencyToken(); e.HasQueryFilter(x => x.TenantId == usuario.TenantId); e.HasMany(x => x.Linhas).WithOne().HasForeignKey(x => x.ImportacaoId).OnDelete(DeleteBehavior.Cascade); });
        b.Entity<LinhaDaImportacao>(e => { e.ToTable("linhas_da_importacao"); e.HasKey(x => x.Id); e.Property(x => x.Id).HasColumnName("id"); e.Property(x => x.TenantId).HasColumnName("tenant_id"); e.Property(x => x.ImportacaoId).HasColumnName("importacao_id"); e.Property(x => x.Numero).HasColumnName("numero"); e.Property(x => x.Resultado).HasColumnName("resultado").HasConversion<string>().HasMaxLength(20); e.Property(x => x.ClienteId).HasColumnName("cliente_id"); e.Property(x => x.Erro).HasColumnName("erro").HasMaxLength(500); e.HasQueryFilter(x => x.TenantId == usuario.TenantId); e.HasIndex(x => new { x.TenantId, x.ImportacaoId, x.Numero }).IsUnique(); });
        base.OnModelCreating(b);
    }
}
