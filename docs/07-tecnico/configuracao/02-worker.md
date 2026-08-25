# Worker

| Configuracao | Obrigatoria | Sensivel | Finalidade |
|---|---:|---:|---|
| `DOTNET_ENVIRONMENT` | ambiente compartilhado | nao | seleciona `Homologacao` ou `Production` |
| `DATABASE_URL` | homologacao e producao | sim | acesso privado ao PostgreSQL do ambiente |
| `ConnectionStrings__Crm` | alternativa local | sim | conexao Npgsql local |
| `NotificationHub__BaseUrl` | quando ativo | nao | endereco interno do Notification Hub |
| `NotificationHub__ApiKey` | quando ativo | sim | autentica o CRM no Notification Hub |
| `NotificationHub__Source` | sim | nao | origem exclusiva, com valor `lavamais-crm` |

## Regras

- manter zero replicas enquanto o Notification Hub nao estiver aprovado e credenciado;
- ativar inicialmente uma unica replica;
- nunca registrar a chave, o telefone ou o conteudo da mensagem;
- a mesma chave de idempotencia deve ser reutilizada em novas tentativas;
- retries de provedor e webhooks continuam sob responsabilidade do Notification Hub.
