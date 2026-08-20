using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LavaMais.Crm.Modulos.AcoesComerciais.Infraestrutura.Migrations
{
    /// <inheritdoc />
    public partial class MigrarEnvioIndividual : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE acoes_comerciais.destinatarios_da_acao
                SET situacao_envio = 'AguardandoSolicitacao'
                WHERE situacao_envio = 'Pendente'
                  AND chave_idempotencia IS NOT NULL;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE acoes_comerciais.destinatarios_da_acao
                SET situacao_envio = 'Pendente'
                WHERE situacao_envio = 'AguardandoSolicitacao'
                  AND notificacao_externa_id IS NULL;
                """);
        }
    }
}
