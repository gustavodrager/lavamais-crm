# LavaMais CRM Web

Frontend e BFF da Versão 1.0, construídos com Next.js App Router, React, TypeScript estrito, Tailwind CSS e shadcn/ui.

A listagem e o detalhe de Ações Comerciais são renderizados no servidor e sempre usam a CRM API. Access e refresh tokens não são enviados ao JavaScript do navegador. Dados demonstrativos permanecem temporariamente apenas nas áreas ainda não integradas.

## Configuração

```text
LAVAMAIS_CRM_API_URL=https://crm-api.exemplo
LAVAMAIS_URL_APLICACAO=https://crm.exemplo
LAVAMAIS_OIDC_AUTORIDADE=https://identity.exemplo
LAVAMAIS_OIDC_CLIENT_ID=lavamais-crm-web
LAVAMAIS_OIDC_CLIENT_SECRET=<segredo do ambiente compartilhado>
```

O callback a registrar é `/api/autenticacao/callback`. O BFF usa descoberta OIDC, Authorization Code com PKCE S256, `state`, `nonce`, cookie opaco `HttpOnly`, `Secure`, `SameSite=Lax` e refresh serializado por sessão. O `tenant_id` nunca é recebido do navegador: a CRM API o deriva exclusivamente do access token.

O repositório de sessão atual é uma fronteira em memória adequada somente a desenvolvimento e testes de instância única. Homologação e produção exigem armazenamento compartilhado e limpeza de sessões, registro do cliente `lavamais-crm-web` e emissão da audiência `lavamais-crm-api` pelo Identity Hub.

## Executar e verificar

```bash
npm ci
npm run dev
npm run verificar-tipos
npm run lint
npm run testar
npm run testar:e2e
npm run build
```

O Playwright sobe uma CRM API falsa local e habilita uma rota de sessão somente com `LAVAMAIS_AMBIENTE_TESTE=1`; fora desse ambiente ela responde 404. As fontes usam a pilha nativa do sistema definida no CSS, então o build não depende do Google Fonts.
