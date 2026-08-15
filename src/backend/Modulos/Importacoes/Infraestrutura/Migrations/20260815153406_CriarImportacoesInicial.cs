using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LavaMais.Crm.Modulos.Importacoes.Infraestrutura.Migrations
{
    /// <inheritdoc />
    public partial class CriarImportacoesInicial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "importacoes");

            migrationBuilder.CreateTable(
                name: "importacoes_de_clientes",
                schema: "importacoes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    nome_arquivo = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    caminho_temporario = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    usuario_identidade_id = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    situacao = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    total_linhas = table.Column<int>(type: "integer", nullable: false),
                    total_inseridas = table.Column<int>(type: "integer", nullable: false),
                    total_rejeitadas = table.Column<int>(type: "integer", nullable: false),
                    data_criacao = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    data_conclusao = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    versao = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_importacoes_de_clientes", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "linhas_da_importacao",
                schema: "importacoes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    importacao_id = table.Column<Guid>(type: "uuid", nullable: false),
                    numero = table.Column<int>(type: "integer", nullable: false),
                    resultado = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    cliente_id = table.Column<Guid>(type: "uuid", nullable: true),
                    erro = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_linhas_da_importacao", x => x.id);
                    table.ForeignKey(
                        name: "FK_linhas_da_importacao_importacoes_de_clientes_importacao_id",
                        column: x => x.importacao_id,
                        principalSchema: "importacoes",
                        principalTable: "importacoes_de_clientes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_linhas_da_importacao_importacao_id",
                schema: "importacoes",
                table: "linhas_da_importacao",
                column: "importacao_id");

            migrationBuilder.CreateIndex(
                name: "IX_linhas_da_importacao_tenant_id_importacao_id_numero",
                schema: "importacoes",
                table: "linhas_da_importacao",
                columns: new[] { "tenant_id", "importacao_id", "numero" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "linhas_da_importacao",
                schema: "importacoes");

            migrationBuilder.DropTable(
                name: "importacoes_de_clientes",
                schema: "importacoes");
        }
    }
}
