# Protecao de Dados e Privacidade

Este documento define requisitos tecnicos iniciais. Base legal, textos de consentimento, prazos de retencao e atendimento de direitos precisam de validacao juridica e operacional antes da producao.

## Dados tratados inicialmente

- nome;
- telefone e WhatsApp;
- e-mail opcional;
- endereco e bairro opcionais;
- data de nascimento opcional;
- tipo, etiquetas e interesses;
- permissao de comunicacao;
- participacao e resultado em acoes comerciais;
- auditoria de operacoes.

## Principios de implementacao

- coletar apenas campos necessarios ao uso declarado;
- separar permissao por canal e finalidade;
- restringir dados pelo tenant e papel;
- evitar dados pessoais em logs e mensagens de erro;
- proteger segredos e trafego;
- auditar alteracoes e envios;
- permitir correcao e inativacao;
- definir exportacao, anonimização e exclusao antes da producao;
- documentar operadores externos envolvidos no processamento.

## Importacoes

- arquivos devem ser autorizados pela LavaMais;
- pre-visualizacao nao deve expor dados alem do necessario;
- conteudo pendente de importacao fica no PostgreSQL, isolado por tenant, e e removido apos a confirmacao;
- prazo de retencao precisa ser configurado;
- linhas rejeitadas nao devem permanecer indefinidamente sem finalidade.

## Mensagens

- elegibilidade verifica permissao de comunicacao;
- destinatarios sao congelados para auditoria;
- conteudo e dados enviados ao WhatsMiau ou a futura Central sao limitados ao necessario para a mensagem congelada;
- WhatsMiau e demais operadores externos devem constar da avaliacao juridica e contratual;
- revogacao futura impede novas acoes, sem apagar automaticamente o historico necessario a auditoria.

## Pendencias obrigatorias antes da producao

- validar textos, finalidade e base aplicavel com responsavel qualificado;
- definir prazos de retencao;
- definir procedimento de solicitacao do titular;
- definir resposta a incidente;
- revisar contratos e responsabilidades dos provedores;
- testar backup, restauracao e controle de acesso.
