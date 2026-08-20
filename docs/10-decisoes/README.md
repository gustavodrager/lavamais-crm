# Registro de Decisoes

Esta pasta registra decisoes arquiteturais e de produto que orientam todas as conversas e implementacoes.

## Decisoes aceitas

| ADR | Decisao |
|---|---|
| [ADR-001](ADR-001-idioma-portugues.md) | Portugues como idioma padrao de codigo |
| [ADR-002](ADR-002-stack-e-monolito-modular.md) | Next.js, .NET 10, PostgreSQL e monolito modular |
| [ADR-003](ADR-003-hubs-compartilhados.md) | Identity Hub e Notification Hub como servicos compartilhados |
| [ADR-004](ADR-004-multitenancy-e-autorizacao.md) | Tenant no token e papeis locais do CRM |
| [ADR-005](ADR-005-escopo-da-versao-1.md) | Acao Comercial como capacidade inicial |
| [ADR-006](ADR-006-integracao-inicial-por-csv.md) | CSV antes de integracao online com o sistema atual |
| [ADR-007](ADR-007-envio-individual-de-mensagens.md) | Conferencia e envio individual por destinatario |

## Regra

Uma nova decisao que altere stack, limites de modulo, seguranca, integracoes ou escopo precisa de novo ADR. ADR aceito nao e reescrito para esconder a historia; ele e substituido por outro ADR que explique a mudanca.
