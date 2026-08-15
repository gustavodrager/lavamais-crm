# Fluxo da Acao Comercial

## Pre-condicoes

- usuario autenticado no tenant correto;
- usuario com papel `Administrador` ou `Gerente`;
- clientes ativos com WhatsApp e permissao de comunicacao;
- item de catalogo ativo;
- versao publicada de modelo vinculada a template tecnico existente.

## 1. Criar rascunho

O usuario informa nome, objetivo e item do catalogo. A acao recebe estado `Rascunho`.

## 2. Definir publico

O usuario combina filtros permitidos ou seleciona clientes manualmente. Os criterios sao salvos como estrutura tipada e versionada.

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

## 6. Iniciar

O sistema muda a acao para `EmProcessamento` e cria mensagens de outbox para os destinatarios. O Worker processa cada mensagem de forma independente.

## 7. Solicitar notificacao

O Worker chama o Notification Hub com origem, chave de template, telefone, payload e chave de idempotencia. O identificador retornado e salvo no destinatario.

Falha de rede mantem a outbox elegivel para nova tentativa com a mesma chave.

## 8. Reconciliar

O Worker consulta notificacoes nao finalizadas e atualiza a projecao do CRM para `Enviado`, `Entregue`, `Lido` ou `Falhou`.

## 9. Concluir

Quando todos os destinatarios terminam:

- sem falhas: `Concluida`;
- com pelo menos uma falha: `ConcluidaComFalhas`.

## 10. Registrar resultado

Operadores registram o retorno comercial independentemente do estado tecnico. Uma conversao pode receber valor opcional, sem criar pedido ou faturamento.

## Invariantes

- tenant nunca muda durante o fluxo;
- cliente aparece uma vez por acao;
- acao preparada e imutavel no conteudo comercial;
- repetir a solicitacao nao duplica notificacao;
- falha de um destinatario nao bloqueia os demais;
- resultado comercial nao e inferido automaticamente.
