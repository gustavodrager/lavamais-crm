# Integracao com Identity Hub

Verificado em: 2026-08-15.

## Papel do servico

O Identity Hub e a unica fonte de autenticacao, contas, clientes OAuth, tenants e memberships. O LavaMais CRM nao possui senha nem fluxo de cadastro de identidade.

## Capacidades confirmadas

- .NET 10, ASP.NET Core Identity, OpenIddict e PostgreSQL;
- OIDC Authorization Code com PKCE `S256`;
- escopos `openid`, `profile`, `email` e `offline_access`;
- access token JWT com duracao atual de 10 minutos;
- refresh token rotacionado com duracao atual de 30 dias;
- clientes publicos e confidenciais;
- tenants, memberships e selecao de contexto;
- claims `tenant_id` e `tenant_slug` nos tokens;
- health check em `/health`.

## Lacuna confirmada para o CRM API

O servico atual registra apenas os escopos OIDC padrao e nao atribui um recurso especifico ao access token. Consequentemente, o token atual nao fornece `aud` para `lavamais-crm-api`.

Antes de homologacao, sera necessario evoluir o Identity Hub para:

- registrar um escopo de acesso do CRM;
- associar esse escopo ao recurso `lavamais-crm-api`;
- permitir o escopo ao cliente `lavamais-crm-web`;
- emitir a audiencia no access token;
- adicionar testes de token destinado e nao destinado ao CRM.

## Endpoints OIDC

```text
GET/POST /connect/authorize
POST     /connect/token
GET      /connect/userinfo
GET/POST /connect/logout
GET      /.well-known/openid-configuration
```

O CRM deve descobrir metadados e chaves pelo documento OIDC, sem fixar endpoints de assinatura no codigo.

## Fluxo do CRM

1. O navegador solicita entrada ao BFF Next.js.
2. O BFF cria `state`, `nonce` e PKCE e redireciona ao Identity Hub.
3. O Identity Hub autentica e valida o tenant selecionado.
4. O callback do BFF troca o codigo por tokens.
5. Os tokens permanecem no servidor e a sessao usa cookie seguro.
6. O BFF encaminha o access token ao CRM API.
7. A API valida JWT, exige `sub` e `tenant_id` e aplica o papel local do CRM.

## Registro do cliente

Ambientes compartilhados devem possuir cliente confidencial `lavamais-crm-web`, com URIs exatas de callback e logout. Segredo, quando usado, fica apenas no ambiente do BFF.

Desenvolvimento local pode usar um cliente separado com callbacks loopback autorizados.

## Autorizacao

O papel `identity-admin` pertence a administracao do Identity Hub e nao representa permissao no CRM.

As memberships atuais confirmam acesso ao tenant, mas nao carregam `Administrador`, `Gerente` ou `Operador`. Esses papeis ficam em `autorizacao.usuarios_crm`, vinculados a `sub + tenant_id`.

## Regras de falha

- token sem tenant recebe `403` nos endpoints empresariais;
- membership revogada invalida a continuidade do contexto no refresh;
- refresh token deve ser rotacionado de forma serializada por sessao;
- falha de descoberta ou validacao nao permite fallback para login local;
- tokens, authorization codes e segredos nunca sao registrados em log.

Em desenvolvimento, a validacao inicial pode ser exercitada antes da emissao de `aud`, mas essa excecao nao e aceitavel para homologacao ou producao.

## Implementacao no CRM

A CRM API valida tokens com o middleware JWT Bearer e descobre metadados e chaves a partir da autoridade configurada. A opcao `Autenticacao:ValidarAudiencia=false` e rejeitada fora do ambiente `Development`.

O contexto empresarial deriva exclusivamente os claims `sub` e `tenant_id` do principal autenticado. O acesso aos endpoints de autorizacao exige usuario ativo com papel local `Administrador` no mesmo tenant.

O primeiro administrador nao e criado durante o login. Ele e provisionado por operacao controlada no CRM Worker, que exige `tenant_id` e `sub` explicitos e recusa duplicidade.

## Fonte verificada

Contrato confirmado no repositorio local `quebranunca/identity-hub`, especialmente em `README.md` e `AuthorizationController.cs`.
