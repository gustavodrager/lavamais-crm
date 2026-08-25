using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LavaMais.Crm.Modulos.Catalogo.Infraestrutura.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarCatalogoDeLavanderia : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "artigos_de_lavanderia",
                schema: "catalogo",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    nome = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    nome_normalizado = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    categoria = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    situacao = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    data_criacao = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    data_atualizacao = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_artigos_de_lavanderia", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "servicos_de_lavanderia",
                schema: "catalogo",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    nome = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    nome_normalizado = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    descricao = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    situacao = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    data_criacao = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    data_atualizacao = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_servicos_de_lavanderia", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "ofertas_de_servico",
                schema: "catalogo",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    artigo_de_lavanderia_id = table.Column<Guid>(type: "uuid", nullable: false),
                    servico_de_lavanderia_id = table.Column<Guid>(type: "uuid", nullable: false),
                    preco_unitario = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    situacao = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    data_criacao = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    data_atualizacao = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ofertas_de_servico", x => x.id);
                    table.ForeignKey(
                        name: "FK_ofertas_de_servico_artigos_de_lavanderia_artigo_de_lavander~",
                        column: x => x.artigo_de_lavanderia_id,
                        principalSchema: "catalogo",
                        principalTable: "artigos_de_lavanderia",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ofertas_de_servico_servicos_de_lavanderia_servico_de_lavand~",
                        column: x => x.servico_de_lavanderia_id,
                        principalSchema: "catalogo",
                        principalTable: "servicos_de_lavanderia",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_artigos_de_lavanderia_tenant_id_nome_normalizado",
                schema: "catalogo",
                table: "artigos_de_lavanderia",
                columns: new[] { "tenant_id", "nome_normalizado" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ofertas_de_servico_artigo_de_lavanderia_id",
                schema: "catalogo",
                table: "ofertas_de_servico",
                column: "artigo_de_lavanderia_id");

            migrationBuilder.CreateIndex(
                name: "IX_ofertas_de_servico_servico_de_lavanderia_id",
                schema: "catalogo",
                table: "ofertas_de_servico",
                column: "servico_de_lavanderia_id");

            migrationBuilder.CreateIndex(
                name: "IX_ofertas_de_servico_tenant_id_artigo_de_lavanderia_id_servic~",
                schema: "catalogo",
                table: "ofertas_de_servico",
                columns: new[] { "tenant_id", "artigo_de_lavanderia_id", "servico_de_lavanderia_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_servicos_de_lavanderia_tenant_id_nome_normalizado",
                schema: "catalogo",
                table: "servicos_de_lavanderia",
                columns: new[] { "tenant_id", "nome_normalizado" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ofertas_de_servico",
                schema: "catalogo");

            migrationBuilder.DropTable(
                name: "artigos_de_lavanderia",
                schema: "catalogo");

            migrationBuilder.DropTable(
                name: "servicos_de_lavanderia",
                schema: "catalogo");
        }
    }
}
