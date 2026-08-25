# ADR-015 — Catalogo de artigos e servicos de lavanderia

- Status: aceito
- Data: 2026-08-25
- Substitui parcialmente: ADR-012

## Contexto

Uma visita comercial pode conter mais de um artigo e mais de um servico. Tratar a movimentacao como um unico servico e um valor total impede registrar, por exemplo, duas camisas com lavagem e passadoria e um terno com lavagem a seco na mesma visita.

## Decisao

O catalogo separa `ArtigoDeLavanderia`, que e o bem recebido pela lavanderia, de `ServicoDeLavanderia`, que e o trabalho executado. A combinacao comercializavel e uma `OfertaDeServico`, com preco unitario por tenant. Uma mesma modalidade pode existir combinada e separada; por isso `Lavagem`, `Passadoria` e `Lavagem e passadoria` sao servicos distintos.

Uma `MovimentacaoComercial` representa uma visita comercial e possui uma ou mais `LinhaDaMovimentacao`. Cada linha referencia uma oferta, registra quantidade e preserva snapshots do artigo, do servico, do preco de tabela e do preco praticado. O total e calculado pelo dominio a partir das linhas.

A carga inicial e idempotente e cria um catalogo amplo de referencia. Ela nao altera precos ja cadastrados. Os valores iniciais devem ser revisados pela operacao de cada tenant antes do uso comercial.

O catalogo generico anterior permanece disponivel enquanto Acoes Comerciais depender dele. A migracao das movimentacoes preserva as colunas legadas para evitar perda de dados; novos registros usam exclusivamente as linhas.

## Consequencias

- a visita comercial pode registrar varios artigos e servicos;
- combinacoes invalidas nao precisam virar itens comercializaveis;
- precos sao definidos por oferta e tenant, sempre por unidade nesta fase;
- medidas por peso, area, par ou volume ficam para decisao posterior;
- a movimentacao continua informativa e nao passa a controlar producao, estoque, caixa ou logistica.
