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
- API, PostgreSQL, Migrador e Worker mantiveram as implantacoes anteriores; o Worker permaneceu sem implantacao;
- `scripts/homologacao/verificar-superficie-publica.sh` concluiu todas as verificacoes sem falhas depois da publicacao.

## Lacuna corrigida e validada remotamente

A implantacao anterior revelava `X-Powered-By` e nao devolvia a politica minima de seguranca do BFF. A Web publicada a partir do commit `2a17bb2` removeu esse cabecalho e passou a devolver CSP, `Cross-Origin-Opener-Policy`, `Permissions-Policy`, `Referrer-Policy`, `X-Content-Type-Options` e `X-Frame-Options`. O verificador remoto confirmou o comportamento em homologacao sem autenticacao e sem escrita de dados.

## Proximas validacoes

1. configurar e ativar separadamente os usuarios de Administrador, Gerente e Operador;
2. executar os fluxos autenticados sem usar dados pessoais nao autorizados;
3. homologar WhatsMiau e Worker somente com destinatario autorizado;
4. ensaiar backup e restauracao isolada no provedor.
