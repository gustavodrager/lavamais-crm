# Modelo de Dados Inicial

## Padroes

- UUID como identificador;
- `TenantId` em entidades empresariais;
- `DateTimeOffset` e `timestamptz` para datas;
- `decimal(18,2)` para valores;
- concorrencia otimista em agregados mutaveis;
- nomes de tabelas em portugues e `snake_case`;
- schemas por modulo.

## Schemas

```text
clientes
catalogo
comunicacao
acoes_comerciais
movimentacoes_comerciais
importacoes
identidade
autorizacao
auditoria
integracoes
```

## Clientes

### `clientes.clientes`

```text
id
tenant_id
tipo
nome
nome_fantasia
documento_normalizado
situacao
data_criacao
data_atualizacao
versao
```

### Entidades relacionadas

- `clientes.contatos_do_cliente`;
- `clientes.enderecos_do_cliente`;
- `clientes.etiquetas`;
- `clientes.clientes_etiquetas`;
- `clientes.permissoes_de_comunicacao`.

WhatsApp normalizado e unico por tenant entre contatos ativos do tipo correspondente.

## Catalogo

### `catalogo.itens_de_catalogo`

```text
id
tenant_id
tipo
nome
descricao
categoria
valor_referencia
situacao
data_criacao
data_atualizacao
```

`tipo` aceita inicialmente `Produto` ou `Servico`.

### Catalogo de lavanderia

- `catalogo.artigos_de_lavanderia` registra os bens recebidos, agrupados por categoria;
- `catalogo.servicos_de_lavanderia` registra os trabalhos oferecidos;
- `catalogo.ofertas_de_servico` associa artigo e servico e define o preco unitario por tenant.

A combinacao `tenant_id + artigo_de_lavanderia_id + servico_de_lavanderia_id` e unica. O catalogo generico permanece enquanto for usado por Acoes Comerciais.

## Comunicacao

### `comunicacao.modelos_de_mensagem`

Guarda nome, canal, situacao e versao atual do modelo comercial.

### `comunicacao.versoes_dos_modelos`

Uma versao publicada e imutavel e guarda assunto, conteudo de pre-visualizacao, variaveis e `chave_template_notificacao`. A chave e estavel entre os adaptadores local e central.

## Acoes comerciais

### `acoes_comerciais.acoes_comerciais`

```text
id
tenant_id
nome
objetivo
item_de_catalogo_id
nome_item_snapshot
versao_modelo_id
canal
criterios_segmentacao_json
situacao
data_preparacao
data_inicio_processamento
data_conclusao
quantidade_destinatarios
quantidade_enviada
quantidade_com_falha
usuario_criacao_id
data_criacao
data_atualizacao
versao
```

### `acoes_comerciais.destinatarios_da_acao`

```text
id
tenant_id
acao_comercial_id
cliente_id
nome_cliente_snapshot
contato_id
destino_snapshot
conteudo_preview_snapshot
situacao_envio
resultado_comercial
valor_convertido
chave_idempotencia
notificacao_id
servico_notificacao
data_solicitacao
data_ultima_reconciliacao
codigo_falha
descricao_falha
versao
```

Restricao unica: `tenant_id + acao_comercial_id + cliente_id`.

## Movimentacoes comerciais

### `movimentacoes_comerciais.movimentacoes` e `linhas_da_movimentacao`

Uma movimentacao representa uma visita comercial e registra cliente, valor total calculado, data, origem, codigo externo opcional e dados de cancelamento. Cada linha registra oferta, artigo, servico, quantidade, precos e snapshots comerciais. O registro e informativo e nao representa caixa, pagamento, producao ou pedido operacional.

O codigo externo e unico dentro do tenant quando informado. O agregado usa `xmin` para concorrencia otimista e nunca e excluido fisicamente.

## Importacoes

- `importacoes.importacoes_de_clientes` registra nome, conteudo pendente ate a confirmacao, totais, usuario e estado;
- `importacoes.linhas_da_importacao` registra numero da linha, resultado, cliente e erros;
- o arquivo original nao e mantido indefinidamente por padrao.

## Autorizacao e auditoria

- `autorizacao.usuarios_crm` vincula `sub + tenant_id` ao papel local;
- `auditoria.registros_de_auditoria` guarda a trilha segura;
- `integracoes.mensagens_da_outbox` persiste efeitos externos e controle de processamento;
- `integracoes.notificacoes_locais` guarda snapshot, idempotencia por tenant, identificador do WhatsMiau e estado tecnico, sem funcionar como uma segunda fila.

## Identidade

- `identidade.usuarios` guarda telefone normalizado, senha protegida, tenant, nome e situacao da credencial; a coluna de papel existente permanece apenas para compatibilidade e nao autoriza requisicoes;
- `identidade.sessoes` guarda apenas o hash do token opaco, expiracao e eventual revogacao.

## Dados futuros

Pedidos operacionais, interacoes, oportunidades, funil e campanhas recorrentes nao fazem parte das migrations iniciais. Eles serao modelados quando entrarem no escopo.
