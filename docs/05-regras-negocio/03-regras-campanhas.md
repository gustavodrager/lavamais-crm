# Regras de Acoes Comerciais

## Estados da acao

```text
Rascunho
  ↓ preparar
Preparada
  ↓ primeira confirmacao individual
EmProcessamento
  ↓
Concluida

Rascunho ou Preparada → Cancelada
```

## Regras de transicao

- `Rascunho` aceita alteracoes de objetivo, item, criterios e modelo.
- `Preparada` possui audiencia congelada e nao aceita alteracoes comerciais.
- `Preparada` permite selecionar, conferir e abrir um destinatario por vez.
- A primeira confirmacao manual muda a acao para `EmProcessamento`.
- `EmProcessamento` nao pode ser cancelada globalmente depois da primeira confirmacao.
- `Concluida` indica que todos os destinatarios foram confirmados manualmente.
- `ConcluidaComFalhas` permanece somente para compatibilidade com dados historicos e nao e produzida pelo fluxo vigente.

## Estados por destinatario

- `Pendente`;
- `Enviado`;

## Envio individual

- nao existe disparo coletivo na Versao 1.0;
- o usuario seleciona um destinatario `Pendente` da audiencia congelada;
- nome, destino e mensagem final sao apresentados antes da confirmacao;
- a mensagem usa template aprovado e nao admite edicao livre;
- abrir o WhatsApp audita a tentativa sem mudar o estado;
- a confirmacao manual muda no maximo um destinatario para `Enviado`;
- destinatario ja confirmado ou versao desatualizada causa conflito;
- enquanto existir destinatario `Pendente`, a acao permanece aberta para novos envios individuais.

## Resultado comercial

O resultado comercial exige um destinatario `Enviado`. `Convertido` continua sendo um registro humano e nao e inferido da conversa.

## Campanhas

Campanhas recorrentes, pausaveis, agendadas ou multietapas pertencem ao roadmap e nao devem ser misturadas ao agregado inicial.
