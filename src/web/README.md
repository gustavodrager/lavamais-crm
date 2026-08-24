# LavaMais CRM Web

Frontend e BFF da Versão 1.0, construídos com Next.js App Router, React, TypeScript estrito, Tailwind CSS e shadcn/ui.

A listagem e o detalhe de Ações Comerciais são renderizados no servidor e sempre usam a CRM API. Access e refresh tokens não são enviados ao JavaScript do navegador. Dados demonstrativos permanecem temporariamente apenas nas áreas ainda não integradas.

## Configuração

```text
LAVAMAIS_CRM_API_URL=https://crm-api.exemplo
LAVAMAIS_URL_APLICACAO=https://crm.exemplo
```

O login usa telefone e senha pela CRM API. O BFF persiste o token opaco somente na sessao server-side e entrega ao navegador um cookie `HttpOnly`, `Secure` e `SameSite=Lax`. O `tenant_id` nunca é recebido do navegador.

Em desenvolvimento, o repositorio de sessoes usa memoria. Homologacao e producao usam o schema tecnico `web` do PostgreSQL, com tokens criptografados por AES-256-GCM. Configure `LAVAMAIS_SESSOES_DATABASE_URL` e uma chave Base64 de 32 bytes em `LAVAMAIS_CHAVE_CRIPTOGRAFIA_SESSAO`, depois aplique o script `infraestrutura/postgresql/001-sessoes-web.sql`.

## Fluxos integrados

- autenticação local por telefone e sessão server-side;
- listagem e detalhe de Ações Comerciais;
- criação de rascunho com item ativo do catálogo;
- validação no navegador e novamente na Server Action;
- redirecionamento ao detalhe após confirmação da CRM API.

O rascunho inicial usa critérios de segmentação no schema 1, em modo `Filtros`, sem filtros preenchidos. A definição e a simulação do público pertencem à próxima etapa da experiência.

### Desenvolvimento temporariamente sem autenticação

```bash
LAVAMAIS_CRM_API_URL=http://127.0.0.1:5000 npm run dev:sem-autenticacao
```

Esse modo existe apenas fora de produção, não implementa login local e não recebe `tenantId`. Se a CRM API real exigir bearer token, ele pode ser informado somente no servidor por `LAVAMAIS_ACCESS_TOKEN_DESENVOLVIMENTO`. A aplicação recusa a flag `LAVAMAIS_DESABILITAR_AUTENTICACAO=1` quando `NODE_ENV=production`.

Mantenha `LAVAMAIS_ENVIO_NOTIFICACOES_HABILITADO=0` enquanto a Central de Notificacao nao estiver integrada.

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
