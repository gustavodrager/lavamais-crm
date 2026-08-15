# Backend do LavaMais CRM

Fundacao da CRM API e do CRM Worker em .NET 10, organizada como monolito modular.

## Requisitos

- SDK .NET definido em `global.json`;
- Docker com Compose;
- PostgreSQL 17 (o Compose fornece a instancia local).

## Executar localmente

Na raiz do repositorio:

```bash
docker compose -f infraestrutura/compose.yml up -d
dotnet run --project src/backend/LavaMais.Crm.Api
```

A API publica:

- OpenAPI em `/openapi/v1.json`;
- verificacao de vida em `/saude/vivo`;
- verificacao de prontidao, incluindo PostgreSQL, em `/saude/pronto`.

Para iniciar o processo do Worker:

```bash
dotnet run --project src/backend/LavaMais.Crm.Worker
```

## Configuracao

A conexao usa `ConnectionStrings__Crm`. O valor de `appsettings.json` e exclusivo para o ambiente local. Ambientes compartilhados devem fornecer a conexao por configuracao externa e nunca versionar segredos.

## Build e testes

```bash
dotnet restore LavaMais.Crm.slnx
dotnet build LavaMais.Crm.slnx --configuration Release --no-restore
dotnet test LavaMais.Crm.slnx --configuration Release --no-build
```

Os testes de integracao usam PostgreSQL real por Testcontainers e, portanto, exigem Docker em execucao.

## Migrations

Cada modulo tera seu proprio `DbContext`, schema e historico de migrations. O bloco `AdicionarContextoDoModulo` centraliza a configuracao do provedor sem criar um contexto compartilhado. A primeira migration sera criada junto do primeiro modelo persistente da fatia correspondente; a Fundacao nao cria tabelas vazias.
