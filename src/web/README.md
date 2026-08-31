# LavaMais CRM Web

Frontend e BFF da Versão 1.0, construídos com Next.js App Router, React, TypeScript estrito, Tailwind CSS e shadcn/ui.

A listagem e o detalhe de Ações Comerciais são renderizados no servidor e sempre usam a CRM API. O token opaco da API não é enviado ao JavaScript do navegador. Dados demonstrativos permanecem apenas no adaptador explicitamente usado para demonstração.

## Configuração

```text
LAVAMAIS_CRM_API_URL=https://crm-api.exemplo
LAVAMAIS_URL_APLICACAO=https://crm.exemplo
```

O login usa telefone e senha pela CRM API. O BFF persiste o token opaco somente na sessao server-side e entrega ao navegador um cookie `HttpOnly`, `Secure` e `SameSite=Lax`. O `tenant_id` nunca é recebido do navegador.

Em desenvolvimento, o repositorio de sessoes usa memoria. Homologacao e producao usam o schema tecnico `web` do PostgreSQL, com tokens criptografados por AES-256-GCM. Configure `LAVAMAIS_SESSOES_DATABASE_URL` e uma chave Base64 de 32 bytes em `LAVAMAIS_CHAVE_CRIPTOGRAFIA_SESSAO`, depois aplique em ordem os scripts de `infraestrutura/postgresql/`.

## Fluxos integrados

- autenticação local por telefone e sessão server-side;
- listagem e detalhe de Ações Comerciais;
- criação de rascunho com item opcional do catálogo;
- definição e simulação do público;
- seleção e publicação de modelos de mensagem;
- preparação e congelamento da audiência;
- conferência e solicitação de envio individual;
- acompanhamento dos destinatários e registro de resultado comercial;
- cadastro e listagem de clientes;
- importação CSV;
- biblioteca de mensagens aprovadas dentro de Ações Comerciais;
- configurações de catálogo, etiquetas e disponibilidade do canal de mensagens;
- validação no navegador e novamente na Server Action;
- redirecionamento ao detalhe após confirmação da CRM API.

### Desenvolvimento temporariamente sem autenticação

```bash
LAVAMAIS_CRM_API_URL=http://127.0.0.1:5000 npm run dev:sem-autenticacao
```

Esse modo existe apenas fora de produção, não implementa login local e não recebe `tenantId`. Se a CRM API real exigir bearer token, ele pode ser informado somente no servidor por `LAVAMAIS_ACCESS_TOKEN_DESENVOLVIMENTO`. A aplicação recusa a flag `LAVAMAIS_DESABILITAR_AUTENTICACAO=1` quando `NODE_ENV=production`.

A interface consulta `/api/v1/capacidades` na CRM API para decidir se apresenta o envio individual. Nao existe uma segunda flag no Next.js; a API e a unica autoridade sobre a disponibilidade do canal.

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

Os testes do frontend ficam em `testes/frontend`. O Playwright sobe uma CRM API falsa local e habilita uma rota de sessão somente com `LAVAMAIS_AMBIENTE_TESTE=1`; fora desse ambiente ela responde 404. As fontes usam a pilha nativa do sistema definida no CSS, então o build não depende do Google Fonts.
