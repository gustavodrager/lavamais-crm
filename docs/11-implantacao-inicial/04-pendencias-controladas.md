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
- definir armazenamento server-side e limpeza das sessoes do BFF;
- definir procedimento de provisionamento do primeiro administrador.

## Notification Hub

- cadastrar origem e chave `lavamais-crm`;
- aprovar e provisionar templates da Meta;
- confirmar nomes e ordem dos parametros;
- definir intervalo de reconciliacao e politica de falha final.

## Dados

- obter CSV real autorizado;
- definir politica de atualizacao em duplicidades;
- validar retencao do arquivo e das linhas de importacao;
- definir politica de anonimizacao e exclusao conforme orientacao juridica.

## Infraestrutura

- escolher provedor de hospedagem;
- definir ambientes;
- definir dominio, DNS e certificados;
- definir backup, retencao e objetivo de restauracao;
- configurar alertas e responsaveis operacionais.

## Sistema atual

- acessar o Essence GO Industrial somente quando autorizado;
- inventariar exportacoes e eventual API;
- decidir se pedidos e movimentacoes entrarao em uma fase posterior.
