using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LavaMais.Crm.Modulos.AcoesComerciais.Infraestrutura.Migrations
{
    /// <inheritdoc />
    public partial class AdotarEnvioAssistidoWhatsappWeb : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                UPDATE acoes_comerciais.destinatarios_da_acao
                SET situacao_envio = CASE
                    WHEN situacao_envio IN ('Enviado', 'Entregue', 'Lido') THEN 'Enviado'
                    ELSE 'Pendente'
                END;

                UPDATE acoes_comerciais.acoes_comerciais AS acao
                SET situacao = 'EmProcessamento'
                WHERE acao.situacao = 'ConcluidaComFalhas'
                  AND EXISTS (
                      SELECT 1
                      FROM acoes_comerciais.destinatarios_da_acao AS destinatario
                      WHERE destinatario.acao_comercial_id = acao.id
                        AND destinatario.situacao_envio = 'Pendente');
                """);

            migrationBuilder.DropColumn(
                name: "chave_idempotencia",
                schema: "acoes_comerciais",
                table: "destinatarios_da_acao");

            migrationBuilder.DropColumn(
                name: "chave_template_notificacao_snapshot",
                schema: "acoes_comerciais",
                table: "destinatarios_da_acao");

            migrationBuilder.DropColumn(
                name: "codigo_falha",
                schema: "acoes_comerciais",
                table: "destinatarios_da_acao");

            migrationBuilder.DropColumn(
                name: "notificacao_id",
                schema: "acoes_comerciais",
                table: "destinatarios_da_acao");

            migrationBuilder.DropColumn(
                name: "payload_notificacao_json",
                schema: "acoes_comerciais",
                table: "destinatarios_da_acao");

            migrationBuilder.DropColumn(
                name: "servico_notificacao",
                schema: "acoes_comerciais",
                table: "destinatarios_da_acao");

            migrationBuilder.DropColumn(
                name: "data_ultima_reconciliacao",
                schema: "acoes_comerciais",
                table: "destinatarios_da_acao");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "data_envio_confirmado",
                schema: "acoes_comerciais",
                table: "destinatarios_da_acao",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "usuario_envio_confirmado_id",
                schema: "acoes_comerciais",
                table: "destinatarios_da_acao",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "usuario_envio_confirmado_id",
                schema: "acoes_comerciais",
                table: "destinatarios_da_acao");

            migrationBuilder.DropColumn(
                name: "data_envio_confirmado",
                schema: "acoes_comerciais",
                table: "destinatarios_da_acao");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "data_ultima_reconciliacao",
                schema: "acoes_comerciais",
                table: "destinatarios_da_acao",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "chave_idempotencia",
                schema: "acoes_comerciais",
                table: "destinatarios_da_acao",
                type: "character varying(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "chave_template_notificacao_snapshot",
                schema: "acoes_comerciais",
                table: "destinatarios_da_acao",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "codigo_falha",
                schema: "acoes_comerciais",
                table: "destinatarios_da_acao",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "notificacao_id",
                schema: "acoes_comerciais",
                table: "destinatarios_da_acao",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "payload_notificacao_json",
                schema: "acoes_comerciais",
                table: "destinatarios_da_acao",
                type: "jsonb",
                nullable: false,
                defaultValueSql: "'{}'::jsonb");

            migrationBuilder.AddColumn<string>(
                name: "servico_notificacao",
                schema: "acoes_comerciais",
                table: "destinatarios_da_acao",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);
        }
    }
}
