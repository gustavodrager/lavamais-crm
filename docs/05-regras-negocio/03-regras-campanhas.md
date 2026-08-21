# Regras de Acoes Comerciais

## Estados da acao

```text
Rascunho
  ↓ preparar
Preparada
  ↓ primeiro envio individual
EmProcessamento
  ↓
Concluida ou ConcluidaComFalhas

Rascunho ou Preparada → Cancelada
```

## Regras de transicao

- `Rascunho` aceita alteracoes de objetivo, item, criterios e modelo.
- `Preparada` possui audiencia congelada e nao aceita alteracoes comerciais.
- `Preparada` permite selecionar, conferir e solicitar um destinatario por vez.
- A primeira solicitacao individual muda a acao para `EmProcessamento`.
- `EmProcessamento` nao pode ser cancelada globalmente depois que o primeiro envio foi solicitado.
- `Concluida` indica que todos os destinatarios foram solicitados e terminaram sem falha tecnica.
- `ConcluidaComFalhas` indica pelo menos uma falha tecnica final.
- Uma nova tentativa comercial deve ser uma nova acao; reprocessamento tecnico preserva a mesma acao e idempotencia.

## Estados por destinatario

- `Pendente`;
- `Removido`;
- `AguardandoSolicitacao`;
- `Solicitado`;
- `Enviado`;
- `Entregue`;
- `Lido`;
- `Falhou`.

## Envio individual

- nao existe disparo coletivo na Versao 1.0;
- o usuario seleciona um destinatario `Pendente` da audiencia congelada;
- nome, destino e mensagem final sao apresentados antes da confirmacao;
- a mensagem usa template aprovado e nao admite edicao livre;
- uma confirmacao cria no maximo uma intencao na outbox;
- destinatario ja solicitado ou versao desatualizada causa conflito sem duplicar notificacao;
- enquanto existir destinatario `Pendente`, a acao permanece aberta para novos envios individuais.

## Resultado comercial

O resultado comercial nao altera automaticamente o estado tecnico e vice-versa. `Convertido` exige registro humano na Versao 1.0.

## Campanhas

Campanhas recorrentes, pausaveis, agendadas ou multietapas pertencem ao roadmap e nao devem ser misturadas ao agregado inicial.
