using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LavaMais.Crm.Modulos.Integracoes.Infraestrutura.Migrations
{
    /// <inheritdoc />
    public partial class RemoverInfraestruturaDeNotificacoesAutomaticas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "mensagens_da_outbox",
                schema: "integracoes");

            migrationBuilder.DropTable(
                name: "notificacoes_locais",
                schema: "integracoes");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "integracoes");

            migrationBuilder.CreateTable(
                name: "mensagens_da_outbox",
                schema: "integracoes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    chave_unica = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    conteudo_json = table.Column<string>(type: "jsonb", nullable: false),
                    data_conclusao = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    data_criacao = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    disponivel_em = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    processando_ate = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    situacao = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    tentativas = table.Column<int>(type: "integer", nullable: false),
                    tipo = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ultimo_erro = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_mensagens_da_outbox", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "notificacoes_locais",
                schema: "integracoes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    canal = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    chave_idempotencia = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    chave_modelo = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    codigo_falha = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    conteudo_snapshot = table.Column<string>(type: "text", nullable: false),
                    data_atualizacao = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    data_criacao = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    data_envio = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    identificador_no_provedor = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    nome_destinatario = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    parametros_json = table.Column<string>(type: "jsonb", nullable: false),
                    situacao = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    situacao_entrega = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    telefone_destinatario = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    tentativas = table.Column<int>(type: "integer", nullable: false),
                    ultimo_erro = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_notificacoes_locais", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_mensagens_da_outbox_situacao_disponivel_em",
                schema: "integracoes",
                table: "mensagens_da_outbox",
                columns: new[] { "situacao", "disponivel_em" });

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
    }
}
