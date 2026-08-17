using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using LavaMais.Crm.Modulos.Integracoes.Dominio;
using Microsoft.EntityFrameworkCore;

namespace LavaMais.Crm.Modulos.Integracoes.Infraestrutura;

public sealed class ContextoDeIntegracoes(DbContextOptions<ContextoDeIntegracoes> opcoes, IContextoDoUsuario usuario) : ContextoDeModulo(opcoes)
{
    public const string Schema = "integracoes"; public const string Historico = "__historico_migrations"; public DbSet<MensagemDaOutbox> Mensagens => Set<MensagemDaOutbox>();
    protected override void OnModelCreating(ModelBuilder b) { b.HasDefaultSchema(Schema); b.Entity<MensagemDaOutbox>(e => { e.ToTable("mensagens_da_outbox"); e.HasKey(x => x.Id); e.Property(x => x.Id).HasColumnName("id"); e.Property(x => x.TenantId).HasColumnName("tenant_id"); e.Property(x => x.Tipo).HasColumnName("tipo").HasMaxLength(100); e.Property(x => x.ChaveUnica).HasColumnName("chave_unica").HasMaxLength(300); e.Property(x => x.ConteudoJson).HasColumnName("conteudo_json").HasColumnType("jsonb"); e.Property(x => x.Situacao).HasColumnName("situacao").HasConversion<string>().HasMaxLength(20); e.Property(x => x.Tentativas).HasColumnName("tentativas"); e.Property(x => x.DataCriacao).HasColumnName("data_criacao"); e.Property(x => x.DisponivelEm).HasColumnName("disponivel_em"); e.Property(x => x.ProcessandoAte).HasColumnName("processando_ate"); e.Property(x => x.DataConclusao).HasColumnName("data_conclusao"); e.Property(x => x.UltimoErro).HasColumnName("ultimo_erro").HasMaxLength(500); e.Property(x => x.Versao).IsRowVersion(); e.HasQueryFilter(x => x.TenantId == usuario.TenantId); e.HasIndex(x => x.ChaveUnica).IsUnique(); e.HasIndex(x => new { x.Situacao, x.DisponivelEm }); }); base.OnModelCreating(b); }
}
