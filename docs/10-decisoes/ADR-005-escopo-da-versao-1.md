# ADR-005 — Escopo da Versao 1.0

- Status: aceito
- Data: 2026-08-15

## Contexto

Nao teremos inicialmente historico de pedidos ou movimentacoes. O escopo anterior incluia dashboard, metas, Cliente 360, inatividade e diversas telas antes de validar o fluxo comercial principal.

## Decisao

A Versao 1.0 entrega uma capacidade ponta a ponta chamada `AcaoComercial`:

- clientes e importacao CSV;
- catalogo;
- filtros simples e selecao manual;
- modelos aprovados;
- audiencia congelada;
- envio imediato por WhatsApp;
- acompanhamento e resultado manual.

O termo `Campanha` fica para recorrencia, agendamento e automacao futuras.

## Consequencias

- menor tempo para validar valor real;
- nenhuma regra pode depender de historico inexistente;
- dashboard, metas, funil e classificacoes automaticas ficam no roadmap;
- o modelo preserva pontos de extensao para essas evolucoes.
