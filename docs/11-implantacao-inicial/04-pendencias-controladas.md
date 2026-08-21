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

- localizar, publicar e operar o Identity Hub; em 20 de agosto de 2026 nao havia servico ou repositorio disponivel no ambiente inspecionado;
- evoluir o Identity Hub para registrar escopo/recurso `lavamais-crm-api` e emitir `aud`;
- criar cliente OIDC `lavamais-crm-web`;
- definir dominios e callbacks de homologacao e producao;
- aplicar o schema tecnico das sessoes do BFF, provisionar chave de criptografia por ambiente e validar login apos reinicio;
- definir procedimento de provisionamento do primeiro administrador.

## Notification Hub

- substituir ou evoluir a implantacao encontrada em 20 de agosto de 2026: ela ainda usa o contrato anterior, sem autenticacao por chave, sem idempotencia e com processamento manual, portanto nao deve receber envios do CRM;
- cadastrar origem e chave `lavamais-crm`;
- aprovar e provisionar templates da Meta;
- confirmar nomes e ordem dos parametros;
- definir intervalo de reconciliacao e politica de falha final.

## Dados

- converter as planilhas autorizadas de clientes e servicos para o CSV canonico, revisar a pre-visualizacao e somente entao confirmar a carga em homologacao;
- validar com a operacao a atualizacao idempotente por `codigoExterno` ou WhatsApp;
- validar retencao do arquivo e das linhas de importacao;
- definir politica de anonimizacao e exclusao conforme orientacao juridica.

## Infraestrutura

- PostgreSQL provisionado no projeto Railway `lavamais-crm`, com ambientes isolados `homologacao` e `production`, conforme ADR-008;
- API, BFF, Worker e migrador provisionados no Railway em homologacao; o Worker permanece com zero replicas ate a liberacao do Notification Hub;
- substituir os dominios temporarios do Railway por dominios definitivos, configurar DNS e registrar os callbacks no Identity Hub;
- PITR habilitado em homologacao e producao; confirmar a primeira cobertura, executar restauracao isolada e definir RPO e RTO antes de inserir dados empresariais em producao;
- configurar alertas e responsaveis operacionais.

## Sistema atual

- acessar o Essence GO Industrial somente quando autorizado;
- inventariar exportacoes e eventual API;
- decidir se pedidos e movimentacoes entrarao em uma fase posterior.
