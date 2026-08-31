# Integracao de Notificacoes

Decisao vigente: [ADR-017](../../10-decisoes/ADR-017-notificacoes-locais-com-whatsmiau.md).

## Fronteira

`AcoesComerciais` publica uma solicitacao neutra contendo canal, chave do modelo, chave de idempotencia, destinatario, conteudo congelado e parametros. O modulo `Integracoes` escolhe o adaptador e devolve uma referencia com `servico + id`.

Modos disponiveis:

- `Desabilitado`: API bloqueia novas intencoes e Worker aguarda;
- `Local`: CRM persiste o estado tecnico e usa o WhatsMiau;
- `Central`: CRM usa o contrato HTTP da futura Central de Notificacao.

A outbox transacional e a unica fila nos tres modos.

## Configuracao local

```text
Notificacoes__Modo=Local
Notificacoes__WhatsMiau__BaseUrl=https://api.whatsmiau.dev/v2
Notificacoes__WhatsMiau__ApiKey=<segredo>
Notificacoes__WhatsMiau__NomeInstancia=<instancia>
Notificacoes__WhatsMiau__SegredoWebhook=<segredo-longo-e-aleatorio>
```

API e Worker recebem os mesmos valores. A `ApiKey` e o segredo do webhook nunca chegam ao BFF ou ao navegador.

## Envio pelo WhatsMiau

Contrato confirmado no projeto Parsero:

```text
POST /message/sendText/{instanceName}
apikey: <segredo>
```

```json
{
  "number": "5513999999999",
  "text": "Ola, Maria!"
}
```

O identificador e lido de `key.id`. O registro `integracoes.notificacoes_locais` guarda o snapshot enviado, a chave unica por tenant, o identificador no provedor e o estado tecnico. Respostas completas e credenciais nao sao persistidas.

## Webhook

O WhatsMiau deve publicar `messages.update` em:

```text
POST /api/v1/webhooks/whatsmiau/{segredo}
```

O corpo e limitado a 256 KiB. Segredo incorreto, evento desconhecido, corpo invalido e processamento aceito recebem HTTP 200 para nao criar um oraculo de autenticacao. O valor do segredo e substituido por `{segredo}` em logs e atividades.

Conversao vigente:

| Status | Estado local |
|---|---|
| `SERVER_ACK` | `Submetida` |
| `DELIVERY_ACK` | `Entregue` |
| `READ`, `PLAYED` | `Lida` |
| `ERROR`, `ERROR_ACK`, `FAILED` | `NaoEntregue` |

Eventos repetidos ou atrasados nao fazem o estado regredir.

## Idempotencia e falhas

A chave inicial e `acao:{acaoId}:destinatario:{destinatarioId}:v1`. Criar novamente a mesma notificacao local devolve a referencia existente e nao chama o WhatsMiau depois de um resultado final.

- HTTP 429 mantem a notificacao pendente e reagenda a outbox;
- rejeicao 4xx encerra a notificacao como falha;
- HTTP 408 ou 5xx, timeout ou falha de rede sem resposta usam `resultado_envio_indeterminado` e nao reenviam automaticamente;
- uma tentativa interrompida depois de persistir o estado `Enviando` tambem se torna indeterminada no proximo ciclo, protegendo contra duplicidade depois de reiniciar o Worker;
- resposta 2xx sem `key.id` usa `resposta_sem_identificador`.

Antes da implantacao, deve-se confirmar que nao existem registros pendentes da outbox com o contrato antigo. Caso um registro sem o conteudo congelado seja encontrado, o Worker encerra o item com `conteudo_outbox_incompativel` em vez de tentar reconstruir ou enviar uma mensagem potencialmente diferente.

## Adaptador da Central

O modo futuro usa:

```text
Notificacoes__Modo=Central
Notificacoes__Central__BaseUrl=<url>
Notificacoes__Central__ApiKey=<segredo>
Notificacoes__Central__Origem=lavamais-crm
```

O adaptador envia o contrato externo com `source`, `channel`, `templateKey`, `idempotencyKey`, `recipientName`, `recipientPhone` e `payload`. Na reconciliacao, `deliveryStatus` tem precedencia sobre `status`, corrigindo a distincao entre envio, entrega e leitura.

Referencias ja criadas continuam consultadas pelo adaptador indicado no destinatario, mesmo depois de mudar o modo para novas mensagens.
