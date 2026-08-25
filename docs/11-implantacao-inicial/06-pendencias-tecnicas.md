# Pendencias Tecnicas e de Integracoes

## Identidade e sessoes

- configurar telefone, tenant e nomes por ambiente;
- executar primeiro acesso antes de divulgar a URL;
- validar login e continuidade da sessao depois de reinicios e entre instancias;
- definir recuperacao controlada enquanto nao existe fluxo automatico de senha;
- remover configuracoes residuais de OIDC do backend quando nao houver conflito com outra frente.

## Notification Hub

- disponibilizar contrato com autenticacao por chave e idempotencia;
- cadastrar origem e chave `lavamais-crm`;
- provisionar templates aprovados pela Meta;
- confirmar nomes e ordem dos parametros;
- definir intervalo de reconciliacao e politica de falha final;
- validar o fluxo antes de habilitar a API e iniciar o Worker.

## Movimentacoes comerciais

- concluir migration e snapshot do novo modulo;
- adicionar testes de dominio, persistencia, autorizacao e tenant;
- atualizar OpenAPI e frontend;
- incluir o modulo no Migrador e nos testes arquiteturais;
- atualizar documentacao de dados e API quando a implementacao estiver concluida.

## Contratos

- decidir entre cliente TypeScript gerado pelo OpenAPI ou contratos manuais com teste de compatibilidade;
- manter mudancas HTTP acompanhadas de testes e documentacao.
