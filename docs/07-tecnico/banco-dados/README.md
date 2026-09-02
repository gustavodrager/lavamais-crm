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
roteiros
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
codigo_externo
data_cadastro_origem
data_nascimento
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

Uma versao publicada e imutavel e guarda assunto, conteudo de pre-visualizacao e variaveis controladas. Nao existe chave tecnica de provedor.

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
criterios_segmentacao_json
situacao
data_preparacao
data_inicio_processamento
quantidade_destinatarios
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
destino_snapshot
conteudo_pre_visualizacao_snapshot
situacao_envio
data_envio_confirmado
usuario_envio_confirmado_id
resultado_comercial
valor_convertido
data_resultado_comercial
usuario_resultado_id
versao
```

Restricao unica: `tenant_id + acao_comercial_id + cliente_id`.

## Movimentacoes comerciais

### `movimentacoes_comerciais.movimentacoes` e `linhas_da_movimentacao`

Uma movimentacao representa uma visita comercial e registra cliente, valor total calculado, data, origem, codigo externo opcional e dados de cancelamento. Cada linha registra oferta, artigo, servico, quantidade, precos e snapshots comerciais. O registro e informativo e nao representa caixa, pagamento, producao ou pedido operacional.

O codigo externo e unico dentro do tenant quando informado. O agregado usa `xmin` para concorrencia otimista e nunca e excluido fisicamente.

## Roteiros

### `roteiros.roteiros_diarios`

```text
id
tenant_id
data
nome_motorista
situacao
data_criacao
data_atualizacao
versao
```

Existe no maximo um roteiro por `tenant_id + data`.

### `roteiros.paradas`

```text
id
tenant_id
roteiro_id
cliente_id
nome_cliente
whatsapp
endereco_completo
tipo
periodo
observacao
ordem
situacao
data_criacao
data_inicio
data_conclusao
motivo_nao_realizacao
```

Nome, WhatsApp e endereco sao snapshots operacionais. A alteracao posterior do cadastro nao muda silenciosamente uma parada ja planejada. O agregado do roteiro usa `xmin` para concorrencia otimista.

## Importacoes

- `importacoes.importacoes_de_clientes` registra nome, conteudo pendente ate a confirmacao, totais, usuario e estado;
- `importacoes.linhas_da_importacao` registra numero da linha, resultado, cliente e erros;
- o arquivo original nao e mantido indefinidamente por padrao.

## Autorizacao e auditoria

- `autorizacao.usuarios_crm` vincula `sub + tenant_id` ao papel local;
- `auditoria.registros_de_auditoria` guarda a trilha segura, incluindo abertura da conversa, confirmacao manual do envio e resultado comercial;
- o schema `integracoes` nao possui tabelas ativas depois da migration de remocao da arquitetura automatizada.

## Identidade

- `identidade.usuarios` guarda telefone normalizado, senha protegida, tenant, nome e situacao da credencial; a coluna de papel existente permanece apenas para compatibilidade e nao autoriza requisicoes;
- `identidade.sessoes` guarda apenas o hash do token opaco, expiracao e eventual revogacao.

## Dados futuros

Pedidos operacionais, solicitacoes de delivery, metas, relatorios consolidados, oportunidades, funil, campanhas recorrentes e assistente contextual nao fazem parte das migrations iniciais. Eles serao modelados somente quando entrarem em um novo escopo aprovado.
