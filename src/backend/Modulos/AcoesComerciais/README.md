# Modulo de Acoes Comerciais

O modulo mantem rascunhos que podem ser vinculados a um item ativo do catalogo e, opcionalmente, a uma versao publicada de modelo. O item de catalogo nao e obrigatorio; quando o modelo usa a variavel `itemCatalogo`, a vinculacao passa a ser exigida antes da preparacao. Os criterios de publico sao tipados, versionados e persistidos em `jsonb`.

A simulacao e paginada e reavalia clientes pelo modulo `Segmentacao`. A preparacao reavalia a elegibilidade em uma transacao repetivel, congela destinatarios e snapshots, impede novas edicoes e registra auditoria atomicamente.

O envio e confirmado individualmente por destinatario. `Administrador`, `Gerente` e `Operador` podem solicitar esse envio individual quando a mensagem ja esta preparada. O comando aceita apenas um destinatario `Pendente`, valida sua versao, muda-o para `AguardandoSolicitacao` e grava uma unica outbox na mesma transacao. A primeira solicitacao muda a acao para `EmProcessamento`; destinatarios ainda pendentes impedem a conclusao automatica.

O Worker processa uma intencao por vez pela porta de notificacoes. Cada destinatario guarda o identificador e a origem `Local` ou `Central`, sem conhecer o contrato do provedor. A reconciliacao conclui a acao somente quando toda a audiencia foi solicitada e atingiu estado tecnico final. A listagem apresenta os contadores operacionais `mensagensParaEnviar`, `falhasParaRevisar`, `retornosParaRegistrar` e `resultadosRegistrados`; o detalhe apresenta totais de entrega e resultado. O resultado comercial e informado manualmente por destinatario, aceita valor decimal opcional apenas em conversoes e e auditado sem criar pedido ou faturamento.
