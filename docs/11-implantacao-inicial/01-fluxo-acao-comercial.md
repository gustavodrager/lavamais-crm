# Fluxo da Acao Comercial

## Pre-condicoes

- usuario autenticado no tenant correto;
- usuario com papel `Administrador` ou `Gerente` para criar/preparar a acao; `Operador` pode consultar a acao, solicitar envio individual de mensagens ja preparadas e registrar resultados;
- clientes ativos com WhatsApp e permissao de comunicacao;
- item de catalogo ativo, quando informado ou exigido pelo modelo;
- versao publicada de modelo vinculada a template tecnico existente.

## 1. Criar rascunho

O usuario informa nome, objetivo e item do catalogo. A acao recebe estado `Rascunho`.

## 2. Definir publico

Para agilizar o atendimento, a interface oferece tres formas de montar uma lista de ate 10 clientes:

- trazer 10 clientes elegiveis automaticamente;
- escolher pelo nome ou WhatsApp;
- escolher por regiao, informando uma cidade atendida e, opcionalmente, bairros.

Na opcao por regiao, o sistema simula os filtros, seleciona os primeiros 10 clientes elegiveis e salva essa lista como selecao manual. Os criterios sao salvos como estrutura tipada e versionada.

## 3. Simular

O sistema retorna:

- quantidade encontrada;
- quantidade elegivel;
- amostra paginada;
- exclusoes por cliente inativo, contato invalido, falta de permissao ou duplicidade.

A simulacao nao cria destinatarios.

## 4. Escolher modelo

O usuario escolhe uma versao publicada compativel com WhatsApp e visualiza o conteudo com exemplos de parametros.

## 5. Preparar

Em uma operacao consistente, o sistema:

1. valida estado e concorrencia;
2. reavalia elegibilidade;
3. cria os destinatarios congelados;
4. grava snapshots necessarios;
5. muda a acao para `Preparada`;
6. registra auditoria.

Depois disso, criterios, item e modelo nao podem ser alterados.

## 6. Selecionar e conferir destinatario

O usuario seleciona um destinatario congelado da acao. Para o `Operador`, a interface prioriza uma fila simples e ja abre o proximo destinatario pendente. O CRM apresenta nome, WhatsApp e conteudo final montado. O template e seus parametros ja estao congelados e nao permitem edicao livre.

## 7. Solicitar envio individual

Depois de uma confirmacao explicita, o sistema muda somente aquele destinatario para `AguardandoSolicitacao` e cria uma unica mensagem de outbox. A confirmacao individual pode ser feita por `Administrador`, `Gerente` ou `Operador`. A primeira solicitacao muda a acao para `EmProcessamento`. Nao existe comando de disparo coletivo na Versao 1.0.

## 8. Solicitar notificacao

O Worker chama a porta de notificacoes com chave do modelo, telefone, conteudo congelado, parametros e chave de idempotencia. No modo local, o WhatsMiau recebe o texto e seu identificador e salvo junto da origem `Local`; no modo futuro, a mesma referencia indica `Central`.

Resposta HTTP temporaria mantem a outbox elegivel para nova tentativa com a mesma chave. Falha de rede com resultado incerto termina em falha para evitar duplicidade automatica.

## 9. Reconciliar

O Worker consulta notificacoes nao finalizadas no adaptador que as criou e atualiza a projecao do CRM para `Enviado`, `Entregue`, `Lido` ou `Falhou`. No modo local, o webhook `messages.update` alimenta o estado tecnico antes da reconciliacao.

## 10. Concluir

Quando todos os destinatarios congelados foram solicitados e terminam:

- sem falhas: `Concluida`;
- com pelo menos uma falha: `ConcluidaComFalhas`.

Enquanto existir destinatario `Pendente`, a acao permanece disponivel para novos envios individuais.

## 11. Registrar resultado

Operadores registram o retorno comercial independentemente do estado tecnico. Uma conversao pode receber valor opcional, sem criar pedido ou faturamento.

## Invariantes

- tenant nunca muda durante o fluxo;
- cliente aparece uma vez por acao;
- acao preparada e imutavel no conteudo comercial;
- repetir a solicitacao nao duplica notificacao;
- cada confirmacao humana solicita no maximo um destinatario;
- nao existe disparo coletivo na Versao 1.0;
- falha de um destinatario nao bloqueia os demais;
- resultado comercial nao e inferido automaticamente.
