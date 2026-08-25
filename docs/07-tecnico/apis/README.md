# Superficie Inicial da API

Todos os endpoints empresariais usam `/api/v1`, exigem access token valido e derivam o tenant do claim `tenant_id`.

## Clientes

```text
GET    /api/v1/clientes
POST   /api/v1/clientes
GET    /api/v1/clientes/{id}
PUT    /api/v1/clientes/{id}
POST   /api/v1/clientes/{id}/inativar
GET    /api/v1/etiquetas
POST   /api/v1/etiquetas
```

Listagens usam `pagina`, `tamanhoPagina`, ordenacao permitida e filtros explicitos.

## Importacoes

```text
POST   /api/v1/importacoes/clientes/pre-visualizar
POST   /api/v1/importacoes/clientes
GET    /api/v1/importacoes/clientes/{id}
```

A confirmacao recebe uma referencia segura ao conteudo persistido da pre-visualizacao e o mapeamento validado; nao confia novamente em arquivo ou totais enviados pelo navegador.

## Catalogo e modelos

```text
GET    /api/v1/itens-de-catalogo
POST   /api/v1/itens-de-catalogo
PUT    /api/v1/itens-de-catalogo/{id}
GET    /api/v1/catalogo-lavanderia/artigos
GET    /api/v1/catalogo-lavanderia/servicos
GET    /api/v1/catalogo-lavanderia/ofertas
POST   /api/v1/catalogo-lavanderia/carga-inicial
GET    /api/v1/modelos-de-mensagem
POST   /api/v1/modelos-de-mensagem
POST   /api/v1/modelos-de-mensagem/{id}/publicar
```

## Acoes comerciais

```text
GET    /api/v1/acoes-comerciais
POST   /api/v1/acoes-comerciais
GET    /api/v1/acoes-comerciais/{id}
PUT    /api/v1/acoes-comerciais/{id}
POST   /api/v1/acoes-comerciais/{id}/simular-publico
POST   /api/v1/acoes-comerciais/{id}/preparar
POST   /api/v1/acoes-comerciais/{id}/cancelar
GET    /api/v1/acoes-comerciais/{id}/destinatarios
POST   /api/v1/acoes-comerciais/{id}/destinatarios/{destinatarioId}/enviar
PUT    /api/v1/acoes-comerciais/{id}/destinatarios/{destinatarioId}/resultado
```

Comandos de transicao validam estado e versao do agregado. Conflitos de concorrencia retornam `409`.

Nos contratos de criacao e alteracao do rascunho, `itemDeCatalogoId` e opcional. Quando a versao do modelo usa a variavel `itemCatalogo`, a preparacao exige um item ativo e retorna `422` se ele nao estiver definido.

### Envio individual

Nao existe comando de disparo coletivo na Versao 1.0. O usuario seleciona um destinatario congelado, confere `nomeCliente`, `destino` e `conteudoPreVisualizacao` retornados pela consulta e confirma uma unica mensagem.

```http
POST /api/v1/acoes-comerciais/{acaoId}/destinatarios/{destinatarioId}/enviar
Content-Type: application/json

{
  "versao": 3
}
```

Resposta aceita:

```http
HTTP/1.1 202 Accepted
Content-Type: application/json

{
  "id": "3f52de7f-8048-4c10-95e2-3888bd432684",
  "situacaoEnvio": "AguardandoSolicitacao",
  "versao": 4
}
```

O comando exige papel `Administrador` ou `Gerente`. Destinatario fora da acao ou do tenant nao e revelado (`404`); versao desatualizada, envio concorrente ou destinatario ja solicitado retorna `409`; regra que impede o envio retorna `422`. A outbox e a mudanca de estado sao gravadas na mesma transacao.

## Movimentacoes comerciais

```text
GET    /api/v1/movimentacoes-comerciais
POST   /api/v1/movimentacoes-comerciais
POST   /api/v1/movimentacoes-comerciais/{id}/cancelar
```

O registro representa uma visita comercial. Recebe um cliente ativo e uma ou mais linhas com `ofertaDeServicoId`, quantidade e preco unitario praticado opcional. A oferta associa um artigo ao servico aplicavel e fornece o preco de tabela; o total e calculado no servidor. Data, codigo externo e observacao sao opcionais. O tenant, o usuario e a origem `Recepcao` sao derivados no servidor. O cancelamento exige `Administrador` ou `Gerente`, motivo e a versao atual do agregado; concorrencia retorna `409`.

## Autorizacao

```text
GET    /api/v1/usuarios-crm
POST   /api/v1/usuarios-crm
PUT    /api/v1/usuarios-crm/{id}/papel
POST   /api/v1/usuarios-crm/{id}/inativar
```

Disponivel somente para `Administrador`.

## Auditoria

```text
GET    /api/v1/auditoria
GET    /api/v1/auditoria/{id}
```

Disponivel somente para `Administrador`, com paginacao e filtros controlados.

## Convencoes HTTP

- JSON em portugues e `camelCase`;
- erros no formato Problem Details;
- `400` para contrato invalido;
- `401` para ausencia ou invalidade de autenticacao;
- `403` para falta de tenant ou permissao;
- `404` sem revelar existencia em outro tenant;
- `409` para conflito de estado, concorrencia ou unicidade;
- `422` para regra de negocio que impede a operacao;
- `X-Correlation-Id` propagado entre Web, API, Worker e hubs.

Os schemas detalhados serao gerados no OpenAPI junto com a implementacao e nao devem duplicar diretamente entidades de persistencia.
