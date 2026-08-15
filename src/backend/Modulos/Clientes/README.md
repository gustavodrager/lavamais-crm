# Modulo Clientes

Responsavel pelo cadastro empresarial de clientes, contatos, endereco, etiquetas e permissoes de comunicacao.

## Regras implementadas

- nome e WhatsApp sao obrigatorios;
- WhatsApp nacional com 10 ou 11 digitos recebe o codigo `55`;
- numero internacional ja completo aceita de 12 a 15 digitos;
- WhatsApp ativo e unico dentro do tenant;
- a inativacao do cliente inativa seus contatos e libera o numero para novo cadastro;
- permissao de marketing por WhatsApp e registrada explicitamente;
- etiquetas e todas as entidades relacionadas sao isoladas por `tenant_id`;
- `tipo` permanece texto opcional ate a definicao dos tipos iniciais pelo produto.

## API

Os endpoints seguem `/api/v1/clientes` e `/api/v1/etiquetas`. Todos exigem usuario autenticado com papel local ativo no CRM. Busca e paginacao usam `busca`, `pagina` e `tamanhoPagina`, limitado a 100 itens.

## Persistencia

O modulo usa o schema PostgreSQL `clientes`, `ContextoDeClientes` proprio e migration independente. O agregado mutavel usa a coluna de sistema `xmin` para concorrencia otimista.
