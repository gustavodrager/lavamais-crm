using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LavaMais.Crm.Modulos.Auditoria.Infraestrutura.Migrations
{
    /// <inheritdoc />
    public partial class CriarAuditoriaInicial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "auditoria");

            migrationBuilder.CreateTable(
                name: "registros_de_auditoria",
                schema: "auditoria",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    usuario_identidade_id = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    tipo = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    recurso = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    recurso_id = table.Column<Guid>(type: "uuid", nullable: false),
                    dados_json = table.Column<string>(type: "jsonb", nullable: false),
                    data = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_registros_de_auditoria", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_registros_de_auditoria_tenant_id_recurso_recurso_id",
                schema: "auditoria",
                table: "registros_de_auditoria",
                columns: new[] { "tenant_id", "recurso", "recurso_id" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "registros_de_auditoria",
                schema: "auditoria");
        }
    }
}
