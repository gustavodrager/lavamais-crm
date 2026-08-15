# Regras de Acoes Comerciais

## Estados da acao

```text
Rascunho
  ↓ preparar
Preparada
  ↓ iniciar
EmProcessamento
  ↓
Concluida ou ConcluidaComFalhas

Rascunho ou Preparada → Cancelada
```

## Regras de transicao

- `Rascunho` aceita alteracoes de objetivo, item, criterios e modelo.
- `Preparada` possui audiencia congelada e nao aceita alteracoes comerciais.
- `EmProcessamento` nao pode ser cancelada globalmente depois que o primeiro envio foi solicitado.
- `Concluida` indica que todos os destinatarios terminaram sem falha tecnica.
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

## Resultado comercial

O resultado comercial nao altera automaticamente o estado tecnico e vice-versa. `Convertido` exige registro humano na Versao 1.0.

## Campanhas

Campanhas recorrentes, pausaveis, agendadas ou multietapas pertencem ao roadmap e nao devem ser misturadas ao agregado inicial.
