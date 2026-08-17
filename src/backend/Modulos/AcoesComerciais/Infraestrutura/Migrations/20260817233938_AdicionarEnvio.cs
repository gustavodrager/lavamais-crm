using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LavaMais.Crm.Modulos.AcoesComerciais.Infraestrutura.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarEnvio : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "data_ultima_reconciliacao",
                schema: "acoes_comerciais",
                table: "destinatarios_da_acao",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "notificacao_externa_id",
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
                defaultValue: "");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "data_inicio_processamento",
                schema: "acoes_comerciais",
                table: "acoes_comerciais",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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
                name: "data_ultima_reconciliacao",
                schema: "acoes_comerciais",
                table: "destinatarios_da_acao");

            migrationBuilder.DropColumn(
                name: "notificacao_externa_id",
                schema: "acoes_comerciais",
                table: "destinatarios_da_acao");

            migrationBuilder.DropColumn(
                name: "payload_notificacao_json",
                schema: "acoes_comerciais",
                table: "destinatarios_da_acao");

            migrationBuilder.DropColumn(
                name: "data_inicio_processamento",
                schema: "acoes_comerciais",
                table: "acoes_comerciais");
        }
    }
}
