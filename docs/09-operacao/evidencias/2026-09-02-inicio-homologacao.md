# Inicio da Homologacao — 2 de setembro de 2026

## Escopo da verificacao

Verificacao publica, sem autenticacao, sem escrita de dados e sem ativacao do Worker ou do WhatsApp.

## Evidencias confirmadas

- projeto Railway `lavamais-crm` e ambiente `homologacao` localizados explicitamente;
- PostgreSQL com uma replica ativa e volume pronto;
- Web/BFF e API com implantacoes ativas;
- Migrador encerrado com sucesso;
- Worker sem implantacao ativa;
- `/saude/vivo` retornou `200` e `Healthy`;
- `/saude/pronto` retornou `200`, com API e PostgreSQL saudaveis;
- pagina publica `/entrar` retornou `200` e apresentou o primeiro acesso;
- rota Web protegida redirecionou visitante sem sessao para `/entrar`;
- endpoints empresariais de clientes, movimentacoes, roteiros e capacidades retornaram `401` sem sessao;
- OpenAPI publicou clientes, Movimentacoes Comerciais, Roteiros e envio individual, sem o comando coletivo removido;
- commit funcional publicado na Web: `2a17bb2`;
- implantacao Web `fa2819e9-93b9-47da-9d14-39f9fd12d47a`, criada em `2026-09-02T13:50:22.542Z`, concluida com `SUCCESS` e instancia `RUNNING`;
- PostgreSQL, Migrador e Worker mantiveram as implantacoes anteriores; o Worker permaneceu sem implantacao;
- `scripts/homologacao/verificar-superficie-publica.sh` concluiu todas as verificacoes sem falhas depois da publicacao.

## Lacuna corrigida e validada remotamente

A implantacao anterior revelava `X-Powered-By` e nao devolvia a politica minima de seguranca do BFF. A Web publicada a partir do commit `2a17bb2` removeu esse cabecalho e passou a devolver CSP, `Cross-Origin-Opener-Policy`, `Permissions-Policy`, `Referrer-Policy`, `X-Content-Type-Options` e `X-Frame-Options`. O verificador remoto confirmou o comportamento em homologacao sem autenticacao e sem escrita de dados.

## Usuarios iniciais de homologacao

- o Gerente foi configurado externamente com o telefone autorizado terminado em `7083`;
- o Operador foi configurado externamente com o telefone corporativo da loja terminado em `5955`;
- nomes, telefones e papeis nao foram gravados no repositorio;
- nenhuma senha foi criada pela equipe tecnica; cada usuario definira sua propria senha no primeiro acesso;
- a API foi reimplantada como `6048893a-4df5-42e0-b871-0afb7c2fbd91`, criada em `2026-09-02T14:33:47.057Z` e concluida com `SUCCESS`;
- depois da reimplantacao, a superficie publica passou novamente sem falhas e o indicador de primeiro acesso retornou `disponivel: true`;
- WhatsApp e Worker permaneceram desligados durante toda a configuracao.

Em seguida, os tres perfis realizaram o primeiro acesso. O encerramento da ativacao foi confirmado sem consultar credenciais: o indicador publico passou a retornar `disponivel: false` e as chamadas autenticadas de Acoes Comerciais e Movimentacoes Comerciais retornaram `200`.

## Destinatarios autorizados para o ensaio de WhatsApp

- Gustavo Drager, com telefone autorizado terminado em `2540`;
- Vanessa Drager, autorizada para o mesmo ensaio, com telefone ainda pendente de configuracao;
- a autorizacao foi informada pelo responsavel do projeto em 2 de setembro de 2026 e se limita a homologacao;
- nenhum numero completo foi registrado nesta evidencia;
- nenhum envio foi realizado: API e Worker ainda nao possuem a instancia, a chave e o segredo de webhook do WhatsMiau.

## Proximas validacoes

1. executar os fluxos autenticados usando apenas dados controlados;
2. receber o telefone autorizado da Vanessa e cadastrar os dois clientes de homologacao;
3. provisionar a instancia e as credenciais do WhatsMiau, cadastrar o webhook e somente entao ativar uma replica do Worker;
4. homologar envio individual, entrega, leitura e idempotencia somente com os destinatarios autorizados;
5. ensaiar backup e restauracao isolada no provedor.
