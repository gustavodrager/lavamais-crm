# Comunicacao por WhatsApp

## Canal inicial

A Versao 1.0 usa WhatsApp por meio do Notification Hub e da WhatsApp Cloud API. O CRM nao abre links `wa.me` e nao conversa diretamente com a Meta.

## Responsabilidades do CRM

- selecionar destinatarios elegiveis;
- apresentar o modelo comercial e suas variaveis;
- criar uma chave de idempotencia por destinatario;
- solicitar a notificacao ao Notification Hub;
- guardar o identificador externo;
- reconciliar o estado consolidado;
- registrar o resultado comercial informado pela equipe.

## Responsabilidades do Notification Hub

- renderizar e congelar o template tecnico;
- enfileirar e processar o envio;
- aplicar retry;
- registrar tentativas e respostas do provedor;
- receber webhooks da Meta;
- distinguir submissao, entrega, leitura e falha.

## Mensagens proativas

Acoes comerciais sao comunicacoes proativas. Portanto, usam templates aprovados no provedor e parametros ordenados. A Versao 1.0 nao permite editar livremente o corpo depois de escolher o template.

O usuario seleciona um destinatario da audiencia, confere o telefone e a mensagem final renderizada e confirma um unico envio. O CRM nao oferece disparo coletivo na Versao 1.0.

## Estados apresentados pelo CRM

- `Pendente`;
- `Solicitada`;
- `Enviada`;
- `Entregue`;
- `Lida`;
- `Falhou`;
- `Removida`.

Os estados tecnicos originais permanecem no Notification Hub; o CRM mantem uma projecao voltada ao usuario.
