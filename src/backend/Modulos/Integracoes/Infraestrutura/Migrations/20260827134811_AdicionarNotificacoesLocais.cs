using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LavaMais.Crm.Modulos.Integracoes.Infraestrutura.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarNotificacoesLocais : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_mensagens_da_outbox_chave_unica",
                schema: "integracoes",
                table: "mensagens_da_outbox");

            migrationBuilder.CreateTable(
                name: "notificacoes_locais",
                schema: "integracoes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    canal = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    chave_modelo = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    chave_idempotencia = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    nome_destinatario = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    telefone_destinatario = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    conteudo_snapshot = table.Column<string>(type: "text", nullable: false),
                    parametros_json = table.Column<string>(type: "jsonb", nullable: false),
                    situacao = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    situacao_entrega = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    identificador_no_provedor = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    tentativas = table.Column<int>(type: "integer", nullable: false),
                    codigo_falha = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ultimo_erro = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    data_criacao = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    data_atualizacao = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    data_envio = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_notificacoes_locais", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_mensagens_da_outbox_tenant_id_chave_unica",
                schema: "integracoes",
                table: "mensagens_da_outbox",
                columns: new[] { "tenant_id", "chave_unica" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_notificacoes_locais_identificador_no_provedor",
                schema: "integracoes",
                table: "notificacoes_locais",
                column: "identificador_no_provedor",
                unique: true,
                filter: "identificador_no_provedor IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_notificacoes_locais_tenant_id_chave_idempotencia",
                schema: "integracoes",
                table: "notificacoes_locais",
                columns: new[] { "tenant_id", "chave_idempotencia" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "notificacoes_locais",
                schema: "integracoes");

            migrationBuilder.DropIndex(
                name: "IX_mensagens_da_outbox_tenant_id_chave_unica",
                schema: "integracoes",
                table: "mensagens_da_outbox");

            migrationBuilder.CreateIndex(
                name: "IX_mensagens_da_outbox_chave_unica",
                schema: "integracoes",
                table: "mensagens_da_outbox",
                column: "chave_unica",
                unique: true);
        }
    }
}
