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

## Comunicacao

### `comunicacao.modelos_de_mensagem`

Guarda nome, canal, situacao e versao atual do modelo comercial.

### `comunicacao.versoes_dos_modelos`

Uma versao publicada e imutavel e guarda assunto, conteudo de pre-visualizacao, variaveis e `chave_template_notificacao` do Notification Hub.

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
notificacao_externa_id
data_solicitacao
data_ultima_reconciliacao
codigo_falha
descricao_falha
versao
```

Restricao unica: `tenant_id + acao_comercial_id + cliente_id`.

## Importacoes

- `importacoes.importacoes_de_clientes` registra nome, conteudo pendente ate a confirmacao, totais, usuario e estado;
- `importacoes.linhas_da_importacao` registra numero da linha, resultado, cliente e erros;
- o arquivo original nao e mantido indefinidamente por padrao.

## Autorizacao e auditoria

- `autorizacao.usuarios_crm` vincula `sub + tenant_id` ao papel local;
- `auditoria.registros_de_auditoria` guarda a trilha segura;
- `integracoes.mensagens_da_outbox` persiste efeitos externos e controle de processamento.

## Identidade

- `identidade.usuarios` guarda telefone normalizado, senha protegida, tenant, nome, papel e situacao;
- `identidade.sessoes` guarda apenas o hash do token opaco, expiracao e eventual revogacao.

## Dados futuros

Pedidos, movimentacoes, interacoes, oportunidades, funil e campanhas recorrentes nao fazem parte das migrations iniciais. Eles serao modelados quando entrarem no escopo.
