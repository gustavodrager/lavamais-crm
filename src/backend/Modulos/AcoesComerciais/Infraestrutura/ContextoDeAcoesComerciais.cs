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
            e.Property(x => x.NomeItemSnapshot).HasColumnName("nome_item_snapshot").HasMaxLength(160);
            e.Property(x => x.CriteriosSegmentacaoJson).HasColumnName("criterios_segmentacao_json").HasColumnType("jsonb"); e.Property(x => x.Situacao).HasColumnName("situacao").HasConversion<string>().HasMaxLength(30);
            e.Property(x => x.UsuarioCriacaoId).HasColumnName("usuario_criacao_id").HasMaxLength(200); e.Property(x => x.DataCriacao).HasColumnName("data_criacao"); e.Property(x => x.DataAtualizacao).HasColumnName("data_atualizacao"); e.Property(x => x.DataPreparacao).HasColumnName("data_preparacao"); e.Property(x => x.DataInicioProcessamento).HasColumnName("data_inicio_processamento"); e.Property(x => x.QuantidadeDestinatarios).HasColumnName("quantidade_destinatarios"); e.Property(x => x.Versao).IsRowVersion();
            e.HasQueryFilter(x => x.TenantId == usuario.TenantId); e.HasIndex(x => new { x.TenantId, x.Situacao }); e.HasMany(x => x.Destinatarios).WithOne().HasForeignKey(x => x.AcaoComercialId).OnDelete(DeleteBehavior.Cascade);
        });
        b.Entity<DestinatarioDaAcao>(e =>
        {
            e.ToTable("destinatarios_da_acao"); e.HasKey(x => x.Id); e.Property(x => x.Id).HasColumnName("id"); e.Property(x => x.TenantId).HasColumnName("tenant_id"); e.Property(x => x.AcaoComercialId).HasColumnName("acao_comercial_id"); e.Property(x => x.ClienteId).HasColumnName("cliente_id");
            e.Property(x => x.NomeClienteSnapshot).HasColumnName("nome_cliente_snapshot").HasMaxLength(200); e.Property(x => x.DestinoSnapshot).HasColumnName("destino_snapshot").HasMaxLength(30); e.Property(x => x.ConteudoPreVisualizacaoSnapshot).HasColumnName("conteudo_pre_visualizacao_snapshot").HasMaxLength(2000); e.Property(x => x.SituacaoEnvio).HasColumnName("situacao_envio").HasConversion<string>().HasMaxLength(30); e.Property(x => x.Versao).IsRowVersion();
            e.Property(x => x.ChaveTemplateNotificacaoSnapshot).HasColumnName("chave_template_notificacao_snapshot").HasMaxLength(200); e.Property(x => x.PayloadNotificacaoJson).HasColumnName("payload_notificacao_json").HasColumnType("jsonb"); e.Property(x => x.ChaveIdempotencia).HasColumnName("chave_idempotencia").HasMaxLength(300); e.Property(x => x.NotificacaoExternaId).HasColumnName("notificacao_externa_id").HasMaxLength(100); e.Property(x => x.DataUltimaReconciliacao).HasColumnName("data_ultima_reconciliacao"); e.Property(x => x.CodigoFalha).HasColumnName("codigo_falha").HasMaxLength(100);
            e.HasQueryFilter(x => x.TenantId == usuario.TenantId); e.HasIndex(x => new { x.TenantId, x.AcaoComercialId, x.ClienteId }).IsUnique();
        });
        base.OnModelCreating(b);
    }
}
