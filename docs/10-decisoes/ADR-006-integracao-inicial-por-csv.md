# ADR-006 — Integracao inicial por CSV

- Status: aceito
- Data: 2026-08-15

## Contexto

A LavaMais usa o Essence GO Industrial, mas ainda nao acessaremos o ambiente e nao entraremos em contato com a Hybex. Nao ha contrato publico suficiente para implementar uma API confiavel.

## Decisao

Comecar com importacao CSV para clientes. Manter adaptadores isolados e avaliar exportacoes e API oficial quando houver acesso autorizado.

Nao usar scraping, automacao de tela, endpoints privados ou acesso direto ao banco como integracao permanente.

## Consequencias

- a Versao 1.0 nao depende do fornecedor atual;
- qualidade e mapeamento do CSV precisam de interface propria;
- importacoes futuras de catalogo e movimentacoes reutilizarao a mesma fronteira;
- uma API oficial podera ser adicionada sem contaminar o dominio.
