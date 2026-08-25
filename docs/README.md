# Indice da Documentacao

Este indice indica qual material define o produto atual e qual existe apenas como contexto, roadmap ou historico.

## Fonte de verdade vigente

Leia nesta ordem:

1. [`00-visao-geral/02-visao-produto.md`](00-visao-geral/02-visao-produto.md);
2. [`00-visao-geral/03-escopo-versao-1.md`](00-visao-geral/03-escopo-versao-1.md);
3. [`10-decisoes/README.md`](10-decisoes/README.md) e os ADRs relacionados;
4. [`11-implantacao-inicial/README.md`](11-implantacao-inicial/README.md);
5. documentacao tecnica ou do modulo alterado.

## Areas vigentes

| Area | Finalidade |
|---|---|
| `00-visao-geral` | contexto, visao e escopo atual |
| `02-produto` | regras atuais de comunicacao, Acao Comercial e segmentacao; tambem contem documentos identificados como roadmap |
| `05-regras-negocio` | regras detalhadas que devem ser lidas junto ao escopo vigente |
| `06-lgpd-seguranca` | privacidade, autorizacao e auditoria |
| `07-tecnico` | arquitetura, dados, API, frontend e integracoes |
| `09-operacao` | implantacao, observabilidade, backup e incidentes |
| `10-decisoes` | ADRs aceitos e substituicoes entre decisoes |
| `11-implantacao-inicial` | fluxo, ordem, pronto e pendencias da Versao 1.0 |

## Descoberta e roadmap

| Area | Classificacao |
|---|---|
| `01-descoberta-negocio` | hipoteses e perguntas de descoberta; nao define escopo |
| `02-produto/01`, `02` e `03` | Cliente 360, central e interacoes futuras |
| `04-backlog` | backlog originado antes das decisoes mais recentes; validar cada item contra os ADRs |
| `08-comercial` | referencia comercial, sem substituir decisoes de produto |
| `09-reunioes` | registros futuros de reunioes e validacoes |
| `99-referencias` | materiais recebidos e referencias externas |

## Historico

- `03-prototipo`;
- `../prototipo`;
- `../prototipo_v1`.

Esses materiais preservam fases anteriores e podem orientar pesquisas visuais, mas nao definem funcionalidades ou arquitetura vigentes.

## Regra de precedencia

Quando houver divergencia, um ADR posterior que declara substituicao prevalece sobre documentos anteriores. O ADR-011 substitui a autenticacao pelo Identity Hub por identidade local do CRM. Referencias antigas a OIDC devem ser tratadas como historico, nao como requisito atual.
