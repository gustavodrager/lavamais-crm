# Historias de Usuario da Versao 1.0

## Acesso

### HU01 — Entrar no CRM

Como usuario autorizado, quero entrar pelo Identity Hub para acessar o tenant selecionado sem manter outra senha.

## Clientes

### HU02 — Cadastrar cliente

Como operador, quero cadastrar nome e WhatsApp para incluir um cliente na base de relacionamento.

### HU03 — Buscar e editar cliente

Como operador, quero localizar um cliente por nome, WhatsApp ou bairro e manter seus dados atualizados.

### HU04 — Registrar permissao

Como operador, quero registrar a preferencia de comunicacao do cliente para evitar contatos indevidos.

### HU05 — Importar clientes

Como administrador, quero revisar e importar um CSV para iniciar a base sem cadastrar cada cliente manualmente.

## Catalogo e modelos

### HU06 — Manter item do catalogo

Como gerente, quero cadastrar produtos e servicos para relaciona-los a uma Acao Comercial.

### HU07 — Manter modelo comercial

Como administrador, quero disponibilizar um modelo aprovado para que a equipe use mensagens consistentes.

## Acao Comercial

### HU08 — Criar acao

Como gerente, quero informar nome, objetivo e item do catalogo para iniciar uma Acao Comercial.

### HU09 — Definir publico

Como gerente, quero filtrar ou selecionar clientes e visualizar quantos estao elegiveis.

### HU10 — Revisar destinatarios

Como gerente, quero revisar e remover destinatarios antes de preparar a acao.

### HU11 — Preparar acao

Como gerente, quero congelar publico e modelo para impedir mudancas silenciosas durante o envio.

### HU12 — Executar acao

Como gerente, quero iniciar o envio para que o Worker solicite mensagens idempotentes ao Notification Hub.

### HU13 — Acompanhar envios

Como operador, quero visualizar o estado de cada destinatario para entender o andamento da acao.

### HU14 — Registrar resultado

Como operador, quero registrar resposta, interesse ou conversao para avaliar o resultado comercial.

## Auditoria

### HU15 — Consultar trilha

Como administrador, quero consultar operacoes sensiveis para investigar alteracoes e envios.
