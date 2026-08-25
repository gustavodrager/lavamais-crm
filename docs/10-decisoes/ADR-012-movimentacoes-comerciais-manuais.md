# ADR-012 — Movimentacoes comerciais manuais

- Status: aceito
- Data: 2026-08-24
- Complementa: ADR-005 e ADR-006

## Contexto

A LavaMais utiliza o Essence GO Industrial como sistema operacional. Antes de existir uma integracao comprovada, a recepcao precisa registrar no CRM informacoes comerciais minimas de pedidos para formar historico do cliente e permitir evolucoes de segmentacao.

## Decisao

O CRM passa a registrar `MovimentacaoComercial` com cliente, servico principal, valor total, data, codigo externo opcional e observacao. O registro e informativo e nao controla caixa, pagamento, producao, pecas, estoque, entrega ou fiscal.

O Essence GO Industrial permanece como fonte operacional. A origem da movimentacao e explicita (`Recepcao`, `ImportacaoEssence` ou `IntegracaoEssence`) e o codigo externo sera a chave preferencial para uma futura conciliacao. A possibilidade de importar dados no Essence depende de validacao posterior de formatos e APIs do fornecedor.

Movimentacoes nao sao excluidas fisicamente. Um cancelamento registra situacao, data, usuario e motivo. Toda consulta e escrita permanece isolada por tenant.

## Consequencias

- a recepcao ganha um fluxo curto sem duplicar o sistema operacional;
- o CRM passa a possuir historico comercial confiavel criado a partir da implantacao;
- o detalhe do cliente pode exibir indicadores descritivos derivados das movimentacoes validas, sem classificacao ou automacao comercial;
- segmentacoes e recomendacoes baseadas nas movimentacoes continuam fora desta entrega e serao adicionadas sobre dados medidos;
- exportacao ou integracao com o Essence sera implementada somente apos validar contrato externo.
