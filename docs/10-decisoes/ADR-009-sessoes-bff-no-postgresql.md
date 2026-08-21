# ADR-009 — Sessoes do BFF no PostgreSQL

- Status: aceito
- Data: 2026-08-20

## Contexto

O BFF mantinha estado OIDC e tokens em memoria. Essa implementacao perde sessoes em reinicios e nao funciona corretamente com mais de uma instancia, portanto nao atende homologacao e producao.

## Decisao

Persistir sessoes server-side e estados temporarios do fluxo OIDC no PostgreSQL do ambiente, em tabelas exclusivas do schema `web`.

- o navegador continua recebendo somente um identificador opaco em cookie `HttpOnly`;
- access token, refresh token, identity token e estado OIDC ficam criptografados com AES-256-GCM antes da persistencia;
- a chave de criptografia e exclusiva por ambiente e fornecida por segredo;
- a renovacao de uma sessao usa bloqueio consultivo do PostgreSQL para evitar refresh concorrente entre instancias;
- registros expirados sao removidos durante gravacoes e podem receber limpeza operacional adicional;
- a criacao das tabelas ocorre por script versionado e controlado, nunca automaticamente no startup.

O BFF acessa apenas seu schema tecnico de sessoes. Dados empresariais continuam acessados exclusivamente pela CRM API.

## Consequencias

- reinicios e multiplas instancias nao invalidam sessoes ativas;
- o BFF precisa de conexao privada com o PostgreSQL e de uma chave Base64 com 32 bytes;
- rotacao da chave invalida as sessoes existentes e exige novo login;
- o banco passa a conter credenciais criptografadas de curta duracao e deve manter os mesmos controles de acesso e backup do CRM.
