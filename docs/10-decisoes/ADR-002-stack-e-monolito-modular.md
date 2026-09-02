# ADR-002 — Stack e monolito modular

- Status: aceito; Worker e outbox de mensagens substituidos pelo ADR-021
- Data: 2026-08-15

> Registro historico: Next.js, .NET, PostgreSQL e monolito modular permanecem vigentes. O ADR-021 removeu o Worker e a outbox do fluxo de WhatsApp.

## Contexto

O produto comecara pequeno, mas deve crescer para oportunidades, funil, automacoes, integracoes e relatorios. Uma aplicacao somente em Next.js reduziria a separacao do nucleo comercial; microsservicos antecipariam custo operacional.

## Decisao

Adotar monorepo com:

- Next.js e TypeScript para Web/BFF;
- ASP.NET Core .NET 10 para CRM API;
- Worker .NET 10;
- PostgreSQL e Entity Framework Core;
- backend como monolito modular;
- contratos HTTP por OpenAPI;
- outbox transacional para efeitos externos.

## Consequencias

- frontend e backend podem evoluir independentemente;
- alinhamento tecnico com os hubs existentes em .NET;
- uma unica base de dados do CRM simplifica operacao inicial;
- limites modulares precisam ser aplicados no codigo e nos testes;
- modulos podem ser extraidos futuramente mediante necessidade e novo ADR.
