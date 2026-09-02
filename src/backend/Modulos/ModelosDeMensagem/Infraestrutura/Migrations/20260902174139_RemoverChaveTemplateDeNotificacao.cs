using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LavaMais.Crm.Modulos.ModelosDeMensagem.Infraestrutura.Migrations
{
    /// <inheritdoc />
    public partial class RemoverChaveTemplateDeNotificacao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "chave_template_notificacao",
                schema: "comunicacao",
                table: "versoes_dos_modelos");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "chave_template_notificacao",
                schema: "comunicacao",
                table: "versoes_dos_modelos",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");
        }
    }
}
