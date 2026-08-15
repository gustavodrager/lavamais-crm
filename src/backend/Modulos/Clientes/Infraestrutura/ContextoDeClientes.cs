using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using LavaMais.Crm.Modulos.Clientes.Dominio;
using Microsoft.EntityFrameworkCore;

namespace LavaMais.Crm.Modulos.Clientes.Infraestrutura;

public sealed class ContextoDeClientes(DbContextOptions<ContextoDeClientes> opcoes, IContextoDoUsuario usuario) : ContextoDeModulo(opcoes)
{
    public const string Schema = "clientes";
    public const string TabelaDeHistoricoDasMigrations = "__historico_migrations";
    public DbSet<Cliente> Clientes => Set<Cliente>();
    public DbSet<Etiqueta> Etiquetas => Set<Etiqueta>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.HasDefaultSchema(Schema);
        b.Entity<Cliente>(e =>
        {
            e.ToTable("clientes"); e.HasKey(x => x.Id); e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.TenantId).HasColumnName("tenant_id"); e.Property(x => x.Nome).HasColumnName("nome").HasMaxLength(200);
            e.Property(x => x.NomeFantasia).HasColumnName("nome_fantasia").HasMaxLength(200); e.Property(x => x.Tipo).HasColumnName("tipo").HasMaxLength(50);
            e.Property(x => x.DataNascimento).HasColumnName("data_nascimento"); e.Property(x => x.Situacao).HasColumnName("situacao").HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.DataCriacao).HasColumnName("data_criacao"); e.Property(x => x.DataAtualizacao).HasColumnName("data_atualizacao"); e.Property(x => x.Versao).IsRowVersion();
            e.HasQueryFilter(x => x.TenantId == usuario.TenantId);
            e.HasOne(x => x.Endereco).WithOne().HasForeignKey<EnderecoDoCliente>(x => x.ClienteId).OnDelete(DeleteBehavior.Cascade);
            e.HasMany(x => x.Contatos).WithOne().HasForeignKey(x => x.ClienteId).OnDelete(DeleteBehavior.Cascade);
            e.HasMany(x => x.Permissoes).WithOne().HasForeignKey(x => x.ClienteId).OnDelete(DeleteBehavior.Cascade);
            e.HasMany(x => x.Etiquetas).WithOne().HasForeignKey(x => x.ClienteId).OnDelete(DeleteBehavior.Cascade);
        });
        b.Entity<ContatoDoCliente>(e =>
        {
            e.ToTable("contatos_do_cliente"); e.HasKey(x => x.Id); e.Property(x => x.Id).HasColumnName("id"); e.Property(x => x.TenantId).HasColumnName("tenant_id");
            e.Property(x => x.ClienteId).HasColumnName("cliente_id"); e.Property(x => x.Tipo).HasColumnName("tipo").HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.Valor).HasColumnName("valor").HasMaxLength(254); e.Property(x => x.ValorNormalizado).HasColumnName("valor_normalizado").HasMaxLength(254);
            e.Property(x => x.Situacao).HasColumnName("situacao").HasConversion<string>().HasMaxLength(20); e.HasQueryFilter(x => x.TenantId == usuario.TenantId);
            e.HasIndex(x => new { x.TenantId, x.ValorNormalizado }).IsUnique().HasFilter("tipo = 'Whatsapp' AND situacao = 'Ativo'").HasDatabaseName("ux_whatsapp_ativo_por_tenant");
        });
        b.Entity<EnderecoDoCliente>(e =>
        {
            e.ToTable("enderecos_do_cliente"); e.HasKey(x => x.Id); e.Property(x => x.Id).HasColumnName("id"); e.Property(x => x.TenantId).HasColumnName("tenant_id"); e.Property(x => x.ClienteId).HasColumnName("cliente_id");
            e.Property(x => x.Logradouro).HasColumnName("logradouro").HasMaxLength(200); e.Property(x => x.Numero).HasColumnName("numero").HasMaxLength(30); e.Property(x => x.Complemento).HasColumnName("complemento").HasMaxLength(100);
            e.Property(x => x.Bairro).HasColumnName("bairro").HasMaxLength(100); e.Property(x => x.Cidade).HasColumnName("cidade").HasMaxLength(100); e.Property(x => x.Estado).HasColumnName("estado").HasMaxLength(2); e.Property(x => x.Cep).HasColumnName("cep").HasMaxLength(8);
            e.HasQueryFilter(x => x.TenantId == usuario.TenantId);
        });
        b.Entity<PermissaoDeComunicacao>(e =>
        {
            e.ToTable("permissoes_de_comunicacao"); e.HasKey(x => x.Id); e.Property(x => x.Id).HasColumnName("id"); e.Property(x => x.TenantId).HasColumnName("tenant_id"); e.Property(x => x.ClienteId).HasColumnName("cliente_id");
            e.Property(x => x.Canal).HasColumnName("canal").HasConversion<string>().HasMaxLength(20); e.Property(x => x.Finalidade).HasColumnName("finalidade").HasMaxLength(30); e.Property(x => x.Permitida).HasColumnName("permitida"); e.Property(x => x.DataAtualizacao).HasColumnName("data_atualizacao");
            e.HasQueryFilter(x => x.TenantId == usuario.TenantId); e.HasIndex(x => new { x.TenantId, x.ClienteId, x.Canal, x.Finalidade }).IsUnique();
        });
        b.Entity<Etiqueta>(e =>
        {
            e.ToTable("etiquetas"); e.HasKey(x => x.Id); e.Property(x => x.Id).HasColumnName("id"); e.Property(x => x.TenantId).HasColumnName("tenant_id"); e.Property(x => x.Nome).HasColumnName("nome").HasMaxLength(80); e.Property(x => x.NomeNormalizado).HasColumnName("nome_normalizado").HasMaxLength(80); e.Property(x => x.DataCriacao).HasColumnName("data_criacao"); e.HasQueryFilter(x => x.TenantId == usuario.TenantId); e.HasIndex(x => new { x.TenantId, x.NomeNormalizado }).IsUnique();
        });
        b.Entity<ClienteEtiqueta>(e =>
        {
            e.ToTable("clientes_etiquetas"); e.HasKey(x => new { x.ClienteId, x.EtiquetaId }); e.Property(x => x.TenantId).HasColumnName("tenant_id"); e.Property(x => x.ClienteId).HasColumnName("cliente_id"); e.Property(x => x.EtiquetaId).HasColumnName("etiqueta_id"); e.HasQueryFilter(x => x.TenantId == usuario.TenantId); e.HasOne<Etiqueta>().WithMany().HasForeignKey(x => x.EtiquetaId).OnDelete(DeleteBehavior.Restrict);
        });
        base.OnModelCreating(b);
    }
}
