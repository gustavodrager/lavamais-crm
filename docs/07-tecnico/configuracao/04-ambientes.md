# Matriz de Ambientes

| Controle | Desenvolvimento | Homologacao | Producao |
|---|---|---|---|
| Banco | PostgreSQL local | PostgreSQL privado isolado | PostgreSQL privado isolado |
| Dados empresariais | sinteticos | somente carga autorizada | bloqueados ate liberacao |
| Sessoes BFF | memoria | schema `web` criptografado | schema `web` criptografado |
| Identidade | local | local validada | local validada |
| Envio | `Desabilitado` por padrao ou `Local` com credenciais de teste | `Local` depois da homologacao do WhatsMiau | bloqueado ate liberacao operacional |
| Worker | opcional para desenvolvimento | uma replica quando o modo local for habilitado | zero replicas ate liberacao; depois uma replica |
| Migrations | comando local controlado | Migrador | Migrador com aprovacao |
| Backup | dispensavel para dados sinteticos | PITR e ensaio pendente | PITR e ensaio obrigatorios |
| Flags de teste | permitidas | proibidas | proibidas |

Nenhum dado de homologacao pode ser copiado para producao. Chaves, conexoes e tokens nao sao compartilhados entre ambientes.
