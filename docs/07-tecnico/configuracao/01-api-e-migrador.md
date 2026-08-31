# API e Migrador

| Configuracao | Obrigatoria | Sensivel | Finalidade |
|---|---:|---:|---|
| `ASPNETCORE_ENVIRONMENT` | API compartilhada | nao | seleciona `Homologacao` ou `Production` |
| `DOTNET_ENVIRONMENT` | Migrador | nao | seleciona o ambiente do processo |
| `DATABASE_URL` | homologacao e producao | sim | conexao privada PostgreSQL do Railway |
| `ConnectionStrings__Crm` | alternativa local | sim | conexao Npgsql quando `DATABASE_URL` nao existe |
| `IdentidadeLocal__Habilitada` | sim | nao | habilita a identidade local vigente |
| `IdentidadeLocal__TelefonePermitido` | sim | dado pessoal | telefone autorizado para o primeiro acesso |
| `IdentidadeLocal__TenantId` | sim | nao | tenant associado ao usuario inicial |
| `IdentidadeLocal__NomeTenant` | sim | nao | nome apresentado do tenant |
| `IdentidadeLocal__NomeUsuario` | sim | dado pessoal | nome apresentado do administrador inicial |
| `Notificacoes__Modo` | API | nao | seleciona `Desabilitado`, `Local` ou `Central` |
| `Notificacoes__WhatsMiau__BaseUrl` | API no modo local | nao | base da Evolution API v2 do WhatsMiau |
| `Notificacoes__WhatsMiau__ApiKey` | API no modo local | sim | autentica chamadas do servidor ao WhatsMiau |
| `Notificacoes__WhatsMiau__NomeInstancia` | API no modo local | nao | identifica a instancia autorizada |
| `Notificacoes__WhatsMiau__SegredoWebhook` | API no modo local | sim | autentica `messages.update` pela rota secreta |
| `Notificacoes__Central__BaseUrl` | API no modo central | nao | endereco da futura Central de Notificacao |
| `Notificacoes__Central__ApiKey` | API no modo central | sim | autentica o CRM na Central |
| `Notificacoes__Central__Origem` | API no modo central | nao | origem exclusiva `lavamais-crm` |

## Regras

- o telefone e o tenant nunca sao recebidos do navegador;
- `Notificacoes__Modo` permanece `Desabilitado` ate validar credenciais, instancia e webhook no ambiente;
- API e Worker devem usar o mesmo modo e a mesma configuracao de notificacoes;
- API e Migrador usam a mesma conexao apenas dentro do mesmo ambiente;
- migrations sao executadas pelo Migrador em etapa unica e controlada;
- a conexao local versionada existe somente para desenvolvimento.

As secoes antigas de autenticacao por OIDC nao representam o contrato vigente e devem ser removidas de configuracoes remanescentes em uma alteracao tecnica que nao conflite com trabalho em andamento.
