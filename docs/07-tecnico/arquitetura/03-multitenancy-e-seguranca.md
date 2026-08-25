# Multitenancy e Seguranca

## Identidade vigente

O CRM autentica localmente pelo telefone autorizado e pela senha definida no primeiro acesso. O servidor associa a identidade ao tenant e ao papel configurados; o navegador nunca informa `tenantId` ou papel como fonte de autorizacao.

Senhas usam PBKDF2-SHA256 com salt individual. Sessoes usam tokens aleatorios opacos, e apenas o hash SHA-256 e persistido no schema `identidade`.

## Sessao no BFF

- o BFF recebe o token opaco da CRM API;
- o token fica criptografado na sessao server-side;
- o navegador recebe somente um identificador de sessao em cookie `HttpOnly`, `Secure` e `SameSite=Lax`;
- homologacao e producao persistem as sessoes no schema tecnico `web` do PostgreSQL;
- a chave AES-256-GCM e exclusiva por ambiente e fornecida por segredo;
- a rotacao da chave encerra as sessoes existentes.

## Isolamento por tenant

- entidades empresariais possuem `TenantId`;
- a API deriva o tenant somente da sessao autenticada;
- filtros globais de persistencia e consultas de aplicacao restringem os dados ao tenant;
- restricoes unicas empresariais incluem o tenant;
- recursos de outro tenant nao sao revelados e retornam resposta equivalente a recurso inexistente;
- nenhum `DbContext`, entidade ou tabela interna de outro modulo e acessado diretamente.

## Autorizacao

Os papeis locais sao `Administrador`, `Gerente` e `Operador`. As politicas sao aplicadas na API, independentemente do que a interface apresenta ou oculta.

O primeiro administrador e ativado por procedimento controlado. Recuperacao de senha, multiplos usuarios e alteracao do telefone permitido permanecem evolucoes posteriores.

## Protecoes operacionais

- login e primeiro acesso possuem limitacao de taxa;
- segredos nao sao versionados nem registrados em logs;
- logs nao incluem tokens, corpos ou dados pessoais;
- conexoes de banco usam configuracao externa nos ambientes compartilhados;
- migrations sao executadas por etapa controlada, nunca no startup;
- credenciais do Notification Hub ficam somente na API ou no Worker;
- o envio permanece desabilitado enquanto a integracao segura com o Notification Hub nao estiver pronta.

## Historico da decisao

A arquitetura anterior previa OIDC pelo Identity Hub. O ADR-011 substituiu essa parte das ADR-003, ADR-004 e ADR-010. O documento de integracao com o Identity Hub permanece marcado como historico.
