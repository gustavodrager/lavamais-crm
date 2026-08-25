# Registro de Decisoes

Esta pasta registra decisoes arquiteturais e de produto que orientam todas as conversas e implementacoes.

## Decisoes aceitas

| ADR | Decisao |
|---|---|
| [ADR-001](ADR-001-idioma-portugues.md) | Portugues como idioma padrao de codigo |
| [ADR-002](ADR-002-stack-e-monolito-modular.md) | Next.js, .NET 10, PostgreSQL e monolito modular |
| [ADR-003](ADR-003-hubs-compartilhados.md) | Hubs compartilhados; parte de identidade substituida pelo ADR-011 |
| [ADR-004](ADR-004-multitenancy-e-autorizacao.md) | Multitenancy e autorizacao; fonte da identidade substituida pelo ADR-011 |
| [ADR-005](ADR-005-escopo-da-versao-1.md) | Acao Comercial como capacidade inicial |
| [ADR-006](ADR-006-integracao-inicial-por-csv.md) | CSV antes de integracao online com o sistema atual |
| [ADR-007](ADR-007-envio-individual-de-mensagens.md) | Conferencia e envio individual por destinatario |
| [ADR-008](ADR-008-postgresql-inicial-no-railway.md) | PostgreSQL remoto isolado no Railway para homologacao e producao |
| [ADR-009](ADR-009-sessoes-bff-no-postgresql.md) | Persistencia criptografada de sessoes do BFF; artefatos OIDC deixaram de ser vigentes |
| [ADR-010](ADR-010-homologacao-incremental-sem-centrais.md) | Homologacao incremental; parte de identidade substituida pelo ADR-011 |
| [ADR-011](ADR-011-identidade-local-do-crm.md) | Login local por telefone e senha definida no primeiro acesso |

## Regra

Uma nova decisao que altere stack, limites de modulo, seguranca, integracoes ou escopo precisa de novo ADR. ADR aceito nao e reescrito para esconder a historia; ele e substituido por outro ADR que explique a mudanca.
