# Criterios de Aceite da Versao 1.0

> Status: material historico de descoberta. Os criterios vigentes da implantacao inicial estao em `docs/11-implantacao-inicial/03-definicao-de-pronto.md`.

## Identidade e tenant

- O CRM nao possui tela ou tabela de senha.
- Requisicoes empresariais exigem `tenant_id` valido no token.
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
- Item do catalogo e modelo de mensagem sao obrigatorios para preparar.
- A simulacao lista total elegivel e motivos de exclusao.
- O usuario pode remover destinatarios antes da preparacao.
- A preparacao congela audiencia, destino e versao do modelo.
- Uma acao preparada nao aceita alteracao dos criterios.
- Cada cliente aparece no maximo uma vez na audiencia da acao.

## Envio

- Nao existe comando de disparo coletivo na Versao 1.0.
- A lista da acao permite selecionar um destinatario congelado por vez.
- Antes da confirmacao, o CRM apresenta nome, destino e mensagem final montada.
- Cada confirmacao solicita somente o destinatario selecionado.
- Apenas destinatario `Pendente` de audiencia preparada pode ser solicitado.
- A primeira solicitacao individual muda a acao para `EmProcessamento`.
- Cada destinatario possui chave de idempotencia deterministica.
- Repetir, concorrer ou confirmar destinatario ja solicitado nao cria nova notificacao no Notification Hub.
- Credencial do hub nunca chega ao navegador.
- Falhas individuais nao interrompem os demais destinatarios.
- O CRM apresenta estado consolidado de solicitacao e entrega.

## Resultado comercial

- Resultado e independente do estado tecnico de entrega.
- Operador pode registrar `SemRetorno`, `Respondeu`, `Interessado`, `Convertido` ou `NaoTemInteresse`.
- Conversao pode registrar valor opcional em `decimal`.
- Mudancas de resultado sao auditadas.

## Seguranca e qualidade

- Todas as consultas sao isoladas por tenant.
- Operacoes importantes possuem auditoria com usuario e data UTC.
- Regras de dominio possuem testes automatizados.
- Fluxo principal possui teste ponta a ponta.
