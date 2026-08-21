# Integracao com Notification Hub

Verificado em: 2026-08-15.

## Papel do servico

O Notification Hub e responsavel pelo processamento tecnico das mensagens. O CRM e responsavel por decidir quem recebera, por que recebera e qual foi o resultado comercial.

## Capacidades confirmadas

- canal `Whatsapp` pela WhatsApp Cloud API;
- canais futuros `Email` e `Sms` ja disponiveis no hub;
- PostgreSQL como fila duravel;
- lease recuperavel, retry exponencial e limite de tentativas;
- idempotencia por `source + idempotencyKey`;
- snapshot do template no momento da criacao;
- agendamento por `scheduledAt`;
- status de processamento e entrega;
- templates de provedor para WhatsApp proativo;
- autenticacao por `X-Api-Key` e isolamento por origem.

## Configuracao do CRM

```text
NotificationHub__BaseUrl
NotificationHub__ApiKey
NotificationHub__Source=lavamais-crm
```

A chave configurada no hub para a origem deve corresponder ao campo `source`. As variaveis sao segredos de servidor e ficam apenas na API/Worker.

## Criacao de notificacao

Endpoint:

```text
POST /api/v1/notifications
X-Api-Key: segredo do cliente lavamais-crm
```

Exemplo do contrato externo:

```json
{
  "source": "lavamais-crm",
  "channel": "Whatsapp",
  "templateKey": "lavamais.acao-comercial.tapetes.v1",
  "idempotencyKey": "acao:6c1...:destinatario:91a...:v1",
  "recipientName": "Maria",
  "recipientPhone": "+5513999999999",
  "payload": {
    "nomeCliente": "Maria",
    "itemCatalogo": "Lavagem de tapetes"
  }
}
```

Os nomes em ingles sao preservados porque pertencem ao contrato externo do Notification Hub.

## Templates

Templates tecnicos exigem chave administrativa do hub e serao provisionados por operacao controlada. A interface comum do CRM nao recebe a chave administrativa.

Cada versao publicada de `ModeloDeMensagem` referencia uma `templateKey` existente. Para WhatsApp proativo, o template do hub deve possuir:

- `providerTemplateName`;
- `providerTemplateLanguage`;
- `providerTemplateBodyParameterKeys` na ordem aprovada pela Meta.

## Idempotencia

Padrao inicial:

```text
acao:{acaoId}:destinatario:{destinatarioId}:v1
```

O Worker sempre repete a mesma chave ao recuperar uma operacao incerta. Uma nova versao da solicitacao exige decisao explicita; nao se incrementa a chave para contornar falha.

## Reconciliacao

O Worker consulta `GET /api/v1/notifications/{id}` enquanto o envio nao estiver finalizado e converte:

- `Pending` ou `Processing` para `Solicitado`;
- `Sent` para `Enviado`;
- `Failed` para `Falhou`;
- `Delivered` para `Entregue`;
- `Read` para `Lido`;
- `Undeliverable` para `Falhou`.

O CRM nao copia tentativas, resposta bruta do provedor ou webhook da Meta. Esses dados continuam no hub.

## Escopo inicial

Embora o hub suporte agendamento, e-mail e SMS, a interface da Versao 1.0 oferece apenas envio imediato individual por WhatsApp, confirmado por destinatario. Nao existe disparo coletivo no CRM.

## Fonte verificada

Contrato confirmado no repositorio local `quebranunca/notification-hub`, especialmente em `README.md`, `docs/api-contracts.md`, `Contracts.cs` e `Entities.cs`.
