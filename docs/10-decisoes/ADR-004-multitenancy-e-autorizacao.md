# ADR-004 — Multitenancy e autorizacao

- Status: aceito
- Data: 2026-08-15

## Contexto

O produto inicia em uma unidade, mas pode atender outras empresas. O Identity Hub ja emite `tenant_id`, porem as memberships atuais nao carregam os papeis especificos do CRM.

## Decisao

- todas as entidades empresariais possuem `TenantId`;
- a API deriva o tenant somente do token;
- `sub` identifica o usuario;
- `Administrador`, `Gerente` e `Operador` ficam no banco do CRM por `sub + tenant_id`;
- usuario autenticado sem papel ativo nao acessa dados do CRM;
- o primeiro administrador e provisionado por operacao controlada.

## Consequencias

- isolamento precisa ser testado em todas as consultas;
- um mesmo usuario pode ter papeis diferentes por tenant;
- autorizacao continua funcionando sem alterar o modelo global do Identity Hub;
- futura centralizacao de papeis exigira migracao e novo ADR.
