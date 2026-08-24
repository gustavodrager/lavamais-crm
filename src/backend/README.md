# Backend do LavaMais CRM

Fundacao da CRM API e do CRM Worker em .NET 10, organizada como monolito modular.

## Requisitos

- SDK .NET definido em `global.json`;
- Docker com Compose;
- PostgreSQL 17 (o Compose fornece a instancia local).

## Executar localmente

Na raiz do repositorio:

```bash
docker compose -f infraestrutura/compose.yml up -d
dotnet run --project src/backend/LavaMais.Crm.Api
```

A API publica:

- OpenAPI em `/openapi/v1.json`;
- verificacao de vida em `/saude/vivo`;
- verificacao de prontidao, incluindo PostgreSQL, em `/saude/pronto`.

As respostas incluem correlacao e cabecalhos defensivos. Os logs JSON registram apenas metodo, caminho sem query string, status e duracao; corpos, tokens e dados pessoais nao sao registrados.

Para iniciar o Worker que processa a outbox e reconcilia o estado das notificacoes:

```bash
dotnet run --project src/backend/LavaMais.Crm.Worker
```

## Configuracao

A conexao PostgreSQL aceita, nesta ordem:

1. `DATABASE_URL`, no formato `postgresql://` fornecido pelo Railway;
2. `ConnectionStrings__Crm`, no formato nativo do Npgsql.

O backend converte `DATABASE_URL` sem registrar usuario, senha ou URL nos logs. A conexao local existe apenas em `appsettings.Development.json`; homologacao e producao falham na inicializacao quando nenhuma conexao externa e fornecida.

Os bancos remotos estao no projeto Railway `lavamais-crm` (`5263440b-433f-477d-ab43-2696c55e6392`):

| Ambiente da aplicacao | Ambiente Railway | ID do ambiente | Servico PostgreSQL |
|---|---|---|---|
| `Homologacao` | `homologacao` | `cde26ae6-2a51-4511-a15a-8bb6d51e1d27` | `Postgres` (`6f47b0bb-4af2-4ee0-b26a-e3d1abbcb47d`) |
| `Production` | `production` | `90b94695-e749-4868-9e9a-e2891a5d0e2f` | `Postgres` (`6f47b0bb-4af2-4ee0-b26a-e3d1abbcb47d`) |

Quando os servicos da API e do Worker forem criados no Railway, cada um deve receber a variavel de referencia `DATABASE_URL=${{Postgres.DATABASE_URL}}`. A API usa `ASPNETCORE_ENVIRONMENT`; o Worker usa `DOTNET_ENVIRONMENT`. Nao usar `DATABASE_PUBLIC_URL`, porque o PostgreSQL permanece privado.

O Notification Hub usa `NotificationHub__BaseUrl`, `NotificationHub__ApiKey` e o `source` exclusivo `lavamais-crm`. A chave de API permanece vazia no repositorio. Ambientes compartilhados devem fornecer conexoes e credenciais por configuracao externa e nunca versionar segredos.

### Identidade local

Configure `IdentidadeLocal__TelefonePermitido`, `IdentidadeLocal__TenantId`, `IdentidadeLocal__NomeTenant` e `IdentidadeLocal__NomeUsuario`. O primeiro acesso define a senha do unico telefone autorizado. A senha protegida e os hashes das sessoes ficam no schema `identidade`; tokens em claro permanecem apenas no BFF.

Nesta etapa `EnvioNotificacoes__Habilitado=false` e o Worker deve permanecer com zero replicas. A homologacao termina na preparacao e revisao da audiencia; o endpoint de envio responde `503` antes de alterar o destinatario ou gravar outbox.

Cada confirmacao individual muda somente o destinatario escolhido para `AguardandoSolicitacao` e gera uma mensagem de outbox na mesma transacao. A primeira confirmacao muda a Acao Comercial para `EmProcessamento`; nao existe comando coletivo. O Worker processa uma intencao por vez, reutiliza a chave `acao:{acaoId}:destinatario:{destinatarioId}:v1` em novas tentativas, recupera leases interrompidos e apenas consulta o estado tecnico no Notification Hub. Retentativas de provedor e webhooks permanecem sob responsabilidade do Hub.

## Build e testes

```bash
dotnet restore LavaMais.Crm.slnx
dotnet build LavaMais.Crm.slnx --configuration Release --no-restore
dotnet test LavaMais.Crm.slnx --configuration Release --no-build
```

Os testes de integracao usam PostgreSQL real por Testcontainers e, portanto, exigem Docker em execucao.

O pipeline tambem verifica formatacao e pacotes com vulnerabilidades conhecidas. O [runbook operacional](../../docs/09-operacao/README.md) descreve implantacao, alertas e os scripts validados de backup e restauracao.

## Migrations

Cada modulo possui seu proprio `DbContext`, schema e historico de migrations. O bloco `AdicionarContextoDoModulo` centraliza a configuracao do provedor sem criar um contexto compartilhado. API e Worker nao aplicam migrations automaticamente durante a inicializacao; a implantacao deve executa-las como etapa controlada.

As fabricas de design dos modulos tambem reconhecem `DATABASE_URL`. Assim, a etapa controlada de migrations pode usar a mesma referencia privada do Railway sem converter ou copiar a senha manualmente.

## Primeiro administrador

O primeiro administrador e ativado pela tela de primeiro acesso usando o telefone permitido na configuracao. Depois que a senha e definida, o endpoint recusa nova ativacao.
