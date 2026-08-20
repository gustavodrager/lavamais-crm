# Regras de WhatsApp

## Canal e provedor

- A Versao 1.0 usa o canal `Whatsapp` do Notification Hub.
- O CRM nao armazena credenciais da Meta.
- O navegador nunca chama o Notification Hub diretamente.
- Comunicacao proativa usa template aprovado e parametros controlados.

## Identificacao

- `source`: identificador configurado para o LavaMais CRM.
- `templateKey`: chave tecnica vinculada a versao do modelo comercial.
- `idempotencyKey`: `acao:{acaoId}:destinatario:{destinatarioId}:v1`.
- `recipientPhone`: telefone normalizado e congelado no destinatario da acao.

## Estados

O CRM converte os estados do hub para sua projecao de apresentacao:

| Notification Hub | CRM |
|---|---|
| `Pending` | `Solicitada` |
| `Processing` | `Solicitada` |
| `Sent` | `Enviada` |
| `Failed` | `Falhou` |
| `DeliveryStatus.Delivered` | `Entregue` |
| `DeliveryStatus.Read` | `Lida` |
| `DeliveryStatus.Undeliverable` | `Falhou` |

## Confiabilidade

- A outbox do CRM registra a intencao de envio na mesma transacao da mudanca de estado do destinatario.
- Cada intencao nasce de uma confirmacao individual depois da conferencia da mensagem montada.
- Um comando nunca cria intencoes para varios destinatarios.
- O Worker pode repetir a chamada com a mesma chave.
- O Notification Hub e responsavel por lease, retry e tentativa tecnica.
- O Worker reconcilia periodicamente notificacoes ainda nao finalizadas.

## Limites

Agendamento, mensagens livres, e-mail e SMS nao aparecem na interface inicial, mesmo que o Notification Hub possua essas capacidades.
