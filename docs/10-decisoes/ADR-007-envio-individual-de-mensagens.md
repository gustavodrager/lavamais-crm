# ADR-007 — Envio individual de mensagens da Acao Comercial

- Status: aceito; mecanismo de envio e estados substituidos pelo ADR-021
- Data: 2026-08-20
- Substitui parcialmente: ADR-005, apenas quanto ao modo de iniciar o envio

> Registro historico: a decisao de conferencia individual permanece vigente. Outbox, Worker, provedor e estados tecnicos descritos abaixo foram substituidos pelo [ADR-021](ADR-021-whatsapp-web-assistido.md).

## Contexto

O fluxo implementado inicialmente permitia iniciar uma Acao Comercial e criar, em uma unica operacao, solicitacoes de envio para todos os destinatarios congelados. A operacao comercial desejada exige controle humano por contato: o usuario seleciona um cliente da audiencia, confere a mensagem final montada e decide quando enviar apenas aquela mensagem.

O envio coletivo contraria essa experiencia, aumenta o risco de disparo acidental e impede a conferencia individual do conteudo e do destino.

## Decisao

A Versao 1.0 nao possui comando de disparo coletivo.

Depois de preparar a Acao Comercial:

1. a audiencia permanece congelada;
2. o usuario seleciona um destinatario elegivel na lista da acao;
3. o CRM apresenta nome, destino e conteudo final congelado;
4. o conteudo pode ser conferido, mas nao editado livremente;
5. uma confirmacao explicita solicita o envio somente daquele destinatario;
6. API, outbox e Worker processam uma solicitacao individual e idempotente;
7. o procedimento pode ser repetido, um destinatario por vez.

O endpoint coletivo `POST /api/v1/acoes-comerciais/{id}/iniciar` deixa de fazer parte do contrato vigente. O contrato individual e:

```text
POST /api/v1/acoes-comerciais/{acaoId}/destinatarios/{destinatarioId}/enviar
```

O corpo possui somente a versao de concorrencia do destinatario:

```json
{
  "versao": 3
}
```

Uma solicitacao aceita retorna `202 Accepted` com a representacao atualizada:

```json
{
  "id": "3f52de7f-8048-4c10-95e2-3888bd432684",
  "situacaoEnvio": "AguardandoSolicitacao",
  "versao": 4
}
```

## Regras do comando

- exige usuario autenticado com papel `Administrador` ou `Gerente`;
- deriva o tenant exclusivamente do token;
- valida que acao e destinatario pertencem ao mesmo tenant e que o destinatario pertence a acao;
- aceita somente audiencia preparada e destinatario ainda nao solicitado;
- valida concorrencia pela versao do destinatario;
- grava a intencao na outbox na mesma transacao da mudanca para `AguardandoSolicitacao`;
- usa `acao:{acaoId}:destinatario:{destinatarioId}:v1` como chave de idempotencia;
- repeticao concorrente ou destinatario ja solicitado retorna `409 Conflict` e nunca cria outra notificacao;
- credenciais e chamadas ao Notification Hub permanecem no servidor e no Worker.

## Estados

`Preparada` significa audiencia congelada e disponivel para selecao. A primeira solicitacao individual muda a acao para `EmProcessamento`. Cada destinatario segue:

```text
Pendente
  ↓ confirmar envio individual
AguardandoSolicitacao
  ↓ Worker e Notification Hub
Solicitado → Enviado → Entregue → Lido
                         ↘ Falhou
```

A acao termina automaticamente quando todos os destinatarios congelados atingem estado tecnico final. Enquanto existirem destinatarios `Pendente`, ela permanece disponivel para envio individual e nao e concluida automaticamente.

## Consequencias

- o usuario controla destinatario, momento e conferencia de cada mensagem;
- nao existe botao global para iniciar todos os envios;
- frontend deve usar selecao, previa e confirmacao individual;
- API, dominio, Worker e testes atuais de inicio coletivo precisam ser migrados;
- a audiencia e o modelo continuam congelados para impedir mudancas silenciosas;
- a taxa de operacao manual limita naturalmente o volume da Versao 1.0;
- envio em lote, automacao e agendamento permanecem fora do escopo.
