# Superficie Inicial da API

Todos os endpoints empresariais usam `/api/v1`, exigem sessao valida e derivam o tenant no servidor. Nao existe endpoint anonimo de mensagens.

## Autenticacao

```text
GET    /api/v1/autenticacao/primeiro-acesso
POST   /api/v1/autenticacao/primeiro-acesso
POST   /api/v1/autenticacao/entrar
POST   /api/v1/autenticacao/sair
```

Os dois primeiros comandos anonimos que recebem credenciais possuem limitacao de taxa. `entrar` e `primeiro-acesso` devolvem um token opaco, que o BFF guarda na sessao server-side. `sair` revoga a sessao corrente.

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
POST   /api/v1/acoes-comerciais/{id}/destinatarios/{destinatarioId}/abrir-whatsapp
POST   /api/v1/acoes-comerciais/{id}/destinatarios/{destinatarioId}/confirmar-envio-whatsapp
PUT    /api/v1/acoes-comerciais/{id}/destinatarios/{destinatarioId}/resultado
```

Comandos de transicao validam estado e versao do agregado. Conflitos de concorrencia retornam `409`.

A listagem retorna contadores derivados dos destinatarios para montar filas sem uma consulta adicional por acao: `mensagensParaEnviar`, `retornosParaRegistrar` e `resultadosRegistrados`.

Nos contratos de criacao e alteracao do rascunho, `itemDeCatalogoId` e opcional. Quando a versao do modelo usa a variavel `itemCatalogo`, a preparacao exige um item ativo e retorna `422` se ele nao estiver definido.

### WhatsApp Web assistido

Nao existe comando de disparo coletivo. O usuario seleciona um destinatario congelado, confere `nomeCliente`, `destino` e `conteudoPreVisualizacao` e abre a conversa no WhatsApp oficial. A abertura apenas registra auditoria:

```http
POST /api/v1/acoes-comerciais/{acaoId}/destinatarios/{destinatarioId}/abrir-whatsapp
Content-Type: application/json

{
  "versao": 3
}
```

Depois do envio no WhatsApp, uma confirmacao humana usa:

```http
POST /api/v1/acoes-comerciais/{acaoId}/destinatarios/{destinatarioId}/confirmar-envio-whatsapp
Content-Type: application/json

{
  "versao": 3
}
```

Resposta:

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "3f52de7f-8048-4c10-95e2-3888bd432684",
  "situacaoEnvio": "Enviado",
  "dataEnvioConfirmado": "2026-09-02T17:00:00Z",
  "versao": 4
}
```

Os comandos exigem papel `Administrador`, `Gerente` ou `Operador`. Destinatario fora da acao ou do tenant nao e revelado (`404`); versao desatualizada, confirmacao concorrente ou destinatario ja confirmado retorna `409`. O CRM registra usuario e horario, mas nao afirma entrega ou leitura.

## Movimentacoes comerciais

```text
GET    /api/v1/movimentacoes-comerciais
POST   /api/v1/movimentacoes-comerciais
POST   /api/v1/movimentacoes-comerciais/{id}/cancelar
```

O registro representa uma visita comercial. Recebe um cliente ativo e uma ou mais linhas com `ofertaDeServicoId`, quantidade e preco unitario praticado opcional. A oferta associa um artigo ao servico aplicavel e fornece o preco de tabela; o total e calculado no servidor. Data, codigo externo e observacao sao opcionais. O tenant, o usuario e a origem `Recepcao` sao derivados no servidor. O cancelamento exige `Administrador` ou `Gerente`, motivo e a versao atual do agregado; concorrencia retorna `409`.

## Roteiros diarios

```text
GET    /api/v1/roteiros?data={yyyy-MM-dd}
POST   /api/v1/roteiros
PUT    /api/v1/roteiros/{id}
DELETE /api/v1/roteiros/{id}
POST   /api/v1/roteiros/{id}/paradas
PUT    /api/v1/roteiros/{id}/paradas/{paradaId}
DELETE /api/v1/roteiros/{id}/paradas/{paradaId}
PUT    /api/v1/roteiros/{id}/ordem
POST   /api/v1/roteiros/{id}/publicar
POST   /api/v1/roteiros/paradas/{id}/iniciar
POST   /api/v1/roteiros/paradas/{id}/concluir
POST   /api/v1/roteiros/paradas/{id}/adiar
POST   /api/v1/roteiros/paradas/{id}/nao-realizar
```

O roteiro e unico por tenant e data. As paradas guardam snapshots de nome, WhatsApp e endereco do cliente para preservar a sequencia publicada. Comandos de alteracao recebem a versao atual e retornam `409` em conflito. Essa superficie organiza um roteiro manual; nao calcula rota, distancia ou previsao de chegada.

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
- `X-Correlation-Id` propagado entre Web e API.

Os schemas detalhados sao expostos pelo OpenAPI da aplicacao e nao devem duplicar diretamente entidades de persistencia.
