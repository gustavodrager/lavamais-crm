# ADR-017: Notificacoes locais com WhatsMiau e porta para a Central

- Status: Substituida pelo ADR-021
- Data: 2026-08-27

> Registro historico. Esta arquitetura nao integra mais a aplicacao ativa. A decisao vigente e [WhatsApp Web assistido em janela auxiliar](ADR-021-whatsapp-web-assistido.md).

## Contexto

A Central de Notificacao ainda nao esta pronta para operar os envios do LavaMais CRM. A implantacao inicial, porem, precisa concluir o fluxo de envio individual e acompanhamento de mensagens sem criar um acoplamento que torne a futura migracao para a Central uma reescrita de `AcoesComerciais`.

O projeto Parsero ja integra o WhatsMiau pela Evolution API v2. O contrato confirmado usa `POST /message/sendText/{instanceName}`, cabecalho `apikey`, corpo com `number` e `text`, identificador em `key.id` e webhook `messages.update` para submissao, entrega e leitura.

## Decisao

O modulo `Integracoes` passa a expor uma porta neutra de notificacoes e dois adaptadores:

- `Local`, ativo agora, persiste o estado tecnico no PostgreSQL do CRM e envia texto congelado pelo WhatsMiau;
- `Central`, mantido para a migracao futura e compativel com o contrato HTTP ja definido para a Central de Notificacao.

O modo e selecionado por `Notificacoes__Modo`, com os valores `Desabilitado`, `Local` ou `Central`. `AcoesComerciais` conhece apenas a solicitacao neutra e uma referencia composta por `servico + identificador`.

A outbox transacional existente permanece como unica fila. A tabela `integracoes.notificacoes_locais` nao agenda trabalho: ela guarda idempotencia, snapshot enviado, identificador do WhatsMiau e estado tecnico. Nenhum Redis, broker ou segundo mecanismo de filas sera introduzido.

No modo local:

- a chave `acao:{acaoId}:destinatario:{destinatarioId}:v1` e unica por tenant;
- o Worker chama o WhatsMiau com o telefone normalizado e o conteudo congelado na preparacao;
- uma resposta confirmada guarda `key.id`; HTTP 429 devolvido antes do processamento reagenda a outbox;
- timeout, resposta HTTP 408 ou 5xx, falha de rede e interrupcao do Worker depois de iniciar uma tentativa deixam o resultado como indeterminado e nao geram reenvio automatico;
- o webhook autenticado por segredo converte `SERVER_ACK`, `DELIVERY_ACK`, `READ` e `PLAYED` para a projecao do CRM;
- o segredo do webhook e mascarado em logs, atividades e respostas de erro;
- qualquer segredo invalido, evento desconhecido ou corpo invalido recebe a mesma resposta HTTP 200.

O modo `Central` envia `source=lavamais-crm`, template, parametros e chave de idempotencia. Na consulta, `deliveryStatus` tem precedencia sobre o estado de processamento para preservar `Entregue` e `Lido`.

## Seguranca e operacao

Credenciais do WhatsMiau e da Central ficam apenas na API e no Worker. O navegador consulta `GET /api/v1/capacidades` para saber se o envio esta habilitado e nunca recebe chaves ou escolhe o adaptador.

O uso de `sendText` nao comprova por si so aprovacao de template pela Meta. A equipe deve manter modelos comerciais revisados e imutaveis depois da preparacao, usar uma instancia autorizada e aprovar operacionalmente o canal antes de habilita-lo em producao.

## Consequencias

- o CRM pode concluir o fluxo de notificacoes antes da Central;
- a futura migracao exige configuracao e validacao operacional, sem mudanca no modulo de Acoes Comerciais;
- durante uma transicao, referencias antigas continuam reconciliadas pelo adaptador que as criou;
- o CRM assume temporariamente a persistencia do estado tecnico e o recebimento do webhook do WhatsMiau;
- a opcao conservadora para resultado incerto pode exigir reenvio manual depois de verificacao operacional;
- o Worker continua inicialmente com uma replica.

## Decisoes substituidas

Esta decisao substitui somente as partes de notificacao do ADR-003 e do ADR-010. O envio individual do ADR-007 e a identidade local do ADR-011 permanecem vigentes.
