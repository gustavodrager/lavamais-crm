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

## Regras

- o telefone e o tenant nunca sao recebidos do navegador;
- nao existem variaveis ou credenciais de provedor de WhatsApp;
- API e Migrador usam a mesma conexao apenas dentro do mesmo ambiente;
- migrations sao executadas pelo Migrador em etapa unica e controlada;
- a conexao local versionada existe somente para desenvolvimento.

As secoes antigas de autenticacao por OIDC nao representam o contrato vigente e devem ser removidas de configuracoes remanescentes em uma alteracao tecnica que nao conflite com trabalho em andamento.
