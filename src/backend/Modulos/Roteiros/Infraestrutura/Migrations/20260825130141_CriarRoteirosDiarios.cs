using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LavaMais.Crm.Modulos.Roteiros.Infraestrutura.Migrations
{
    /// <inheritdoc />
    public partial class CriarRoteirosDiarios : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "roteiros");

            migrationBuilder.CreateTable(
                name: "roteiros_diarios",
                schema: "roteiros",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    data = table.Column<DateOnly>(type: "date", nullable: false),
                    nome_motorista = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    situacao = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    data_criacao = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    data_atualizacao = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_roteiros_diarios", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "paradas",
                schema: "roteiros",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    roteiro_id = table.Column<Guid>(type: "uuid", nullable: false),
                    cliente_id = table.Column<Guid>(type: "uuid", nullable: false),
                    nome_cliente = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    whatsapp = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    endereco_completo = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    tipo = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    periodo = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    observacao = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ordem = table.Column<int>(type: "integer", nullable: false),
                    situacao = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    data_criacao = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    data_inicio = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    data_conclusao = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    motivo_nao_realizacao = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_paradas", x => x.id);
                    table.ForeignKey(
                        name: "FK_paradas_roteiros_diarios_roteiro_id",
                        column: x => x.roteiro_id,
                        principalSchema: "roteiros",
                        principalTable: "roteiros_diarios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_paradas_roteiro_id",
                schema: "roteiros",
                table: "paradas",
                column: "roteiro_id");

            migrationBuilder.CreateIndex(
                name: "IX_paradas_tenant_id_roteiro_id_ordem",
                schema: "roteiros",
                table: "paradas",
                columns: new[] { "tenant_id", "roteiro_id", "ordem" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_roteiros_diarios_tenant_id_data",
                schema: "roteiros",
                table: "roteiros_diarios",
                columns: new[] { "tenant_id", "data" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "paradas",
                schema: "roteiros");

            migrationBuilder.DropTable(
                name: "roteiros_diarios",
                schema: "roteiros");
        }
    }
}
