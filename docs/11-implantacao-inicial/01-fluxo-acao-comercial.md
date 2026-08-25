# Fluxo da Acao Comercial

## Pre-condicoes

- usuario autenticado no tenant correto;
- usuario com papel `Administrador` ou `Gerente` para criar/preparar a acao; `Operador` pode consultar a acao e registrar resultados;
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

O usuario seleciona um destinatario congelado da acao. O CRM apresenta nome, WhatsApp e conteudo final montado. O template e seus parametros ja estao congelados e nao permitem edicao livre.

## 7. Solicitar envio individual

Depois de uma confirmacao explicita, o sistema muda somente aquele destinatario para `AguardandoSolicitacao` e cria uma unica mensagem de outbox. A primeira solicitacao muda a acao para `EmProcessamento`. Nao existe comando de disparo coletivo na Versao 1.0.

## 8. Solicitar notificacao

O Worker chama o Notification Hub com origem, chave de template, telefone, payload e chave de idempotencia. O identificador retornado e salvo no destinatario.

Falha de rede mantem a outbox elegivel para nova tentativa com a mesma chave.

## 9. Reconciliar

O Worker consulta notificacoes nao finalizadas e atualiza a projecao do CRM para `Enviado`, `Entregue`, `Lido` ou `Falhou`.

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
