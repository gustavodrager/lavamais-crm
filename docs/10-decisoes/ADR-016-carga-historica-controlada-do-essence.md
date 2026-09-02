# ADR-016 — Carga historica controlada do Essence

- Status: aceito
- Data: 2026-08-26
- Complementa: ADR-006, ADR-012 e ADR-015

## Contexto

Os relatorios exportados do Essence disponibilizam clientes e tickets, mas nao relacionam os produtos agregados do ranking a cada ticket. O relatorio de movimentacao tambem contem campos financeiros e operacionais que nao pertencem ao escopo do CRM.

Uma carga direta sem conciliacao poderia unir clientes diferentes pelo mesmo WhatsApp, presumir consentimento de marketing, criar composicoes ficticias de artigos e servicos ou transformar valores historicos em precos vigentes.

## Decisao

A carga historica usa arquivos CSV normalizados e um executor separado da API e do Migrador. O executor exige tenant e ambiente explicitos, simula por padrao, grava um relatorio de reconciliacao e somente altera o banco com `--confirmar`. Producao permanece bloqueada; a carga pode ser ensaiada localmente e executada em homologacao apos autorizacao operacional.

Clientes sao identificados pelo codigo externo. A atualizacao controlada altera somente nome, WhatsApp e dados de origem informados, preservando endereco, email, tipo, etiquetas e consentimento ja registrados no CRM. Novos clientes recebem permissao de marketing por WhatsApp igual a `false`. Telefones compartilhados, ausentes ou invalidos ficam pendentes para conciliacao manual.

Cada ticket com cliente conciliado vira uma `MovimentacaoComercial` de origem `ImportacaoEssence`, idempotente pelo codigo externo. Como o export nao informa os itens do ticket, a movimentacao recebe uma unica oferta tecnica inativa, com quantidade um e o valor total do ticket. Quantidade de pecas, pacote, subtotal, desconto, valor de utilizacao do pacote e atendente ficam na observacao. O CRM nao importa situacao de entrega, coleta, valor pago ou valor em aberto como estado de negocio.

Os nomes do ranking de produtos sao mantidos como itens genericos inativos, prefixados e classificados como referencia historica do Essence. Quantidade, total e media calculada ficam identificados como observacao historica; esses registros nao sao ofertas operacionais, nao comprovam a separacao entre artigo e servico e nao representam preco vigente.

## Consequencias

- clientes e tickets confiaveis podem compor o historico comercial sem inventar vinculos de produtos;
- reexecucoes nao duplicam tickets e nao apagam dados enriquecidos de clientes;
- divergencias de codigo, telefone ou ticket exigem conciliacao em vez de fusao automatica;
- o ranking preserva valor de referencia para analise, mas nao habilita segmentacao por produto por cliente;
- o executor nao roda no startup e nao substitui migrations nem integracao online futura.
