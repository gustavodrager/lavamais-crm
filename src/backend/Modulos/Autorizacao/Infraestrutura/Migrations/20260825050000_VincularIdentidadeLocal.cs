using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LavaMais.Crm.Modulos.Autorizacao.Infraestrutura.Migrations;

[DbContext(typeof(ContextoDeAutorizacao))]
[Migration("20260825050000_VincularIdentidadeLocal")]
public sealed class VincularIdentidadeLocal : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            DO $vincular$
            BEGIN
                IF to_regclass('identidade.usuarios') IS NOT NULL THEN
                    INSERT INTO autorizacao.usuarios_crm
                        (id, tenant_id, usuario_identidade_id, papel, situacao, data_criacao, data_atualizacao)
                    SELECT
                        gen_random_uuid(), identidade.tenant_id, identidade.id::text,
                        'Administrador', 'Ativo', identidade.data_criacao, identidade.data_atualizacao
                    FROM identidade.usuarios AS identidade
                    WHERE identidade.ativo
                      AND NOT EXISTS (
                          SELECT 1
                          FROM autorizacao.usuarios_crm AS autorizacao
                          WHERE autorizacao.tenant_id = identidade.tenant_id
                            AND autorizacao.usuario_identidade_id = identidade.id::text
                      );
                END IF;
            END
            $vincular$;
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        // Migracao de dados deliberadamente irreversivel para nao apagar autorizacoes legitimas.
    }
}
