# Regras de WhatsApp

## Canal e adaptador

- A Versao 1.0 usa o WhatsMiau no modo `Local`.
- O navegador nunca chama o WhatsMiau ou a Central diretamente.
- Comunicacao proativa usa modelo revisado, parametros controlados e conteudo congelado.
- O adaptador pode migrar de `Local` para `Central` sem mudar a Acao Comercial.

## Identificacao

- `chaveModelo`: chave tecnica estavel vinculada a versao do modelo comercial;
- `chaveIdempotencia`: `acao:{acaoId}:destinatario:{destinatarioId}:v1`;
- `telefoneDestinatario`: telefone normalizado e congelado no destinatario da acao;
- `referencia`: origem `Local` ou `Central` junto ao identificador retornado.

## Estados

O CRM converte os estados do WhatsMiau para sua projecao de apresentacao:

| WhatsMiau | CRM |
|---|---|
| resposta com `key.id` ou `SERVER_ACK` | `Enviado` |
| `DELIVERY_ACK` | `Entregue` |
| `READ` ou `PLAYED` | `Lido` |
| `ERROR`, `ERROR_ACK` ou `FAILED` | `Falhou` |

No modo `Central`, `deliveryStatus` prevalece sobre o estado de processamento: `Delivered` vira `Entregue`, `Read` vira `Lido` e `Undeliverable` vira `Falhou`.

## Confiabilidade

- A outbox registra a intencao na mesma transacao da mudanca do destinatario.
- Cada intencao nasce de uma confirmacao individual depois da conferencia da mensagem.
- Um comando nunca cria intencoes para varios destinatarios.
- A chave de idempotencia e unica por tenant.
- A tabela de notificacoes locais guarda estado tecnico e nao constitui uma segunda fila.
- Respostas HTTP temporarias do WhatsMiau podem reagendar a outbox.
- Timeout ou falha de rede com resultado incerto termina em falha para evitar duplicidade automatica.
- Atualizacoes de entrega sao idempotentes e nao regridem `Entregue` ou `Lido`.

## Limites

Agendamento, mensagens livres, e-mail e SMS nao aparecem na interface inicial. A integracao local nao autoriza edicao do texto depois da preparacao nem disparo coletivo.
