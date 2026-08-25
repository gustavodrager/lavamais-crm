using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LavaMais.Crm.Modulos.MovimentacoesComerciais.Infraestrutura.Migrations
{
    /// <inheritdoc />
    public partial class CriarMovimentacoesComerciais : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "movimentacoes_comerciais");

            migrationBuilder.CreateTable(
                name: "movimentacoes",
                schema: "movimentacoes_comerciais",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    cliente_id = table.Column<Guid>(type: "uuid", nullable: false),
                    nome_cliente_snapshot = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    item_de_catalogo_id = table.Column<Guid>(type: "uuid", nullable: false),
                    nome_item_snapshot = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    valor_total = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    data_movimentacao = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    codigo_externo = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    observacao = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    origem = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    situacao = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    usuario_registro_id = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    data_criacao = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    usuario_cancelamento_id = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    data_cancelamento = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    motivo_cancelamento = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_movimentacoes", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_movimentacoes_tenant_id_cliente_id_data_movimentacao",
                schema: "movimentacoes_comerciais",
                table: "movimentacoes",
                columns: new[] { "tenant_id", "cliente_id", "data_movimentacao" });

            migrationBuilder.CreateIndex(
                name: "IX_movimentacoes_tenant_id_codigo_externo",
                schema: "movimentacoes_comerciais",
                table: "movimentacoes",
                columns: new[] { "tenant_id", "codigo_externo" },
                unique: true,
                filter: "codigo_externo IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_movimentacoes_tenant_id_data_movimentacao",
                schema: "movimentacoes_comerciais",
                table: "movimentacoes",
                columns: new[] { "tenant_id", "data_movimentacao" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "movimentacoes",
                schema: "movimentacoes_comerciais");
        }
    }
}
