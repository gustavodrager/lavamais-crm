# Pendencias Controladas

Estas pendencias nao impedem a consolidacao da arquitetura, mas precisam ser resolvidas antes da implantacao em producao.

## Produto

- validar com a LavaMais os campos adicionais do cliente;
- confirmar etiquetas e tipos de cliente iniciais;
- definir os primeiros produtos e servicos;
- definir os primeiros modelos aprovados;
- definir como a equipe confirma uma conversao;
- estabelecer metas de sucesso e periodo de avaliacao.

## Identidade

- evoluir o Identity Hub para registrar escopo/recurso `lavamais-crm-api` e emitir `aud`;
- criar cliente OIDC `lavamais-crm-web`;
- definir dominios e callbacks de homologacao e producao;
- aplicar o schema tecnico das sessoes do BFF, provisionar chave de criptografia por ambiente e validar login apos reinicio;
- definir procedimento de provisionamento do primeiro administrador.

## Notification Hub

- cadastrar origem e chave `lavamais-crm`;
- aprovar e provisionar templates da Meta;
- confirmar nomes e ordem dos parametros;
- definir intervalo de reconciliacao e politica de falha final.

## Dados

- obter CSV real autorizado;
- validar com a operacao a atualizacao idempotente por `codigoExterno` ou WhatsApp;
- validar retencao do arquivo e das linhas de importacao;
- definir politica de anonimizacao e exclusao conforme orientacao juridica.

## Infraestrutura

- PostgreSQL provisionado no projeto Railway `lavamais-crm`, com ambientes isolados `homologacao` e `production`, conforme ADR-008;
- escolher o provedor de hospedagem da API, do Worker e do frontend;
- definir dominio, DNS e certificados;
- habilitar e testar backup, retencao, restauracao, RPO e RTO antes de inserir dados empresariais em producao;
- configurar alertas e responsaveis operacionais.

## Sistema atual

- acessar o Essence GO Industrial somente quando autorizado;
- inventariar exportacoes e eventual API;
- decidir se pedidos e movimentacoes entrarao em uma fase posterior.
