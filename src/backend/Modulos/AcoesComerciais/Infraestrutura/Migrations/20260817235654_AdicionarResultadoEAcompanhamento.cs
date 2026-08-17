using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LavaMais.Crm.Modulos.AcoesComerciais.Infraestrutura.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarResultadoEAcompanhamento : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "data_resultado_comercial",
                schema: "acoes_comerciais",
                table: "destinatarios_da_acao",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "resultado_comercial",
                schema: "acoes_comerciais",
                table: "destinatarios_da_acao",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "NaoInformado");

            migrationBuilder.AddColumn<string>(
                name: "usuario_resultado_id",
                schema: "acoes_comerciais",
                table: "destinatarios_da_acao",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "valor_convertido",
                schema: "acoes_comerciais",
                table: "destinatarios_da_acao",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "data_resultado_comercial",
                schema: "acoes_comerciais",
                table: "destinatarios_da_acao");

            migrationBuilder.DropColumn(
                name: "resultado_comercial",
                schema: "acoes_comerciais",
                table: "destinatarios_da_acao");

            migrationBuilder.DropColumn(
                name: "usuario_resultado_id",
                schema: "acoes_comerciais",
                table: "destinatarios_da_acao");

            migrationBuilder.DropColumn(
                name: "valor_convertido",
                schema: "acoes_comerciais",
                table: "destinatarios_da_acao");
        }
    }
}
