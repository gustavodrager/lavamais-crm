using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LavaMais.Crm.Modulos.Integracoes.Infraestrutura.Migrations
{
    /// <inheritdoc />
    public partial class CriarOutboxInicial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "integracoes");

            migrationBuilder.CreateTable(
                name: "mensagens_da_outbox",
                schema: "integracoes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    tipo = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    chave_unica = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    conteudo_json = table.Column<string>(type: "jsonb", nullable: false),
                    situacao = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    tentativas = table.Column<int>(type: "integer", nullable: false),
                    data_criacao = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    disponivel_em = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    data_conclusao = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    ultimo_erro = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_mensagens_da_outbox", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_mensagens_da_outbox_chave_unica",
                schema: "integracoes",
                table: "mensagens_da_outbox",
                column: "chave_unica",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_mensagens_da_outbox_situacao_disponivel_em",
                schema: "integracoes",
                table: "mensagens_da_outbox",
                columns: new[] { "situacao", "disponivel_em" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "mensagens_da_outbox",
                schema: "integracoes");
        }
    }
}
