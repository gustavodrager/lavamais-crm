# ADR-003 — Uso dos hubs compartilhados

- Status: substituida pelo ADR-011 para identidade e pelo ADR-021 para notificacoes
- Data: 2026-08-15

> Registro historico. Os hubs compartilhados nao fazem parte da arquitetura vigente da Versao 1.0.

## Contexto

Identity Hub e Notification Hub ja existem e fornecem autenticacao, tenant, filas, retries, templates e provedores de comunicacao.

## Decisao

- O Identity Hub sera a unica fonte de autenticacao e contexto de tenant.
- O Notification Hub sera a unica porta de envio tecnico de mensagens.
- O CRM nao armazenara senhas, credenciais da Meta nem tentativas de provedor.
- Integracoes ocorrerao por OIDC e HTTP, nunca por banco compartilhado.

## Consequencias

- menor duplicacao de seguranca e infraestrutura;
- disponibilidade dos hubs passa a ser dependencia operacional;
- o CRM precisa de outbox e idempotencia para lidar com falhas de rede;
- estados comerciais e tecnicos permanecem separados.
