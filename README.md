# LavaMais CRM

Plataforma de relacionamento comercial inicialmente destinada a LavaMais Praia Grande e preparada para evoluir como produto multitenant.

O sistema transforma a base de clientes, o catalogo de produtos e servicos e os modelos de mensagem em acoes comerciais rastreaveis.

## Implantacao inicial

A primeira entrega possui um fluxo principal:

1. cadastrar ou importar clientes;
2. cadastrar produtos e servicos;
3. criar uma Acao Comercial;
4. selecionar o publico por filtros simples;
5. revisar os destinatarios elegiveis;
6. escolher um modelo de mensagem aprovado;
7. enviar pelo adaptador de notificacoes configurado;
8. acompanhar entrega e registrar o resultado comercial.

Nao teremos historico inicial de pedidos ou movimentacoes. Por isso, as primeiras segmentacoes usam dados declarados do cliente, localizacao, etiquetas, data de cadastro, permissao de comunicacao e selecao manual.

## Limites do produto

O LavaMais CRM nao contempla:

- producao, lavagem, triagem ou passadoria;
- estoque;
- caixa, fluxo de caixa ou financeiro completo;
- motoristas, roteirizacao ou logistica avancada;
- assinatura digital ou fotos de pecas.

Essas capacidades pertencem ao projeto futuro LavaMais Operacao e Producao.

## Stack definida

- Next.js, React e TypeScript no frontend/BFF;
- ASP.NET Core com .NET 10 na API;
- Worker em .NET 10;
- PostgreSQL e Entity Framework Core;
- identidade local por telefone, senha e sessao opaca;
- WhatsMiau para o envio local de WhatsApp, atras de uma porta preparada para a futura Central de Notificacao;
- xUnit, Testcontainers, Vitest e Playwright;
- Docker e CI/CD.

A aplicacao comeca como um monolito modular em um monorepo. O crescimento do produto nao exige microsservicos antecipados.

## Documentacao vigente

- [Indice da documentacao](docs/README.md)
- [Visao do produto](docs/00-visao-geral/02-visao-produto.md)
- [Escopo da Versao 1.0](docs/00-visao-geral/03-escopo-versao-1.md)
- [Arquitetura tecnica](docs/07-tecnico/README.md)
- [Decisoes arquiteturais](docs/10-decisoes/README.md)
- [Implantacao inicial](docs/11-implantacao-inicial/README.md)
- [Orientacoes para agentes](AGENTS.md)

Os prototipos e documentos marcados como historicos representam uma fase anterior de descoberta e nao devem ser usados como especificacao vigente.

## Estado atual

O backend possui as Fatias 0 a 9 da implantacao inicial: fundacao, identidade e tenant, clientes, importacao CSV, catalogo, modelos, rascunhos, segmentacao, preparacao transacional da audiencia, envio local pelo WhatsMiau com outbox, acompanhamento de resultados e endurecimento operacional. A integracao usa uma porta que preserva o adaptador da futura Central de Notificacao. Consulte as [instrucoes do backend](src/backend/README.md) e o [runbook operacional](docs/09-operacao/README.md).

O frontend em `src/web` cobre o fluxo principal da Versao 1.0: criacao do rascunho, simulacao do publico, selecao de modelo publicado, preparacao da audiencia, inicio do processamento, acompanhamento dos destinatarios e registro de resultados comerciais. A integracao ocorre pelo BFF do Next.js, sem expor tokens ao JavaScript. Os testes de componentes e integracao usam Vitest; o fluxo principal usa Playwright.
