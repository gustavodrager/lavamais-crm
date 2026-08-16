using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LavaMais.Crm.Modulos.ModelosDeMensagem.Infraestrutura.Migrations
{
    /// <inheritdoc />
    public partial class CriarModelosDeMensagemInicial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "comunicacao");

            migrationBuilder.CreateTable(
                name: "modelos_de_mensagem",
                schema: "comunicacao",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    nome = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    nome_normalizado = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    canal = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    situacao = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    versao_atual_id = table.Column<Guid>(type: "uuid", nullable: true),
                    data_criacao = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    data_atualizacao = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_modelos_de_mensagem", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "versoes_dos_modelos",
                schema: "comunicacao",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    modelo_id = table.Column<Guid>(type: "uuid", nullable: false),
                    numero = table.Column<int>(type: "integer", nullable: false),
                    conteudo_pre_visualizacao = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    variaveis = table.Column<string[]>(type: "text[]", nullable: false),
                    chave_template_notificacao = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    data_publicacao = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_versoes_dos_modelos", x => x.id);
                    table.ForeignKey(
                        name: "FK_versoes_dos_modelos_modelos_de_mensagem_modelo_id",
                        column: x => x.modelo_id,
                        principalSchema: "comunicacao",
                        principalTable: "modelos_de_mensagem",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_modelos_de_mensagem_tenant_id_nome_normalizado",
                schema: "comunicacao",
                table: "modelos_de_mensagem",
                columns: new[] { "tenant_id", "nome_normalizado" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_versoes_dos_modelos_modelo_id",
                schema: "comunicacao",
                table: "versoes_dos_modelos",
                column: "modelo_id");

            migrationBuilder.CreateIndex(
                name: "IX_versoes_dos_modelos_tenant_id_modelo_id_numero",
                schema: "comunicacao",
                table: "versoes_dos_modelos",
                columns: new[] { "tenant_id", "modelo_id", "numero" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "versoes_dos_modelos",
                schema: "comunicacao");

            migrationBuilder.DropTable(
                name: "modelos_de_mensagem",
                schema: "comunicacao");
        }
    }
}
