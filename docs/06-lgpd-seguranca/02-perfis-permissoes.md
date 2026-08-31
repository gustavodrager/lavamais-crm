# Perfis e Permissoes

## Separacao de responsabilidades

O modulo `Identidade` autentica o usuario local pelo telefone autorizado e pela senha definida no primeiro acesso. A sessao opaca permite que a API derive usuario, tenant e papel exclusivamente no servidor.

O CRM armazena somente senha protegida com PBKDF2-SHA256 e o hash SHA-256 dos tokens de sessao. Tokens em claro permanecem apenas na sessao server-side do BFF e nunca sao entregues ao JavaScript do navegador.

## Administrador

- gerenciar papeis do CRM;
- importar clientes;
- manter catalogo, etiquetas e modelos;
- criar, preparar, executar e acompanhar acoes;
- consultar auditoria e configuracoes.

## Gerente

- manter clientes;
- manter catalogo, etiquetas e modelos comerciais;
- criar, preparar, executar e acompanhar acoes;
- registrar resultados.

## Operador

- consultar e manter clientes;
- consultar acoes;
- acompanhar envios;
- solicitar envio individual de mensagem ja preparada, sem editar conteudo, publico ou modelo;
- registrar resultados comerciais;
- criar, ordenar, editar, remover e publicar o roteiro diario operacional.

O Operador nao cria, prepara, edita, cancela nem altera publico ou modelo de uma acao na configuracao inicial.

## Regras

- papeis sao sempre limitados ao tenant;
- acesso negado por padrao;
- autorizacao e validada na API, nao somente na interface;
- todos os perfis ativos podem consultar telefone e detalhes cadastrais dos clientes;
- mudancas de papel sao auditadas;
- usuario autenticado sem papel ativo nao acessa dados empresariais.
