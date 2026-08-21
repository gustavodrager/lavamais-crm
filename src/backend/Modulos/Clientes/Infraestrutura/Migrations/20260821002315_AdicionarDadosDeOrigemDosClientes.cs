using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LavaMais.Crm.Modulos.Clientes.Infraestrutura.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarDadosDeOrigemDosClientes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "codigo_externo",
                schema: "clientes",
                table: "clientes",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "data_cadastro_origem",
                schema: "clientes",
                table: "clientes",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_clientes_tenant_id_codigo_externo",
                schema: "clientes",
                table: "clientes",
                columns: new[] { "tenant_id", "codigo_externo" },
                unique: true,
                filter: "codigo_externo IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_clientes_tenant_id_codigo_externo",
                schema: "clientes",
                table: "clientes");

            migrationBuilder.DropColumn(
                name: "codigo_externo",
                schema: "clientes",
                table: "clientes");

            migrationBuilder.DropColumn(
                name: "data_cadastro_origem",
                schema: "clientes",
                table: "clientes");
        }
    }
}
