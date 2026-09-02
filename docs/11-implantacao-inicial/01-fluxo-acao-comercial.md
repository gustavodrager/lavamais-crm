# Fluxo da Acao Comercial

## Pre-condicoes

- usuario autenticado no tenant correto;
- usuario com papel `Administrador` ou `Gerente` para criar/preparar a acao; `Operador` pode consultar a acao, abrir conversas, confirmar envios individuais e registrar resultados;
- clientes ativos com WhatsApp e permissao de comunicacao;
- item de catalogo ativo, quando informado ou exigido pelo modelo;
- versao publicada de modelo de mensagem.

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

## 7. Abrir a conversa

O CRM abre `wa.me` em uma janela auxiliar com telefone e conteudo congelados. Se o navegador bloquear o popup, oferece uma nova aba. A abertura registra auditoria e mantem o destinatario `Pendente`.

## 8. Enviar no WhatsApp

A pessoa confere a conversa e envia dentro do WhatsApp oficial. O WhatsApp pode solicitar QR Code quando a sessao nao estiver vinculada. O CRM nao le a sessao nem a conversa.

## 9. Confirmar manualmente

Depois do envio real, a pessoa volta ao CRM e confirma `Sim, eu enviei`. O sistema muda somente aquele destinatario de `Pendente` para `Enviado`, registra usuario e horario e inicia a acao na primeira confirmacao. A confirmacao pode ser feita por `Administrador`, `Gerente` ou `Operador`.

O CRM nao possui entrega ou leitura tecnica. Repeticao concorrente e versao desatualizada retornam conflito.

## 10. Concluir

Quando todos os destinatarios congelados estao `Enviado`, a acao muda para `Concluida`.

Enquanto existir destinatario `Pendente`, a acao permanece disponivel para novos envios individuais.

## 11. Registrar resultado

Operadores registram o retorno comercial depois da confirmacao do envio. Uma conversao pode receber valor opcional, sem criar pedido ou faturamento.

## Invariantes

- tenant nunca muda durante o fluxo;
- cliente aparece uma vez por acao;
- acao preparada e imutavel no conteudo comercial;
- abrir a conversa nao confirma o envio;
- cada confirmacao humana altera no maximo um destinatario;
- nao existe disparo coletivo na Versao 1.0;
- resultado comercial nao e inferido automaticamente.
