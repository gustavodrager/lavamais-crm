using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LavaMais.Crm.Modulos.AcoesComerciais.Infraestrutura.Migrations;

[DbContext(typeof(ContextoDeAcoesComerciais))]
[Migration("20260824183000_TornarItemDeCatalogoOpcional")]
public sealed class TornarItemDeCatalogoOpcional : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<Guid>(
            name: "item_de_catalogo_id",
            schema: "acoes_comerciais",
            table: "acoes_comerciais",
            type: "uuid",
            nullable: true,
            oldClrType: typeof(Guid),
            oldType: "uuid");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1
                    FROM acoes_comerciais.acoes_comerciais
                    WHERE item_de_catalogo_id IS NULL
                ) THEN
                    RAISE EXCEPTION 'Nao e possivel restaurar a obrigatoriedade enquanto existirem acoes sem item de catalogo.';
                END IF;
            END $$;
            """);

        migrationBuilder.AlterColumn<Guid>(
            name: "item_de_catalogo_id",
            schema: "acoes_comerciais",
            table: "acoes_comerciais",
            type: "uuid",
            nullable: false,
            oldClrType: typeof(Guid),
            oldType: "uuid",
            oldNullable: true);
    }
}
