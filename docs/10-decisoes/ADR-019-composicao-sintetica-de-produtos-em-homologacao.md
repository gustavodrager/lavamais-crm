# ADR-019 - Composicao sintetica de produtos em homologacao

- Status: aceito
- Data: 2026-08-29
- Complementa: ADR-015 e ADR-016

## Contexto

A carga historica do Essence preserva clientes e tickets confiaveis, mas o ranking de produtos e agregado e nao informa quais itens pertencem a cada ticket. Para homologar telas, indicadores e fluxos com movimentacoes de varias linhas, a base precisa de uma composicao mais representativa sem apresentar vinculos inventados como dados reais.

O ranking cobre o periodo de 02/01/2026 a 22/04/2026. Nesse intervalo, suas 14.128 unidades correspondem exatamente as 14.128 pecas informadas no relatorio de movimentacoes. O historico de tickets continua ate 26/08/2026; qualquer uso do ranking depois de 22/04 e uma extrapolacao sintetica.

## Decisao

O importador passa a oferecer uma operacao separada e explicita de `ComposicaoSintetica`, permitida somente em ambiente local de ensaio ou homologacao. Producao permanece bloqueada.

A operacao distribui os produtos do ranking de forma deterministica, ponderada pela quantidade observada e limitada a quatro produtos distintos por ticket. A soma das quantidades reproduz a quantidade de pecas do ticket; quando a origem informa zero pecas, uma unidade tecnica e usada e registrada no relatorio. Os precos praticados sinteticos sao ajustados em centavos para que a soma das linhas seja exatamente igual ao valor historico da movimentacao.

Os artigos, o servico e as ofertas criados para essa finalidade:

- usam prefixo e categoria que os identificam como sinteticos de homologacao;
- permanecem inativos e nao podem ser selecionados em novas movimentacoes operacionais;
- usam o valor medio agregado somente como referencia de tabela;
- nao comprovam o artigo ou o servico realmente executado.

Cada movimentacao enriquecida recebe uma observacao explicita de que a composicao e sintetica e nao veio do Essence. A operacao e idempotente pelo ticket e pela composicao deterministica. Uma operacao separada de `ReversaoComposicaoSintetica` restaura a oferta tecnica unica definida no ADR-016.

## Consequencias

- homologacao pode exercitar historicos com varias linhas e produtos variados;
- ticket, cliente, data e valor total continuam sendo dados historicos preservados;
- produtos por cliente nao podem ser usados como evidencia, segmentacao real ou recomendacao comercial;
- reexecutar a composicao nao duplica linhas ou ofertas;
- a carga historica original continua sendo o caminho confiavel e a reversao recupera sua representacao sem produtos;
- nenhuma migration ou integracao online com o Essence e introduzida.
