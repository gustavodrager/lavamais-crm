# Registro de Decisoes

Esta pasta registra decisoes arquiteturais e de produto que orientam todas as conversas e implementacoes.

## Decisoes aceitas

| ADR | Decisao |
|---|---|
| [ADR-001](ADR-001-idioma-portugues.md) | Portugues como idioma padrao de codigo |
| [ADR-002](ADR-002-stack-e-monolito-modular.md) | Next.js, .NET 10, PostgreSQL e monolito modular |
| [ADR-004](ADR-004-multitenancy-e-autorizacao.md) | Multitenancy e autorizacao; fonte da identidade substituida pelo ADR-011 |
| [ADR-005](ADR-005-escopo-da-versao-1.md) | Acao Comercial como capacidade inicial |
| [ADR-006](ADR-006-integracao-inicial-por-csv.md) | CSV antes de integracao online com o sistema atual |
| [ADR-007](ADR-007-envio-individual-de-mensagens.md) | Conferencia e envio individual; mecanismo substituido parcialmente pelo ADR-021 |
| [ADR-008](ADR-008-postgresql-inicial-no-railway.md) | PostgreSQL remoto isolado no Railway para homologacao e producao |
| [ADR-009](ADR-009-sessoes-bff-no-postgresql.md) | Persistencia criptografada de sessoes do BFF; artefatos OIDC deixaram de ser vigentes |
| [ADR-011](ADR-011-identidade-local-do-crm.md) | Login local por telefone e senha definida no primeiro acesso |
| [ADR-012](ADR-012-movimentacoes-comerciais-manuais.md) | Registro comercial minimo de pedidos sem substituir o Essence GO Industrial |
| [ADR-013](ADR-013-roteiro-diario-operacional.md) | Roteiro diario simples para coletas e entregas |
| [ADR-014](ADR-014-lista-assistida-de-clientes.md) | Lista assistida de ate dez clientes e envio individual em interface de conversa |
| [ADR-015](ADR-015-catalogo-de-artigos-e-servicos.md) | Catalogo relacional e movimentacao comercial com uma ou mais linhas |
| [ADR-016](ADR-016-carga-historica-controlada-do-essence.md) | Carga historica controlada de clientes, tickets e referencias agregadas do Essence |
| [ADR-018](ADR-018-usuarios-iniciais-por-perfil.md) | Usuarios iniciais por perfil para homologacao |
| [ADR-019](ADR-019-composicao-sintetica-de-produtos-em-homologacao.md) | Composicao sintetica e reversivel de produtos em tickets de homologacao |
| [ADR-020](ADR-020-perfis-operacionais-da-versao-1.md) | Limites de Administrador, Gerente e Operador na Versao 1.0 |
| [ADR-021](ADR-021-whatsapp-web-assistido.md) | WhatsApp Web assistido, individual e sem provedor de envio |
| [ADR-022](ADR-022-sugestoes-e-aprovacao-de-acoes.md) | Sugestoes comerciais com aprovacao humana antes do WhatsApp |

## Decisoes substituidas

| ADR | Substituida por |
|---|---|
| [ADR-003](ADR-003-hubs-compartilhados.md) | [ADR-011](ADR-011-identidade-local-do-crm.md) e [ADR-021](ADR-021-whatsapp-web-assistido.md) |
| [ADR-010](ADR-010-homologacao-incremental-sem-centrais.md) | [ADR-011](ADR-011-identidade-local-do-crm.md) e [ADR-021](ADR-021-whatsapp-web-assistido.md) |
| [ADR-017](ADR-017-notificacoes-locais-com-whatsmiau.md) | [ADR-021](ADR-021-whatsapp-web-assistido.md) |

## Regra

Uma nova decisao que altere stack, limites de modulo, seguranca, integracoes ou escopo precisa de novo ADR. ADR aceito nao e reescrito para esconder a historia; ele e substituido por outro ADR que explique a mudanca.
