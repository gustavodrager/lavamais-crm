using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LavaMais.Crm.Modulos.AcoesComerciais.Infraestrutura.Migrations
{
    /// <inheritdoc />
    public partial class PrepararOrigemDaNotificacao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "notificacao_externa_id",
                schema: "acoes_comerciais",
                table: "destinatarios_da_acao",
                newName: "notificacao_id");

            migrationBuilder.AddColumn<string>(
                name: "servico_notificacao",
                schema: "acoes_comerciais",
                table: "destinatarios_da_acao",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.Sql(
                "UPDATE acoes_comerciais.destinatarios_da_acao SET servico_notificacao = 'Central' WHERE notificacao_id IS NOT NULL;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "servico_notificacao",
                schema: "acoes_comerciais",
                table: "destinatarios_da_acao");

            migrationBuilder.RenameColumn(
                name: "notificacao_id",
                schema: "acoes_comerciais",
                table: "destinatarios_da_acao",
                newName: "notificacao_externa_id");
        }
    }
}
