# Pendencias Tecnicas e de Integracoes

## Identidade e sessoes

- configurar telefone, tenant e nomes por ambiente;
- executar primeiro acesso antes de divulgar a URL;
- validar login e continuidade da sessao depois de reinicios e entre instancias;
- definir recuperacao controlada enquanto nao existe fluxo automatico de senha;
- remover configuracoes residuais de OIDC do backend quando nao houver conflito com outra frente.

## WhatsApp Web assistido

- definir as estacoes autorizadas a usar a conta da loja;
- vincular o WhatsApp Web e documentar a revogacao de dispositivo perdido;
- revisar modelos e consentimentos antes do uso real;
- validar popup, nova aba, QR Code e confirmacao manual com destinatarios autorizados;
- treinar a equipe para nunca confirmar uma mensagem que nao foi enviada;
- definir como tratar indisponibilidade ou expiracao da sessao sem alterar dados do CRM.

## Auditoria

- definir a matriz minima de eventos criticos por modulo;
- completar a instrumentacao de identidade, usuarios, clientes, importacoes e Movimentacoes Comerciais;
- adicionar testes que comprovem tenant, autor, recurso e ausencia de dados sensiveis nos detalhes;
- decidir se a consulta pela API e suficiente para a Versao 1.0 ou se uma tela administrativa sera exigida antes da producao.

## Contratos

- decidir entre cliente TypeScript gerado pelo OpenAPI ou contratos manuais com teste de compatibilidade;
- manter mudancas HTTP acompanhadas de testes e documentacao.
- publicar e conferir o OpenAPI do ambiente de homologacao depois de cada deploy.
