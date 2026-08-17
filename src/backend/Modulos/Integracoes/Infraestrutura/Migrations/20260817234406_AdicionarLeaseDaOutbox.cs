using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LavaMais.Crm.Modulos.Integracoes.Infraestrutura.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarLeaseDaOutbox : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "processando_ate",
                schema: "integracoes",
                table: "mensagens_da_outbox",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "processando_ate",
                schema: "integracoes",
                table: "mensagens_da_outbox");
        }
    }
}
