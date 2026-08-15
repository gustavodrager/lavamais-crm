using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LavaMais.Crm.Modulos.Autorizacao.Infraestrutura.Migrations
{
    /// <inheritdoc />
    public partial class CriarAutorizacaoInicial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "autorizacao");

            migrationBuilder.CreateTable(
                name: "usuarios_crm",
                schema: "autorizacao",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    usuario_identidade_id = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    papel = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    situacao = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    data_criacao = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    data_atualizacao = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_usuarios_crm", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ux_usuarios_crm_tenant_usuario",
                schema: "autorizacao",
                table: "usuarios_crm",
                columns: new[] { "tenant_id", "usuario_identidade_id" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "usuarios_crm",
                schema: "autorizacao");
        }
    }
}
