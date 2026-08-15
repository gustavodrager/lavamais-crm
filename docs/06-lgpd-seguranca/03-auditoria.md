# Auditoria

## Eventos obrigatorios

- criacao, alteracao e inativacao de cliente;
- alteracao de permissao de comunicacao;
- importacao de clientes e seu resultado;
- criacao, preparacao, inicio e cancelamento de Acao Comercial;
- inclusao ou remocao manual de destinatario;
- solicitacao e reprocessamento de envio;
- alteracao de resultado comercial;
- alteracao de papel do CRM;
- exportacao futura de dados;
- alteracao de configuracao sensivel.

## Dados registrados

- `TenantId`;
- `UsuarioIdentidadeId`, obtido do claim `sub`;
- tipo da acao;
- recurso e identificador afetado;
- data e hora UTC;
- resultado;
- IP e agente do cliente, quando aplicavel;
- correlacao da requisicao;
- metadados seguros da alteracao.

## Restricoes

- nao registrar credenciais, tokens ou chaves de API;
- evitar copiar conteudo integral de mensagens e dados pessoais desnecessarios;
- registros de auditoria nao podem ser alterados pela interface comum;
- acesso a auditoria exige papel `Administrador`.
