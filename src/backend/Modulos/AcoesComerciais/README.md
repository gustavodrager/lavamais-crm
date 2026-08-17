# Modulo de Acoes Comerciais

O modulo mantem rascunhos vinculados a um item ativo do catalogo e, opcionalmente, a uma versao publicada de modelo. Os criterios de publico sao tipados, versionados e persistidos em `jsonb`.

A simulacao e paginada e reavalia clientes pelo modulo `Segmentacao`. A preparacao reavalia a elegibilidade em uma transacao repetivel, congela destinatarios e snapshots, impede novas edicoes e registra auditoria atomicamente.

O envio usa outbox transacional e a reconciliacao conclui a acao quando todos os destinatarios atingem estado tecnico final. O detalhe apresenta totais de entrega e resultado. O resultado comercial e informado manualmente por destinatario, aceita valor decimal opcional apenas em conversoes e e auditado sem criar pedido ou faturamento.
