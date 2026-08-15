using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LavaMais.Crm.Modulos.Clientes.Infraestrutura.Migrations
{
    /// <inheritdoc />
    public partial class CriarClientesInicial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "clientes");

            migrationBuilder.CreateTable(
                name: "clientes",
                schema: "clientes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    nome = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    nome_fantasia = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    tipo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    data_nascimento = table.Column<DateOnly>(type: "date", nullable: true),
                    situacao = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    data_criacao = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    data_atualizacao = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_clientes", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "etiquetas",
                schema: "clientes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    nome = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    nome_normalizado = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    data_criacao = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_etiquetas", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "contatos_do_cliente",
                schema: "clientes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    cliente_id = table.Column<Guid>(type: "uuid", nullable: false),
                    tipo = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    valor = table.Column<string>(type: "character varying(254)", maxLength: 254, nullable: false),
                    valor_normalizado = table.Column<string>(type: "character varying(254)", maxLength: 254, nullable: false),
                    situacao = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_contatos_do_cliente", x => x.id);
                    table.ForeignKey(
                        name: "FK_contatos_do_cliente_clientes_cliente_id",
                        column: x => x.cliente_id,
                        principalSchema: "clientes",
                        principalTable: "clientes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "enderecos_do_cliente",
                schema: "clientes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    cliente_id = table.Column<Guid>(type: "uuid", nullable: false),
                    logradouro = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    numero = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    complemento = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    bairro = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    cidade = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    estado = table.Column<string>(type: "character varying(2)", maxLength: 2, nullable: true),
                    cep = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_enderecos_do_cliente", x => x.id);
                    table.ForeignKey(
                        name: "FK_enderecos_do_cliente_clientes_cliente_id",
                        column: x => x.cliente_id,
                        principalSchema: "clientes",
                        principalTable: "clientes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "permissoes_de_comunicacao",
                schema: "clientes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    cliente_id = table.Column<Guid>(type: "uuid", nullable: false),
                    canal = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    finalidade = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    permitida = table.Column<bool>(type: "boolean", nullable: false),
                    data_atualizacao = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_permissoes_de_comunicacao", x => x.id);
                    table.ForeignKey(
                        name: "FK_permissoes_de_comunicacao_clientes_cliente_id",
                        column: x => x.cliente_id,
                        principalSchema: "clientes",
                        principalTable: "clientes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "clientes_etiquetas",
                schema: "clientes",
                columns: table => new
                {
                    cliente_id = table.Column<Guid>(type: "uuid", nullable: false),
                    etiqueta_id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_clientes_etiquetas", x => new { x.cliente_id, x.etiqueta_id });
                    table.ForeignKey(
                        name: "FK_clientes_etiquetas_clientes_cliente_id",
                        column: x => x.cliente_id,
                        principalSchema: "clientes",
                        principalTable: "clientes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_clientes_etiquetas_etiquetas_etiqueta_id",
                        column: x => x.etiqueta_id,
                        principalSchema: "clientes",
                        principalTable: "etiquetas",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_clientes_etiquetas_etiqueta_id",
                schema: "clientes",
                table: "clientes_etiquetas",
                column: "etiqueta_id");

            migrationBuilder.CreateIndex(
                name: "IX_contatos_do_cliente_cliente_id",
                schema: "clientes",
                table: "contatos_do_cliente",
                column: "cliente_id");

            migrationBuilder.CreateIndex(
                name: "ux_whatsapp_ativo_por_tenant",
                schema: "clientes",
                table: "contatos_do_cliente",
                columns: new[] { "tenant_id", "valor_normalizado" },
                unique: true,
                filter: "tipo = 'Whatsapp' AND situacao = 'Ativo'");

            migrationBuilder.CreateIndex(
                name: "IX_enderecos_do_cliente_cliente_id",
                schema: "clientes",
                table: "enderecos_do_cliente",
                column: "cliente_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_etiquetas_tenant_id_nome_normalizado",
                schema: "clientes",
                table: "etiquetas",
                columns: new[] { "tenant_id", "nome_normalizado" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_permissoes_de_comunicacao_cliente_id",
                schema: "clientes",
                table: "permissoes_de_comunicacao",
                column: "cliente_id");

            migrationBuilder.CreateIndex(
                name: "IX_permissoes_de_comunicacao_tenant_id_cliente_id_canal_finali~",
                schema: "clientes",
                table: "permissoes_de_comunicacao",
                columns: new[] { "tenant_id", "cliente_id", "canal", "finalidade" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "clientes_etiquetas",
                schema: "clientes");

            migrationBuilder.DropTable(
                name: "contatos_do_cliente",
                schema: "clientes");

            migrationBuilder.DropTable(
                name: "enderecos_do_cliente",
                schema: "clientes");

            migrationBuilder.DropTable(
                name: "permissoes_de_comunicacao",
                schema: "clientes");

            migrationBuilder.DropTable(
                name: "etiquetas",
                schema: "clientes");

            migrationBuilder.DropTable(
                name: "clientes",
                schema: "clientes");
        }
    }
}
