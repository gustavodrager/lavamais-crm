using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using LavaMais.Crm.Modulos.Roteiros.Dominio;
using Microsoft.EntityFrameworkCore;

namespace LavaMais.Crm.Modulos.Roteiros.Infraestrutura;

public sealed class ContextoDeRoteiros(DbContextOptions<ContextoDeRoteiros> opcoes, IContextoDoUsuario usuario) : ContextoDeModulo(opcoes)
{
    public const string Schema = "roteiros"; public const string Historico = "__historico_migrations";
    public DbSet<RoteiroDiario> Roteiros => Set<RoteiroDiario>(); public DbSet<ParadaDoRoteiro> Paradas => Set<ParadaDoRoteiro>();
    protected override void OnModelCreating(ModelBuilder b)
    {
        b.HasDefaultSchema(Schema);
        b.Entity<RoteiroDiario>(e => { e.ToTable("roteiros_diarios"); e.HasKey(x => x.Id); e.Property(x => x.Id).HasColumnName("id"); e.Property(x => x.TenantId).HasColumnName("tenant_id"); e.Property(x => x.Data).HasColumnName("data"); e.Property(x => x.NomeMotorista).HasColumnName("nome_motorista").HasMaxLength(120); e.Property(x => x.Situacao).HasColumnName("situacao").HasConversion<string>().HasMaxLength(30); e.Property(x => x.DataCriacao).HasColumnName("data_criacao"); e.Property(x => x.DataAtualizacao).HasColumnName("data_atualizacao"); e.Property(x => x.Versao).IsRowVersion(); e.HasQueryFilter(x => x.TenantId == usuario.TenantId); e.HasIndex(x => new { x.TenantId, x.Data }).IsUnique(); e.HasMany(x => x.Paradas).WithOne().HasForeignKey(x => x.RoteiroId); e.Navigation(x => x.Paradas).UsePropertyAccessMode(PropertyAccessMode.Field); });
        b.Entity<ParadaDoRoteiro>(e => { e.ToTable("paradas"); e.HasKey(x => x.Id); e.Property(x => x.Id).HasColumnName("id"); e.Property(x => x.TenantId).HasColumnName("tenant_id"); e.Property(x => x.RoteiroId).HasColumnName("roteiro_id"); e.Property(x => x.ClienteId).HasColumnName("cliente_id"); e.Property(x => x.NomeCliente).HasColumnName("nome_cliente").HasMaxLength(200); e.Property(x => x.Whatsapp).HasColumnName("whatsapp").HasMaxLength(30); e.Property(x => x.EnderecoCompleto).HasColumnName("endereco_completo").HasMaxLength(800); e.Property(x => x.Tipo).HasColumnName("tipo").HasConversion<string>().HasMaxLength(20); e.Property(x => x.Periodo).HasColumnName("periodo").HasMaxLength(80); e.Property(x => x.Observacao).HasColumnName("observacao").HasMaxLength(500); e.Property(x => x.Ordem).HasColumnName("ordem"); e.Property(x => x.Situacao).HasColumnName("situacao").HasConversion<string>().HasMaxLength(30); e.Property(x => x.DataCriacao).HasColumnName("data_criacao"); e.Property(x => x.DataInicio).HasColumnName("data_inicio"); e.Property(x => x.DataConclusao).HasColumnName("data_conclusao"); e.Property(x => x.MotivoNaoRealizacao).HasColumnName("motivo_nao_realizacao").HasMaxLength(300); e.HasQueryFilter(x => x.TenantId == usuario.TenantId); e.HasIndex(x => new { x.TenantId, x.RoteiroId, x.Ordem }).IsUnique(false); });
        base.OnModelCreating(b);
    }
}
