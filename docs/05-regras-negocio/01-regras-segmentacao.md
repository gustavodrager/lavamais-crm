# Regras de Segmentacao

## Dados permitidos na Versao 1.0

- bairro e cidade;
- tipo de cliente;
- etiquetas e interesses;
- periodo de cadastro;
- periodo de aniversario;
- permissao de comunicacao;
- IDs selecionados manualmente.

## Criterios tecnicos

- Criterios sao objetos tipados, serializados em `jsonb` com campo `versao`.
- Filtros diferentes sao combinados por `E`.
- Valores dentro do mesmo filtro, como varios bairros, sao combinados por `OU`.
- Se nenhum filtro for informado, a interface exige confirmacao explicita antes de simular toda a base.
- O tenant e aplicado pelo servidor e nunca faz parte dos criterios editaveis.

## Elegibilidade obrigatoria

Um cliente e excluido quando estiver inativo, sem WhatsApp valido, sem permissao de marketing para WhatsApp ou duplicado na audiencia.

## Snapshot

A simulacao nao reserva destinatarios. A preparacao reavalia a elegibilidade dentro da operacao e persiste o snapshot final. O resultado da preparacao e a fonte de verdade para o envio.

## Regras futuras

Regras dependentes de pedidos ou movimentacoes ficam proibidas ate existir fonte confiavel e ADR para o contrato de integracao.
