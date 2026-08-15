# Stack Definida

Status: aceita. Consulte [ADR-002](../../10-decisoes/ADR-002-stack-e-monolito-modular.md).

## Frontend e BFF

- Next.js com App Router;
- React;
- TypeScript em modo estrito;
- Tailwind CSS;
- shadcn/ui;
- React Hook Form;
- Zod;
- Vitest;
- Playwright.

## Backend

- .NET 10;
- ASP.NET Core;
- Entity Framework Core;
- Npgsql;
- OpenAPI;
- xUnit;
- Testcontainers.

## Dados e processamento

- PostgreSQL;
- outbox transacional;
- Worker .NET;
- `jsonb` apenas para estruturas tipadas e versionadas.

## Integracoes

- OIDC Authorization Code com PKCE pelo Identity Hub;
- JWT de acesso validado pela API;
- HTTP com `X-Api-Key` para o Notification Hub;
- importacao CSV como primeira entrada de dados externa.

## Operacao

- Docker para ambientes reproduziveis;
- pipeline de build, testes, formatacao e migrations;
- logs estruturados;
- OpenTelemetry para metricas e traces;
- Sentry pode ser ativado em producao para erros da aplicacao.

## Versionamento

- usar a versao LTS vigente do Node.js quando o scaffold for criado;
- fixar versoes no lockfile e nos arquivos de ambiente;
- evitar dependencias beta como fundamento arquitetural;
- atualizacoes de major version exigem verificacao e registro quando trouxerem mudanca relevante.

## Itens explicitamente adiados

- Redis;
- Kafka;
- Kubernetes;
- event sourcing;
- bancos por modulo;
- microsservicos internos;
- GraphQL.
