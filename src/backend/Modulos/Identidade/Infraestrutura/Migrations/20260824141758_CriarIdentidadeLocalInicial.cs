using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LavaMais.Crm.Modulos.Identidade.Infraestrutura.Migrations
{
    /// <inheritdoc />
    public partial class CriarIdentidadeLocalInicial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "identidade");

            migrationBuilder.CreateTable(
                name: "usuarios",
                schema: "identidade",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    telefone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    nome = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    senha_protegida = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    papel = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    ativo = table.Column<bool>(type: "boolean", nullable: false),
                    data_criacao = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    data_atualizacao = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    versao = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_usuarios", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "sessoes",
                schema: "identidade",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    usuario_id = table.Column<Guid>(type: "uuid", nullable: false),
                    token_hash = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    data_criacao = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    expira_em = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    data_revogacao = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sessoes", x => x.id);
                    table.ForeignKey(
                        name: "FK_sessoes_usuarios_usuario_id",
                        column: x => x.usuario_id,
                        principalSchema: "identidade",
                        principalTable: "usuarios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_sessoes_token_hash",
                schema: "identidade",
                table: "sessoes",
                column: "token_hash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_sessoes_usuario_id",
                schema: "identidade",
                table: "sessoes",
                column: "usuario_id");

            migrationBuilder.CreateIndex(
                name: "IX_usuarios_telefone",
                schema: "identidade",
                table: "usuarios",
                column: "telefone",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "sessoes",
                schema: "identidade");

            migrationBuilder.DropTable(
                name: "usuarios",
                schema: "identidade");
        }
    }
}
