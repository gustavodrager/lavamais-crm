# Perfis e Permissoes

## Separacao de responsabilidades

O Identity Hub autentica o usuario, valida seu vinculo com o tenant e fornece `sub`, `tenant_id` e `tenant_slug`.

O Identity Hub atualmente nao fornece papeis especificos do LavaMais CRM no token. O CRM mantem autorizacao local por `sub + tenant_id`, sem armazenar senha ou duplicar a conta.

## Administrador

- gerenciar papeis do CRM;
- importar clientes;
- manter catalogo, etiquetas e modelos;
- criar, preparar, executar e acompanhar acoes;
- consultar auditoria e configuracoes.

## Gerente

- manter clientes;
- manter catalogo e etiquetas;
- criar, preparar, executar e acompanhar acoes;
- registrar resultados.

## Operador

- consultar e manter clientes;
- consultar acoes;
- acompanhar envios;
- registrar resultados comerciais.

O Operador nao prepara nem inicia uma acao na configuracao inicial.

## Regras

- papeis sao sempre limitados ao tenant;
- acesso negado por padrao;
- autorizacao e validada na API, nao somente na interface;
- mudancas de papel sao auditadas;
- usuario autenticado sem papel ativo nao acessa dados empresariais.
