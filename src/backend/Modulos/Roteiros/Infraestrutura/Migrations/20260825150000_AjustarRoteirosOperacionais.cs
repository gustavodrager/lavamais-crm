using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LavaMais.Crm.Modulos.Roteiros.Infraestrutura.Migrations;

public partial class AjustarRoteirosOperacionais : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "IX_paradas_tenant_id_roteiro_id_ordem",
            schema: "roteiros",
            table: "paradas");

        migrationBuilder.AlterColumn<string>(
            name: "endereco_completo",
            schema: "roteiros",
            table: "paradas",
            type: "character varying(800)",
            maxLength: 800,
            nullable: false,
            oldClrType: typeof(string),
            oldType: "character varying(500)",
            oldMaxLength: 500);

        migrationBuilder.CreateIndex(
            name: "IX_paradas_tenant_id_roteiro_id_ordem",
            schema: "roteiros",
            table: "paradas",
            columns: new[] { "tenant_id", "roteiro_id", "ordem" });
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "IX_paradas_tenant_id_roteiro_id_ordem",
            schema: "roteiros",
            table: "paradas");

        migrationBuilder.AlterColumn<string>(
            name: "endereco_completo",
            schema: "roteiros",
            table: "paradas",
            type: "character varying(500)",
            maxLength: 500,
            nullable: false,
            oldClrType: typeof(string),
            oldType: "character varying(800)",
            oldMaxLength: 800);

        migrationBuilder.CreateIndex(
            name: "IX_paradas_tenant_id_roteiro_id_ordem",
            schema: "roteiros",
            table: "paradas",
            columns: new[] { "tenant_id", "roteiro_id", "ordem" },
            unique: true);
    }
}
