using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LavaMais.Crm.Modulos.AcoesComerciais.Infraestrutura.Migrations
{
    /// <inheritdoc />
    public partial class PrepararAudiencia : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "data_preparacao",
                schema: "acoes_comerciais",
                table: "acoes_comerciais",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "nome_item_snapshot",
                schema: "acoes_comerciais",
                table: "acoes_comerciais",
                type: "character varying(160)",
                maxLength: 160,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "quantidade_destinatarios",
                schema: "acoes_comerciais",
                table: "acoes_comerciais",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "destinatarios_da_acao",
                schema: "acoes_comerciais",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    acao_comercial_id = table.Column<Guid>(type: "uuid", nullable: false),
                    cliente_id = table.Column<Guid>(type: "uuid", nullable: false),
                    nome_cliente_snapshot = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    destino_snapshot = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    conteudo_pre_visualizacao_snapshot = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    situacao_envio = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_destinatarios_da_acao", x => x.id);
                    table.ForeignKey(
                        name: "FK_destinatarios_da_acao_acoes_comerciais_acao_comercial_id",
                        column: x => x.acao_comercial_id,
                        principalSchema: "acoes_comerciais",
                        principalTable: "acoes_comerciais",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_destinatarios_da_acao_acao_comercial_id",
                schema: "acoes_comerciais",
                table: "destinatarios_da_acao",
                column: "acao_comercial_id");

            migrationBuilder.CreateIndex(
                name: "IX_destinatarios_da_acao_tenant_id_acao_comercial_id_cliente_id",
                schema: "acoes_comerciais",
                table: "destinatarios_da_acao",
                columns: new[] { "tenant_id", "acao_comercial_id", "cliente_id" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "destinatarios_da_acao",
                schema: "acoes_comerciais");

            migrationBuilder.DropColumn(
                name: "data_preparacao",
                schema: "acoes_comerciais",
                table: "acoes_comerciais");

            migrationBuilder.DropColumn(
                name: "nome_item_snapshot",
                schema: "acoes_comerciais",
                table: "acoes_comerciais");

            migrationBuilder.DropColumn(
                name: "quantidade_destinatarios",
                schema: "acoes_comerciais",
                table: "acoes_comerciais");
        }
    }
}
