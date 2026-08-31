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

Os endpoints seguem `/api/v1/clientes` e `/api/v1/etiquetas`. Todos exigem usuario autenticado com papel local ativo no CRM. Todos os perfis ativos podem consultar, criar e atualizar os dados cadastrais necessarios ao atendimento. A resposta de cliente inclui contatos, endereco, permissao de marketing, etiquetas, dados de origem e datas de criacao e atualizacao no CRM. Busca e paginacao usam `busca`, `pagina` e `tamanhoPagina`, limitado a 100 itens. Para uso no roteiro, a interface exige ao menos logradouro, numero e cidade antes de adicionar a parada.

## Persistencia

O modulo usa o schema PostgreSQL `clientes`, `ContextoDeClientes` proprio e migration independente. O agregado mutavel usa a coluna de sistema `xmin` para concorrencia otimista.

## Carga historica

A carga historica controlada pode atualizar somente nome, WhatsApp e dados de origem pelo codigo externo. Esse contrato preserva email, endereco, tipo, etiquetas e consentimento ja enriquecidos no CRM e recusa a fusao automatica quando o telefone pertence a outro cliente. Novos clientes entram sem permissao de marketing.
