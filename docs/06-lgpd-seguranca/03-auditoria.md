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

## Cobertura implementada

- Clientes: criacao, atualizacao, atualizacao por carga, consentimento, inativacao e etiquetas;
- Movimentacoes Comerciais: registro, cancelamento e substituicao de composicao importada;
- Importacoes: pre-visualizacao e confirmacao com totais;
- Catalogo e Modelos: itens, cargas controladas, ofertas tecnicas e publicacao de versoes;
- Autorizacao e Identidade: criacao/inativacao de usuario, alteracao de papel, primeiro acesso, sessao criada/revogada e autorizacao inicial;
- Acoes Comerciais e Roteiros: criacao, alteracao, preparacao, execucao, cancelamento e resultados.

Os eventos fazem parte da mesma transacao PostgreSQL da escrita principal. Eventos de primeiro acesso usam uma interface restrita a tipos fixos, pois ainda nao existe sessao autenticada nesse instante.

## Dados registrados

- `TenantId`;
- `UsuarioIdentidadeId`, obtido do claim `sub`; no primeiro acesso, e o proprio identificador criado para o usuario;
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
- nao registrar nomes, telefones, enderecos, CSV, observacoes ou motivos livres nos metadados;
- registros de auditoria nao podem ser alterados pela interface comum;
- acesso a auditoria exige papel `Administrador`.
