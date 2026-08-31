# Modulo de Integracoes

Isola efeitos externos do CRM e mantem a outbox transacional usada pelo Worker.

Cada solicitacao individual de envio recebe chave de idempotencia deterministica por tenant. O Worker reutiliza essa chave, controla leases interrompidos e resolve uma porta neutra para o modo `Local` ou `Central`.

No modo `Local`, `integracoes.notificacoes_locais` guarda o snapshot, o identificador do WhatsMiau e os estados tecnicos recebidos por `messages.update`. Essa tabela nao e uma segunda fila. No modo `Central`, o servico externo volta a ser responsavel pelo estado tecnico detalhado.

Credenciais externas ficam somente na API ou no Worker. Enquanto `Notificacoes__Modo=Desabilitado`, nenhuma mudanca de destinatario ou mensagem de outbox e criada pelo endpoint de envio. A API publica essa capacidade ao BFF sem expor qual credencial esta configurada.
