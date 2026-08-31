# Worker

| Configuracao | Obrigatoria | Sensivel | Finalidade |
|---|---:|---:|---|
| `DOTNET_ENVIRONMENT` | ambiente compartilhado | nao | seleciona `Homologacao` ou `Production` |
| `DATABASE_URL` | homologacao e producao | sim | acesso privado ao PostgreSQL do ambiente |
| `ConnectionStrings__Crm` | alternativa local | sim | conexao Npgsql local |
| `Notificacoes__Modo` | sim | nao | seleciona `Desabilitado`, `Local` ou `Central` |
| `Notificacoes__WhatsMiau__BaseUrl` | modo local | nao | base da Evolution API v2 do WhatsMiau |
| `Notificacoes__WhatsMiau__ApiKey` | modo local | sim | autentica o Worker no WhatsMiau |
| `Notificacoes__WhatsMiau__NomeInstancia` | modo local | nao | instancia usada no envio |
| `Notificacoes__WhatsMiau__SegredoWebhook` | modo local | sim | deve ser igual ao valor da API |
| `Notificacoes__Central__BaseUrl` | modo central | nao | endereco da futura Central de Notificacao |
| `Notificacoes__Central__ApiKey` | modo central | sim | autentica o CRM na Central |
| `Notificacoes__Central__Origem` | modo central | nao | origem exclusiva `lavamais-crm` |

## Regras

- manter zero replicas enquanto o canal selecionado nao estiver aprovado e credenciado;
- ativar inicialmente uma unica replica;
- nunca registrar a chave, o telefone ou o conteudo da mensagem;
- a mesma chave de idempotencia deve ser reutilizada em novas tentativas;
- no modo local, a outbox e a unica fila e o webhook do WhatsMiau atualiza o estado tecnico;
- no modo central, retries de provedor e webhooks tecnicos pertencem ao servico externo.
