# Ordem de Implementacao

## Fatia 0 — Fundacao

- criar monorepo e solucoes;
- ambiente local com PostgreSQL;
- logging, Problem Details, OpenAPI e testes basicos;
- pipeline inicial.

## Fatia 1 — Identidade e tenant

- BFF OIDC;
- validacao JWT na API;
- contexto de tenant;
- autorizacao local e provisionamento controlado do administrador;
- testes de isolamento.

## Fatia 2 — Clientes

- cadastro e busca;
- contatos e enderecos;
- etiquetas e permissao;
- normalizacao e duplicidade.

## Fatia 3 — Importacao CSV

- upload temporario;
- mapeamento e pre-visualizacao;
- confirmacao e relatorio;
- testes com arquivos validos e invalidos.

## Fatia 4 — Catalogo e modelos

- itens de catalogo;
- modelos comerciais e publicacao de versao;
- vinculo com template tecnico provisionado.

## Fatia 5 — Rascunho e segmentacao

- CRUD de rascunho;
- criterios tipados;
- simulacao paginada;
- motivos de exclusao.

## Fatia 6 — Preparacao

- snapshot de audiencia;
- transicao de estado;
- concorrencia otimista;
- auditoria.

## Fatia 7 — Envio

- outbox;
- Worker;
- cliente do Notification Hub;
- idempotencia;
- reconciliacao.

## Fatia 8 — Resultado e acompanhamento

- detalhe da acao;
- estados por destinatario;
- resultado comercial;
- totais consolidados.

## Fatia 9 — Endurecimento

- testes ponta a ponta;
- verificacoes de seguranca;
- observabilidade;
- backup e restauracao testados;
- runbook de implantacao.

Cada fatia deve terminar utilizavel e testada antes da proxima.
