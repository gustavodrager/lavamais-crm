# Pendencias Tecnicas e de Integracoes

## Identidade e sessoes

- configurar telefone, tenant e nomes por ambiente;
- executar primeiro acesso antes de divulgar a URL;
- validar login e continuidade da sessao depois de reinicios e entre instancias;
- definir recuperacao controlada enquanto nao existe fluxo automatico de senha;
- remover configuracoes residuais de OIDC do backend quando nao houver conflito com outra frente.

## Notificacoes

- provisionar uma instancia autorizada e a `apikey` do WhatsMiau por ambiente;
- cadastrar a URL de `messages.update` com segredo exclusivo;
- revisar os modelos e confirmar o uso operacional de `sendText` antes da producao;
- validar envio, entrega, leitura, falha e resultado incerto com destinatario autorizado;
- iniciar o Worker com uma replica somente depois dessa validacao;
- homologar o adaptador `Central` antes de uma migracao futura.

## Auditoria

- definir a matriz minima de eventos criticos por modulo;
- completar a instrumentacao de identidade, usuarios, clientes, importacoes e Movimentacoes Comerciais;
- adicionar testes que comprovem tenant, autor, recurso e ausencia de dados sensiveis nos detalhes;
- decidir se a consulta pela API e suficiente para a Versao 1.0 ou se uma tela administrativa sera exigida antes da producao.

## Contratos

- decidir entre cliente TypeScript gerado pelo OpenAPI ou contratos manuais com teste de compatibilidade;
- manter mudancas HTTP acompanhadas de testes e documentacao.
- publicar e conferir o OpenAPI do ambiente de homologacao depois de cada deploy.
