# Web e BFF

| Configuracao | Obrigatoria | Sensivel | Finalidade |
|---|---:|---:|---|
| `NODE_ENV` | sim | nao | ambiente do Next.js |
| `LAVAMAIS_CRM_API_URL` | sim | nao | endereco server-side da CRM API |
| `LAVAMAIS_URL_APLICACAO` | compartilhado | nao | origem canonica usada em redirecionamentos |
| `LAVAMAIS_SESSOES_DATABASE_URL` | homologacao e producao | sim | conexao privada do schema tecnico `web` |
| `LAVAMAIS_CHAVE_CRIPTOGRAFIA_SESSAO` | homologacao e producao | sim | chave Base64 de 32 bytes para AES-256-GCM |
| `LAVAMAIS_DESABILITAR_AUTENTICACAO` | somente desenvolvimento | nao | ativa adaptador local sem login quando vale `1` |
| `LAVAMAIS_ACCESS_TOKEN_DESENVOLVIMENTO` | somente desenvolvimento | sim | token server-side opcional para API local protegida |
| `LAVAMAIS_AMBIENTE_TESTE` | somente testes | nao | habilita a sessao controlada do Playwright |

## Regras

- nenhuma variavel sensivel usa prefixo `NEXT_PUBLIC_`;
- a chave de sessao e exclusiva por ambiente e sua rotacao encerra sessoes existentes;
- flags de desenvolvimento e teste devem falhar ou permanecer inacessiveis em producao;
- a disponibilidade do envio vem de `/api/v1/capacidades`; nao existe flag duplicada no Next.js;
- o BFF acessa somente o schema tecnico `web`; dados empresariais passam pela CRM API;
- respostas publicas definem CSP minima, bloqueio de `iframe`, `nosniff`, politica de referencia e permissoes restritas;
- o cabecalho `X-Powered-By` permanece desabilitado.
