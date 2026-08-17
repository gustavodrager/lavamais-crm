using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LavaMais.Crm.Modulos.AcoesComerciais.Infraestrutura.Migrations
{
    /// <inheritdoc />
    public partial class CriarRascunhosDeAcoesComerciais : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "acoes_comerciais");

            migrationBuilder.CreateTable(
                name: "acoes_comerciais",
                schema: "acoes_comerciais",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    nome = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    objetivo = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    item_de_catalogo_id = table.Column<Guid>(type: "uuid", nullable: false),
                    versao_modelo_id = table.Column<Guid>(type: "uuid", nullable: true),
                    criterios_segmentacao_json = table.Column<string>(type: "jsonb", nullable: false),
                    situacao = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    usuario_criacao_id = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    data_criacao = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    data_atualizacao = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_acoes_comerciais", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_acoes_comerciais_tenant_id_situacao",
                schema: "acoes_comerciais",
                table: "acoes_comerciais",
                columns: new[] { "tenant_id", "situacao" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "acoes_comerciais",
                schema: "acoes_comerciais");
        }
    }
}
