# Arquitetura Tecnica

## Visao geral

O LavaMais CRM esta organizado em um monorepo com Web/BFF, API, ferramentas controladas e um banco exclusivo:

```mermaid
flowchart LR
    U["Usuario"] --> W["Web Next.js e BFF"]
    W --> A["CRM API .NET 10"]
    W -->|"wa.me em janela auxiliar"| WA["WhatsApp oficial"]
    A --> I["Modulo Identidade"]
    A --> D[("PostgreSQL do CRM")]
```

## Componentes

### Web

- Next.js, React e TypeScript;
- interface e BFF no mesmo deploy;
- sessao segura com tokens fora do JavaScript do navegador;
- chamadas empresariais encaminhadas para a API.

### API

- ASP.NET Core com .NET 10;
- monolito modular;
- OpenAPI versionada em `/api/v1`;
- validacao da sessao opaca emitida pelo modulo Identidade;
- regras de dominio e persistencia do CRM.

### Banco

- PostgreSQL exclusivo do CRM;
- Entity Framework Core;
- schemas logicos por modulo;
- migrations versionadas e aplicadas em etapa controlada de deploy.

## Documentos

- [Stack definida](arquitetura/01-stack-sugerida.md)
- [Modulos e dependencias](arquitetura/02-modulos-e-dependencias.md)
- [Multitenancy e seguranca](arquitetura/03-multitenancy-e-seguranca.md)
- [Modelo de dados](banco-dados/README.md)
- [Superficie da API](apis/README.md)
- [Identidade visual e padrao de imagens do CRM](frontend/identidade-visual.md)
- [Configuracao por aplicacao e ambiente](configuracao/README.md)
- [Identidade local](../10-decisoes/ADR-011-identidade-local-do-crm.md)
- [Identity Hub — historico](integracoes/identity-hub.md)
- [WhatsApp Web assistido](integracoes/notificacoes.md)
- [Hybex e Essence GO Industrial](integracoes/hybex-essence-go.md)

## Restricoes atuais

- sem microsservicos internos;
- sem Kafka, Redis ou Kubernetes;
- sem banco compartilhado com os hubs;
- sem acesso direto ao banco de outro sistema;
- sem scraping do Essence GO Industrial;
- sem provedor, webhook, Worker ou credenciais de WhatsApp no CRM;
- sem incorporacao do WhatsApp Web em `iframe`.
