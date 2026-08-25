using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using LavaMais.Crm.Modulos.AcoesComerciais.Infraestrutura;
using LavaMais.Crm.Modulos.Auditoria.Infraestrutura;
using LavaMais.Crm.Modulos.Autorizacao.Infraestrutura;
using LavaMais.Crm.Modulos.Catalogo.Infraestrutura;
using LavaMais.Crm.Modulos.Clientes.Infraestrutura;
using LavaMais.Crm.Modulos.Importacoes.Infraestrutura;
using LavaMais.Crm.Modulos.Integracoes.Infraestrutura;
using LavaMais.Crm.Modulos.Identidade.Infraestrutura;
using LavaMais.Crm.Modulos.ModelosDeMensagem.Infraestrutura;
using LavaMais.Crm.Modulos.MovimentacoesComerciais.Infraestrutura;
using Microsoft.EntityFrameworkCore;
using Npgsql;

var conexao = ConfiguracaoPostgres.ObterStringDeConexaoParaFerramentas();
var usuario = new ContextoDeMigracao();

await Migrar(new ContextoDeIdentidade(Opcoes<ContextoDeIdentidade>(conexao, ContextoDeIdentidade.Historico, ContextoDeIdentidade.Schema)));
await Migrar(new ContextoDeAutorizacao(Opcoes<ContextoDeAutorizacao>(conexao, ContextoDeAutorizacao.TabelaDeHistoricoDasMigrations, ContextoDeAutorizacao.Schema), usuario));
await Migrar(new ContextoDeClientes(Opcoes<ContextoDeClientes>(conexao, ContextoDeClientes.TabelaDeHistoricoDasMigrations, ContextoDeClientes.Schema), usuario));
await Migrar(new ContextoDeCatalogo(Opcoes<ContextoDeCatalogo>(conexao, ContextoDeCatalogo.Historico, ContextoDeCatalogo.Schema), usuario));
await Migrar(new ContextoDeModelos(Opcoes<ContextoDeModelos>(conexao, ContextoDeModelos.Historico, ContextoDeModelos.Schema), usuario));
await Migrar(new ContextoDeAcoesComerciais(Opcoes<ContextoDeAcoesComerciais>(conexao, ContextoDeAcoesComerciais.Historico, ContextoDeAcoesComerciais.Schema), usuario));
await Migrar(new ContextoDeMovimentacoesComerciais(Opcoes<ContextoDeMovimentacoesComerciais>(conexao, ContextoDeMovimentacoesComerciais.Historico, ContextoDeMovimentacoesComerciais.Schema), usuario));
await Migrar(new ContextoDeImportacoes(Opcoes<ContextoDeImportacoes>(conexao, ContextoDeImportacoes.Historico, ContextoDeImportacoes.Schema), usuario));
await Migrar(new ContextoDeAuditoria(Opcoes<ContextoDeAuditoria>(conexao, ContextoDeAuditoria.Historico, ContextoDeAuditoria.Schema), usuario));
await Migrar(new ContextoDeIntegracoes(Opcoes<ContextoDeIntegracoes>(conexao, ContextoDeIntegracoes.Historico, ContextoDeIntegracoes.Schema), usuario));

var scriptSessoes = await File.ReadAllTextAsync(Path.Combine(AppContext.BaseDirectory, "postgresql", "001-sessoes-web.sql"));
await using var banco = new NpgsqlConnection(conexao); await banco.OpenAsync();
await using var comando = new NpgsqlCommand(scriptSessoes, banco); await comando.ExecuteNonQueryAsync();
Console.WriteLine("Migrations e schema tecnico aplicados com sucesso.");

static DbContextOptions<T> Opcoes<T>(string conexao, string historico, string schema) where T : DbContext =>
    new DbContextOptionsBuilder<T>().UseNpgsql(conexao, postgres => postgres.MigrationsHistoryTable(historico, schema)).Options;
static async Task Migrar(DbContext contexto) { await using (contexto) await contexto.Database.MigrateAsync(); }
file sealed class ContextoDeMigracao : IContextoDoUsuario { public bool Autenticado => false; public Guid TenantId => Guid.Empty; public string UsuarioIdentidadeId => "migrador"; }
