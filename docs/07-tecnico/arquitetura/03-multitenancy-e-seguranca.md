# Multitenancy e Seguranca

## Fonte do tenant

O Identity Hub emite `tenant_id` e `tenant_slug` no access token e no identity token depois que o usuario seleciona um tenant ativo.

O CRM aceita `tenant_id` exclusivamente do principal autenticado. Cabecalhos, query strings, corpo e rotas nunca substituem esse valor para autorizacao.

## Isolamento

- todas as entidades empresariais possuem `TenantId`;
- repositorios exigem um contexto de tenant;
- indices e restricoes unicas incluem `TenantId` quando a regra for empresarial;
- consultas administrativas tambem passam por autorizacao explicita;
- testes de integracao verificam tentativa de leitura e escrita entre tenants.

## Identidade

- `sub` e armazenado como texto para preservar o contrato OIDC;
- nome e e-mail podem ser projetados para exibicao, mas o Identity Hub continua sendo a fonte;
- o CRM nao persiste senha, refresh token ou segredo de cliente no banco de dominio.

## Autorizacao local

Tabela logica `autorizacao.usuarios_crm`:

```text
Id
TenantId
UsuarioIdentidadeId
Papel
Situacao
DataCriacao
DataAtualizacao
```

Restricao unica: `TenantId + UsuarioIdentidadeId`.

Papeis iniciais:

- `Administrador`;
- `Gerente`;
- `Operador`.

O primeiro administrador de um tenant sera provisionado por operacao controlada de implantacao. Autoatribuicao de papel no primeiro login e proibida.

## BFF

- cliente OIDC confidencial para ambientes compartilhados;
- Authorization Code com PKCE;
- cookie de sessao `HttpOnly`, `Secure` e `SameSite=Lax`;
- tokens mantidos no servidor;
- protecao CSRF em mutacoes;
- refresh token rotacionado de forma serializada por sessao;
- logout local seguido do endpoint de logout do Identity Hub.

## API

- valida assinatura, emissor e expiracao do JWT;
- valida a audiencia do CRM assim que o Identity Hub passar a emitir o recurso `lavamais-crm-api`;
- exige tenant para endpoints empresariais;
- aplica politica de papel por caso de uso;
- usa correlacao para logs, auditoria e outbox;
- nao registra tokens nem dados pessoais completos em logs.

Antes da integracao final, o Identity Hub precisa registrar um escopo/recurso da API e emitir o claim `aud`. Enquanto isso nao existir, a ausencia de validacao de audiencia deve ficar limitada ao desenvolvimento local e registrada como risco conhecido.
