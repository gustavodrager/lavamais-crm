using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LavaMais.Crm.Modulos.Importacoes.Infraestrutura.Migrations
{
    /// <inheritdoc />
    public partial class PersistirArquivoDaImportacao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "caminho_temporario",
                schema: "importacoes",
                table: "importacoes_de_clientes");

            migrationBuilder.AddColumn<byte[]>(
                name: "conteudo_arquivo",
                schema: "importacoes",
                table: "importacoes_de_clientes",
                type: "bytea",
                nullable: false,
                defaultValue: new byte[0]);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "conteudo_arquivo",
                schema: "importacoes",
                table: "importacoes_de_clientes");

            migrationBuilder.AddColumn<string>(
                name: "caminho_temporario",
                schema: "importacoes",
                table: "importacoes_de_clientes",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");
        }
    }
}
