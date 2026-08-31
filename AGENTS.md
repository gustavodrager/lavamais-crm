# Orientacoes para agentes

## Fonte de verdade

Antes de planejar ou alterar o projeto, leia nesta ordem:

1. `README.md`;
2. `docs/00-visao-geral/02-visao-produto.md`;
3. `docs/00-visao-geral/03-escopo-versao-1.md`;
4. `docs/10-decisoes/README.md` e os ADRs relacionados;
5. a documentacao do modulo que sera alterado.

Documentos marcados como `Historico` registram fases anteriores e nao definem o escopo vigente.

## Idioma

- Portugues e o idioma padrao de codigo, testes, documentacao, logs, mensagens e commits.
- Identificadores de codigo nao usam acentos: `AcaoComercial`, `BuscarClientesElegiveis`.
- Tabelas e colunas usam portugues em `snake_case`: `acoes_comerciais`, `data_criacao`.
- Rotas e propriedades JSON usam portugues: `/api/v1/acoes-comerciais`, `dataCriacao`.
- Permanecem em ingles apenas palavras reservadas, nomes exigidos por frameworks, protocolos, padroes e contratos externos.
- Em documentos externos, nao usar o termo MVP. Usar `Versao 1.0`, `implantacao inicial` ou `primeira fase de implantacao`.

## Produto

O LavaMais CRM e uma plataforma de relacionamento comercial. Nao e um sistema de producao, estoque, caixa, financeiro ou logistica da lavanderia.

A implantacao inicial entrega uma unica capacidade ponta a ponta: criar e executar uma `AcaoComercial` para um publico selecionado da base de clientes.

Como nao existe historico inicial de pedidos ou movimentacoes, nao implementar classificacoes baseadas em frequencia, ticket, inatividade ou recuperacao. Essas regras pertencem ao roadmap.

## Arquitetura definida

- Monorepo.
- Frontend/BFF em Next.js e TypeScript.
- API em ASP.NET Core com .NET 10.
- Worker em .NET 10.
- Monolito modular no backend.
- PostgreSQL com Entity Framework Core.
- Autenticacao local por telefone, senha e sessao opaca, conforme ADR-011.
- Envio de mensagens pelo WhatsMiau no modo local, atras de porta preparada para a futura Central de Notificacao, conforme ADR-017.
- Outbox transacional no CRM para efeitos externos.
- OpenAPI para o contrato HTTP.

Nao introduzir microsservicos, Kafka, Kubernetes, Redis ou um segundo mecanismo de filas sem um ADR aprovado e uma necessidade medida.

## Limites dos modulos

Modulos iniciais:

- `Clientes`;
- `Catalogo`;
- `Segmentacao`;
- `ModelosDeMensagem`;
- `AcoesComerciais`;
- `Importacoes`;
- `Autorizacao`;
- `Auditoria`;
- `Integracoes`.

Cada modulo organiza `Dominio`, `Aplicacao`, `Infraestrutura` e sua exposicao HTTP. Um modulo nao acessa diretamente o `DbContext`, entidades ou tabelas internas de outro modulo. Integracoes entre modulos usam contratos de aplicacao, identificadores e eventos internos.

## Identidade, tenant e autorizacao

- O CRM autentica localmente pelo telefone autorizado e por senha definida no primeiro acesso.
- Senhas usam PBKDF2-SHA256 com salt individual e sessoes usam tokens opacos com apenas o hash persistido.
- O servidor deriva obrigatoriamente usuario, tenant e papel a partir da sessao autenticada.
- Toda leitura e escrita empresarial deve ser filtrada no servidor pelo tenant autenticado.
- Nunca aceitar `tenantId` enviado pelo navegador como fonte de autorizacao.
- Os papeis `Administrador`, `Gerente` e `Operador` sao especificos do CRM e ficam no banco do CRM.
- O BFF guarda o token opaco na sessao server-side e entrega ao navegador somente um cookie `HttpOnly`.

## Notificacoes

- Credenciais ficam apenas na API ou no Worker.
- Usar chave de idempotencia deterministica por tenant e guardar a origem `Local` ou `Central` junto ao identificador.
- A outbox transacional existente e a unica fila; `notificacoes_locais` guarda estado tecnico, nao agenda trabalho.
- No modo local, enviar o conteudo congelado pelo WhatsMiau e converter somente os eventos conhecidos de `messages.update`.
- Nao registrar telefone, conteudo, `apikey` ou segredo do webhook em logs.
- No modo `Central`, usar `source=lavamais-crm` e delegar tentativas e webhooks tecnicos ao servico externo.
- Mensagens proativas de WhatsApp usam modelos revisados e parametros controlados, sem edicao livre depois da preparacao.

## Persistencia

- IDs em UUID.
- Datas em UTC com `DateTimeOffset` e `timestamptz`.
- Valores financeiros em `decimal`, nunca `double`.
- Criterios de segmentacao podem usar `jsonb`, mas devem possuir tipos e versao de schema no codigo.
- Agregados mutaveis usam concorrencia otimista.
- Preferir situacao de negocio explicita a exclusao logica generica.
- Restricoes unicas e consultas empresariais sempre consideram o tenant.

## Qualidade

- Testes de backend com xUnit; integracoes com PostgreSQL real por Testcontainers.
- Testes de frontend com Vitest e fluxos ponta a ponta com Playwright.
- Novas regras de negocio exigem testes automatizados.
- Corrigir warnings relevantes; nao os ocultar globalmente.
- Segredos nunca sao versionados.
- Alteracoes de schema usam migrations versionadas e etapa controlada de deploy.

## Fluxo de trabalho

- Preserve alteracoes existentes do usuario.
- Mantenha cada conversa ou tarefa em uma frente bem delimitada.
- Em trabalho paralelo, use branch ou worktree propria e evite alterar os mesmos arquivos.
- Decisoes estruturais novas devem ser registradas em `docs/10-decisoes/`.
- Atualize a documentacao junto com alteracoes que modifiquem contratos, regras ou escopo.
