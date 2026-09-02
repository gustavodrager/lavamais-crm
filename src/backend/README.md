# Backend do LavaMais CRM

CRM API e ferramentas controladas em .NET 10, organizadas como monolito modular.

## Requisitos

- SDK .NET definido em `global.json`;
- Docker com Compose;
- PostgreSQL 17, fornecido localmente pelo Compose.

## Executar localmente

Na raiz do repositório:

```bash
docker compose -f infraestrutura/compose.yml up -d
dotnet run --project src/backend/LavaMais.Crm.Api
```

A API publica OpenAPI em `/openapi/v1.json`, vida em `/saude/vivo` e prontidão em `/saude/pronto`. Os logs registram método, caminho sem query string, status, duração e correlação; não registram corpos, tokens, telefone ou conteúdo de mensagem.

Não existe Worker de WhatsApp. O envio assistido acontece no navegador pelo link oficial `wa.me`; a API apenas registra abertura, confirmação manual e resultado comercial.

## Configuração

A conexão PostgreSQL aceita, nesta ordem:

1. `DATABASE_URL`, no formato `postgresql://` fornecido pelo Railway;
2. `ConnectionStrings__Crm`, no formato nativo do Npgsql.

Homologação e produção falham na inicialização quando nenhuma conexão externa é fornecida. Não existem variáveis, chaves ou segredos de provedor de WhatsApp.

### Identidade local

Configure `IdentidadeLocal__TenantId`, `IdentidadeLocal__NomeTenant` e `IdentidadeLocal__UsuariosIniciais`. Cada usuário inicial possui telefone, nome e papel `Administrador`, `Gerente` ou `Operador`, e define sua própria senha no primeiro acesso. Senhas protegidas e hashes de sessão ficam no schema `identidade`; tokens em claro permanecem apenas na sessão server-side do BFF.

## Ações Comerciais e WhatsApp Web

Cada destinatário começa como `Pendente`. A interface abre a mensagem congelada em `https://wa.me/{telefone}?text={mensagem}`. Abertura não muda estado. Depois que a pessoa envia no WhatsApp, o endpoint de confirmação muda somente aquele destinatário para `Enviado`, registra usuário e horário e mantém concorrência otimista. O CRM não representa entrega ou leitura.

## Build e testes

```bash
dotnet restore LavaMais.Crm.slnx
dotnet build LavaMais.Crm.slnx --configuration Release --no-restore
dotnet test LavaMais.Crm.slnx --configuration Release --no-build
```

Os testes de integração usam PostgreSQL real por Testcontainers e exigem Docker.

## Migrations

Cada módulo possui `DbContext`, schema e histórico próprios. A API não aplica migrations ao iniciar; a implantação usa `LavaMais.Crm.Migrador` como etapa controlada.

O contexto vazio de `Integracoes` é temporário e existe somente para aplicar, em bancos anteriores, a migration que remove outbox e notificações locais. Ele não é referenciado pela API.

## Primeiro administrador

Usuários iniciais são ativados pela tela de primeiro acesso usando os telefones permitidos. Depois que a senha é definida, nova ativação do mesmo telefone é recusada.
