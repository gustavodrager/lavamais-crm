# Criterios de Aceite da Versao 1.0

> Status: resumo atualizado. Os criterios completos da implantacao inicial estao em `docs/11-implantacao-inicial/03-definicao-de-pronto.md`.

## Identidade e tenant

- O primeiro acesso permite que cada usuario autorizado defina sua senha local.
- Senhas usam derivacao segura e nunca sao armazenadas ou registradas em claro.
- Requisicoes empresariais exigem `tenant_id` valido na sessao autenticada.
- O servidor ignora qualquer tenant informado pelo navegador para fins de autorizacao.
- Usuario sem papel ativo no CRM recebe acesso negado.

## Cliente

- Nome e WhatsApp sao obrigatorios.
- WhatsApp e normalizado antes de validar duplicidade.
- A unicidade e aplicada por tenant.
- Cliente pode possuir endereco, etiquetas e permissao de comunicacao.
- Cliente inativo nao entra em novas audiencias.

## Importacao

- CSV e pre-visualizado antes da gravacao.
- Colunas podem ser mapeadas para campos conhecidos.
- Linhas invalidas exibem motivo e numero da linha.
- O resultado informa inseridos, atualizados e rejeitados.
- Repetir o arquivo nao cria duplicidades silenciosas.

## Acao Comercial

- Uma acao comeca em `Rascunho`.
- Modelo de mensagem e obrigatorio para preparar; item do catalogo e opcional.
- A simulacao lista total elegivel e motivos de exclusao.
- O usuario pode remover destinatarios antes da preparacao.
- A preparacao congela audiencia, destino e versao do modelo.
- Uma acao preparada nao aceita alteracao dos criterios.
- Cada cliente aparece no maximo uma vez na audiencia da acao.

## Envio

- Nao existe comando de disparo coletivo na Versao 1.0.
- A lista da acao permite selecionar um destinatario congelado por vez.
- Antes da confirmacao, o CRM apresenta nome, destino e mensagem final montada.
- O botao de abertura monta um link oficial `wa.me` com telefone e mensagem congelados.
- Abertura nao muda o estado do destinatario e gera auditoria.
- Apenas destinatario `Pendente` de audiencia preparada ou em processamento pode ter envio confirmado.
- A primeira confirmacao manual muda a acao para `EmProcessamento`.
- Repetir ou concorrer na confirmacao do mesmo destinatario devolve conflito e nao duplica o registro.
- QR Code, cookies, sessao e conversas ficam exclusivamente no WhatsApp.
- O CRM apresenta somente `Pendente` ou `Enviado` e nao afirma entrega ou leitura.

## Resultado comercial

- Resultado comercial so pode ser registrado depois da confirmacao manual do envio.
- Operador pode registrar `SemRetorno`, `Respondeu`, `Interessado`, `Convertido` ou `NaoTemInteresse`.
- Conversao pode registrar valor opcional em `decimal`.
- Mudancas de resultado sao auditadas.

## Seguranca e qualidade

- Todas as consultas sao isoladas por tenant.
- Operacoes importantes possuem auditoria com usuario e data UTC.
- Regras de dominio possuem testes automatizados.
- Fluxo principal possui teste ponta a ponta.
