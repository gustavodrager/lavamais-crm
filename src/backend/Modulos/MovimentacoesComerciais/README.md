# Modulo de Movimentacoes Comerciais

Registra informacoes comerciais minimas informadas pela recepcao: cliente, servico principal, valor, data, codigo opcional do Essence GO Industrial e observacao.

O modulo nao controla pedido operacional, caixa, pagamento, producao, estoque, fiscal ou logistica. O Essence permanece como fonte operacional. A origem e persistida para permitir futura conciliacao, importacao ou integracao apos a validacao do contrato externo.

Clientes e servicos sao consultados por portas de aplicacao, sem acesso aos contextos ou tabelas de outros modulos. Os nomes sao congelados como snapshots no registro.

Todas as operacoes sao filtradas por tenant. O cancelamento e imutavel, exige motivo e usa a versao do agregado para concorrencia otimista. O codigo externo, quando informado, e unico dentro do tenant.

O detalhe do cliente pode consolidar quantidade, total, ticket medio, ultima movimentacao e servicos distintos. Movimentacoes canceladas permanecem visiveis no historico, mas nao participam desses indicadores.

Tickets historicos do Essence usam a origem `ImportacaoEssence` e sao idempotentes pelo codigo externo. Quando o export nao fornece a composicao do ticket, uma oferta tecnica inativa preserva o valor total sem atribuir artigos ou servicos ficticios; os metadados uteis da origem ficam na observacao.

Somente em homologacao, o ADR-019 permite substituir a linha tecnica por uma composicao sintetica deterministica baseada no ranking agregado. A composicao preserva a quantidade de pecas e o valor total, limita cada ticket a quatro produtos, permanece marcada na observacao e pode ser revertida para a representacao historica original.
