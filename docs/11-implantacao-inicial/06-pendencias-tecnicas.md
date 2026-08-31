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

## Movimentacoes comerciais

- concluir migration e snapshot do novo modulo;
- adicionar testes de dominio, persistencia, autorizacao e tenant;
- atualizar OpenAPI e frontend;
- incluir o modulo no Migrador e nos testes arquiteturais;
- atualizar documentacao de dados e API quando a implementacao estiver concluida.

## Contratos

- decidir entre cliente TypeScript gerado pelo OpenAPI ou contratos manuais com teste de compatibilidade;
- manter mudancas HTTP acompanhadas de testes e documentacao.
