using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LavaMais.Crm.Modulos.Catalogo.Infraestrutura.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarDadosDeOrigemDoCatalogo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "codigo_externo",
                schema: "catalogo",
                table: "itens_de_catalogo",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "data_cadastro_origem",
                schema: "catalogo",
                table: "itens_de_catalogo",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_itens_de_catalogo_tenant_id_codigo_externo",
                schema: "catalogo",
                table: "itens_de_catalogo",
                columns: new[] { "tenant_id", "codigo_externo" },
                unique: true,
                filter: "codigo_externo IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_itens_de_catalogo_tenant_id_codigo_externo",
                schema: "catalogo",
                table: "itens_de_catalogo");

            migrationBuilder.DropColumn(
                name: "codigo_externo",
                schema: "catalogo",
                table: "itens_de_catalogo");

            migrationBuilder.DropColumn(
                name: "data_cadastro_origem",
                schema: "catalogo",
                table: "itens_de_catalogo");
        }
    }
}
