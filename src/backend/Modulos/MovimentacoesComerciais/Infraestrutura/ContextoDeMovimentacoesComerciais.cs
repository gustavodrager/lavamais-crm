using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using LavaMais.Crm.Modulos.MovimentacoesComerciais.Dominio;
using Microsoft.EntityFrameworkCore;

namespace LavaMais.Crm.Modulos.MovimentacoesComerciais.Infraestrutura;

public sealed class ContextoDeMovimentacoesComerciais(DbContextOptions<ContextoDeMovimentacoesComerciais> opcoes, IContextoDoUsuario usuario) : ContextoDeModulo(opcoes)
{
    public const string Schema = "movimentacoes_comerciais";
    public const string Historico = "__historico_migrations";
    public DbSet<MovimentacaoComercial> Movimentacoes => Set<MovimentacaoComercial>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.HasDefaultSchema(Schema);
        b.Entity<MovimentacaoComercial>(e =>
        {
            e.ToTable("movimentacoes"); e.HasKey(x => x.Id); e.Property(x => x.Id).HasColumnName("id"); e.Property(x => x.TenantId).HasColumnName("tenant_id");
            e.Property(x => x.ClienteId).HasColumnName("cliente_id"); e.Property(x => x.NomeClienteSnapshot).HasColumnName("nome_cliente_snapshot").HasMaxLength(200);
            e.Property(x => x.ItemDeCatalogoId).HasColumnName("item_de_catalogo_id"); e.Property(x => x.NomeItemSnapshot).HasColumnName("nome_item_snapshot").HasMaxLength(160);
            e.Property(x => x.ValorTotal).HasColumnName("valor_total").HasPrecision(18, 2); e.Property(x => x.DataMovimentacao).HasColumnName("data_movimentacao");
            e.Property(x => x.CodigoExterno).HasColumnName("codigo_externo").HasMaxLength(100); e.Property(x => x.Observacao).HasColumnName("observacao").HasMaxLength(500);
            e.Property(x => x.Origem).HasColumnName("origem").HasConversion<string>().HasMaxLength(30); e.Property(x => x.Situacao).HasColumnName("situacao").HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.UsuarioRegistroId).HasColumnName("usuario_registro_id").HasMaxLength(200); e.Property(x => x.DataCriacao).HasColumnName("data_criacao");
            e.Property(x => x.UsuarioCancelamentoId).HasColumnName("usuario_cancelamento_id").HasMaxLength(200); e.Property(x => x.DataCancelamento).HasColumnName("data_cancelamento"); e.Property(x => x.MotivoCancelamento).HasColumnName("motivo_cancelamento").HasMaxLength(300);
            e.Property(x => x.Versao).IsRowVersion(); e.HasQueryFilter(x => x.TenantId == usuario.TenantId);
            e.HasIndex(x => new { x.TenantId, x.DataMovimentacao }); e.HasIndex(x => new { x.TenantId, x.ClienteId, x.DataMovimentacao });
            e.HasIndex(x => new { x.TenantId, x.CodigoExterno }).IsUnique().HasFilter("codigo_externo IS NOT NULL");
        });
        base.OnModelCreating(b);
    }
}
