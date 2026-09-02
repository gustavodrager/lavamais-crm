# LavaMais CRM

Plataforma de relacionamento comercial inicialmente destinada a LavaMais Praia Grande e preparada para evoluir como produto multitenant.

O sistema transforma a base de clientes, o catalogo de produtos e servicos e os modelos de mensagem em acoes comerciais rastreaveis.

## Implantacao inicial

A primeira entrega possui tres fluxos conectados:

1. cadastrar, importar, consultar e atualizar clientes;
2. registrar atendimentos comerciais com artigos, servicos, quantidade e valor;
3. consultar o historico comercial no detalhe do cliente;
4. criar uma Acao Comercial, selecionar o publico e congelar a audiencia;
5. escolher uma mensagem aprovada, abrir a conversa individual no WhatsApp Web, confirmar o envio e registrar o resultado;
6. organizar manualmente as coletas e entregas do dia;
7. executar o roteiro no celular e registrar o resultado de cada parada.

O historico inicial e formado por `MovimentacaoComercial`, um registro informativo do atendimento. Ele nao e pedido operacional nem fonte oficial de caixa ou faturamento. As primeiras segmentacoes continuam usando dados declarados do cliente, localizacao, etiquetas, data de cadastro, permissao de comunicacao e selecao manual.

## Limites do produto

O LavaMais CRM nao contempla:

- producao, lavagem, triagem ou passadoria;
- estoque;
- caixa, fluxo de caixa ou financeiro completo;
- roteirizacao automatica, rastreamento ou logistica avancada;
- assinatura digital ou fotos de pecas.

Essas capacidades pertencem ao projeto futuro LavaMais Operacao e Producao.

## Stack definida

- Next.js, React e TypeScript no frontend/BFF;
- ASP.NET Core com .NET 10 na API;
- PostgreSQL e Entity Framework Core;
- identidade local por telefone, senha e sessao opaca;
- WhatsApp Web oficial em janela auxiliar, com mensagem pronta e confirmacao manual no CRM;
- xUnit, Testcontainers, Vitest e Playwright;
- Docker e pipelines de CI.

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

O backend implementa fundacao, identidade e tenant, autorizacao, clientes, importacao CSV, catalogo, modelos de mensagem, segmentacao, Acoes Comerciais, Movimentacoes Comerciais, Roteiros e auditoria. O envio e assistido pelo frontend: a API registra abertura, confirmacao manual e resultado comercial, sem provedor, webhook, outbox ou Worker. O `ImportadorEssence` permanece como ferramenta controlada, sem ativar uma integracao permanente. Consulte as [instrucoes do backend](src/backend/README.md) e o [runbook operacional](docs/09-operacao/README.md).

O frontend em `src/web` cobre os fluxos da Versao 1.0: clientes, atendimento e historico comercial, Acoes Comerciais, fila individual de mensagens, roteiro diario manual, paineis por perfil e configuracoes. A integracao ocorre pelo BFF do Next.js, sem expor tokens ao JavaScript. Os testes de componentes e integracao usam Vitest; os fluxos principais usam Playwright.

O escopo esta fechado para homologacao. Isso nao libera producao: os bloqueios de seguranca, dados, vinculacao do WhatsApp Web, backup e validacao operacional continuam em [Bloqueios de producao](docs/11-implantacao-inicial/08-bloqueios-producao.md).
