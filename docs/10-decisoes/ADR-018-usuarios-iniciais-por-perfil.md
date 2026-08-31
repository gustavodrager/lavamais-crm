# ADR-018 — Usuarios iniciais por perfil

- Status: aceito
- Data: 2026-08-27
- Complementa: ADR-011

## Contexto

A homologacao precisa exercitar os tres papeis locais do CRM: `Administrador`, `Gerente` e `Operador`. O primeiro desenho de identidade local permitia ativar somente um administrador inicial, o que dificultava validar a experiencia e a autorizacao de cada perfil.

## Decisao

- a configuracao da API pode declarar uma lista de usuarios iniciais;
- cada usuario inicial possui telefone, nome e papel local;
- cada telefone configurado define sua propria senha no primeiro acesso;
- a senha de um telefone ja ativado nao pode ser redefinida pelo endpoint de primeiro acesso;
- o navegador continua enviando somente telefone e senha;
- tenant, nome do tenant e papel continuam sendo derivados exclusivamente da configuracao do servidor e da autorizacao persistida.

## Consequencias

- Administrador, Gerente e Operador podem ser testados sem criar senhas padrao no repositorio;
- a ativacao de um perfil nao bloqueia o primeiro acesso dos demais perfis configurados;
- ambientes antigos com `TelefonePermitido` e `NomeUsuario` continuam funcionando como um unico administrador inicial;
- recuperacao de senha, convite de usuarios e troca de telefone permanecem evolucoes posteriores.
