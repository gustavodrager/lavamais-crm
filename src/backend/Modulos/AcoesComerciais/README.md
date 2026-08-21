# Modulo de Acoes Comerciais

O modulo mantem rascunhos vinculados a um item ativo do catalogo e, opcionalmente, a uma versao publicada de modelo. Os criterios de publico sao tipados, versionados e persistidos em `jsonb`.

A simulacao e paginada e reavalia clientes pelo modulo `Segmentacao`. A preparacao reavalia a elegibilidade em uma transacao repetivel, congela destinatarios e snapshots, impede novas edicoes e registra auditoria atomicamente.

O envio e confirmado individualmente por destinatario. O comando aceita apenas um destinatario `Pendente`, valida sua versao, muda-o para `AguardandoSolicitacao` e grava uma unica outbox na mesma transacao. A primeira solicitacao muda a acao para `EmProcessamento`; destinatarios ainda pendentes impedem a conclusao automatica.

O Worker processa uma intencao por vez e a reconciliacao conclui a acao somente quando toda a audiencia foi solicitada e atingiu estado tecnico final. O detalhe apresenta totais de entrega e resultado. O resultado comercial e informado manualmente por destinatario, aceita valor decimal opcional apenas em conversoes e e auditado sem criar pedido ou faturamento.
