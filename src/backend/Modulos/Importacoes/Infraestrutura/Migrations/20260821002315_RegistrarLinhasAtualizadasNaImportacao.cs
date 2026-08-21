using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LavaMais.Crm.Modulos.Importacoes.Infraestrutura.Migrations
{
    /// <inheritdoc />
    public partial class RegistrarLinhasAtualizadasNaImportacao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "total_atualizadas",
                schema: "importacoes",
                table: "importacoes_de_clientes",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "total_atualizadas",
                schema: "importacoes",
                table: "importacoes_de_clientes");
        }
    }
}
