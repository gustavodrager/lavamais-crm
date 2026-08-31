# Comunicacao por WhatsApp

## Canal inicial

A Versao 1.0 usa o WhatsMiau para o envio local de WhatsApp. A integracao fica atras de uma porta de notificacoes que tambem possui adaptador para a futura Central de Notificacao. O CRM nao abre links `wa.me` e o navegador nunca acessa o provedor.

## Responsabilidades do CRM

- selecionar destinatarios elegiveis;
- apresentar o modelo comercial e suas variaveis;
- congelar o conteudo final antes do envio;
- criar uma chave de idempotencia por destinatario e tenant;
- registrar a origem e o identificador da notificacao;
- manter a outbox como unica fila;
- consolidar submissao, entrega, leitura ou falha;
- registrar o resultado comercial informado pela equipe.

No modo local, o modulo `Integracoes` tambem guarda o estado tecnico retornado pelo WhatsMiau. Quando o modo `Central` for ativado, o estado tecnico detalhado volta a pertencer ao servico externo sem alterar o fluxo comercial.

## Mensagens proativas

Acoes comerciais sao comunicacoes proativas. Os modelos devem ser revisados e seus parametros sao controlados. A Versao 1.0 nao permite editar livremente o corpo depois da preparacao.

O usuario seleciona um destinatario da audiencia, confere o telefone e a mensagem final renderizada e confirma um unico envio. O CRM nao oferece disparo coletivo na Versao 1.0.

## Estados apresentados pelo CRM

- `Pendente`;
- `AguardandoSolicitacao`;
- `Solicitado`;
- `Enviado`;
- `Entregue`;
- `Lido`;
- `Falhou`.

Esses estados sao uma projecao comercial estavel e nao expõem nomes internos do WhatsMiau ou da Central.
