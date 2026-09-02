# ADR-011 — Identidade local do CRM

- Status: aceito
- Data: 2026-08-24
- Substitui: parte de identidade das ADR-003, ADR-004 e ADR-010

## Contexto

A dependencia da Central de Identidade aumentou a distancia ate a primeira operacao real do CRM. A implantacao inicial possui um unico administrador e precisa de acesso simples por telefone.

## Decisao

- o CRM autentica localmente;
- os usuarios iniciais permitidos sao configurados no servidor por variaveis de ambiente e seus telefones reais nao sao versionados;
- no primeiro acesso, esse usuario define uma senha de pelo menos dez caracteres;
- depois da ativacao, o primeiro acesso nao pode ser repetido;
- senhas usam PBKDF2-SHA256 com salt individual e nunca sao armazenadas ou registradas em claro;
- sessoes usam tokens aleatorios opacos; somente o hash SHA-256 e persistido;
- o BFF guarda o token na sessao server-side e entrega ao navegador cookie opaco `HttpOnly`;
- `sub`, `tenant_id` e papel sao derivados no servidor;
- login e primeiro acesso possuem limitacao de taxa.

## Consequencias

- API e banco passam a custodiar credenciais;
- o primeiro acesso deve ocorrer antes da divulgacao da URL, pois ainda nao existe comprovacao por SMS;
- recuperacao de senha, multiplos usuarios e troca de telefone ficam para evolucao posterior;
- a integracao OIDC deixa de ser o contrato vigente do CRM.
