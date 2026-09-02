# Estrutura do Repositorio

Este documento apresenta a organizacao implementada. A fonte de verdade de produto esta em `docs/00-visao-geral`, e as decisoes que alteram arquitetura ou escopo ficam em `docs/10-decisoes`.

```text
lavamais-crm/
├── src/
│   ├── web/                         # Next.js, interface e BFF
│   └── backend/
│       ├── LavaMais.Crm.Api/        # API HTTP
│       ├── LavaMais.Crm.Worker/     # outbox e integracoes
│       ├── LavaMais.Crm.Migrador/   # migrations controladas
│       ├── LavaMais.Crm.ImportadorEssence/ # importacao controlada por arquivo
│       ├── BlocosDeConstrucao/      # contratos e infraestrutura compartilhada
│       └── Modulos/                 # monolito modular
├── testes/
│   ├── backend/                     # arquitetura, unidade e integracao .NET
│   └── frontend/                    # componentes, integracao e Playwright
├── infraestrutura/                  # Compose, Dockerfiles e scripts SQL
├── scripts/backend/                 # backup e restauracao
├── docs/                            # produto, tecnica, operacao e decisoes
├── prototipo/                       # prototipo historico
└── prototipo_v1/                    # prototipo historico
```

## Aplicacoes e processos executaveis

- `LavaMais.Crm.Api`: autenticacao, contratos HTTP e casos de uso do CRM;
- `LavaMais.Crm.Worker`: processamento da outbox e comunicacao com WhatsMiau ou futura Central de Notificacao;
- `LavaMais.Crm.Migrador`: aplicacao controlada das migrations;
- `LavaMais.Crm.ImportadorEssence`: importacao assistida por arquivo, executada somente quando autorizada;
- `src/web`: interface e BFF, com sessoes server-side.

## Modulos do backend

- `Identidade`;
- `Autorizacao`;
- `Clientes`;
- `Importacoes`;
- `Catalogo`;
- `ModelosDeMensagem`;
- `Segmentacao`;
- `AcoesComerciais`;
- `MovimentacoesComerciais`;
- `Roteiros`;
- `Auditoria`;
- `Integracoes`.

Cada modulo organiza `Dominio`, `Aplicacao`, `Infraestrutura` e `Api` conforme sua necessidade. Os modulos usam contratos de aplicacao e nao acessam diretamente entidades, tabelas ou `DbContext` internos de outro modulo.

## Documentacao

O indice e a classificacao entre material vigente, roadmap, descoberta e historico estao em [`docs/README.md`](docs/README.md).

## Testes

Todos os testes ficam sob `testes/`. O backend usa xUnit e Testcontainers; o frontend usa Vitest e Playwright.
