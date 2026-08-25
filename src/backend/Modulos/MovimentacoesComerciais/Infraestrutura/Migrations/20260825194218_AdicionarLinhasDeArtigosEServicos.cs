using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LavaMais.Crm.Modulos.MovimentacoesComerciais.Infraestrutura.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarLinhasDeArtigosEServicos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Guid>(
                name: "item_de_catalogo_id",
                schema: "movimentacoes_comerciais",
                table: "movimentacoes",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<string>(
                name: "nome_item_snapshot",
                schema: "movimentacoes_comerciais",
                table: "movimentacoes",
                type: "character varying(160)",
                maxLength: 160,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(160)",
                oldMaxLength: 160);

            migrationBuilder.CreateTable(
                name: "linhas_da_movimentacao",
                schema: "movimentacoes_comerciais",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    movimentacao_comercial_id = table.Column<Guid>(type: "uuid", nullable: false),
                    oferta_de_servico_id = table.Column<Guid>(type: "uuid", nullable: false),
                    artigo_de_lavanderia_id = table.Column<Guid>(type: "uuid", nullable: false),
                    nome_artigo_snapshot = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    servico_de_lavanderia_id = table.Column<Guid>(type: "uuid", nullable: false),
                    nome_servico_snapshot = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    quantidade = table.Column<int>(type: "integer", nullable: false),
                    preco_tabela_snapshot = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    preco_unitario_praticado = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    subtotal = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_linhas_da_movimentacao", x => x.id);
                    table.ForeignKey(
                        name: "FK_linhas_da_movimentacao_movimentacoes_movimentacao_comercial~",
                        column: x => x.movimentacao_comercial_id,
                        principalSchema: "movimentacoes_comerciais",
                        principalTable: "movimentacoes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_linhas_da_movimentacao_movimentacao_comercial_id",
                schema: "movimentacoes_comerciais",
                table: "linhas_da_movimentacao",
                column: "movimentacao_comercial_id");

            migrationBuilder.CreateIndex(
                name: "IX_linhas_da_movimentacao_tenant_id_movimentacao_comercial_id_~",
                schema: "movimentacoes_comerciais",
                table: "linhas_da_movimentacao",
                columns: new[] { "tenant_id", "movimentacao_comercial_id", "oferta_de_servico_id" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "linhas_da_movimentacao",
                schema: "movimentacoes_comerciais");

            migrationBuilder.Sql("UPDATE movimentacoes_comerciais.movimentacoes SET item_de_catalogo_id = '00000000-0000-0000-0000-000000000000' WHERE item_de_catalogo_id IS NULL;");
            migrationBuilder.Sql("UPDATE movimentacoes_comerciais.movimentacoes SET nome_item_snapshot = '' WHERE nome_item_snapshot IS NULL;");

            migrationBuilder.AlterColumn<Guid>(
                name: "item_de_catalogo_id",
                schema: "movimentacoes_comerciais",
                table: "movimentacoes",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "nome_item_snapshot",
                schema: "movimentacoes_comerciais",
                table: "movimentacoes",
                type: "character varying(160)",
                maxLength: 160,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(160)",
                oldMaxLength: 160,
                oldNullable: true);

        }
    }
}
