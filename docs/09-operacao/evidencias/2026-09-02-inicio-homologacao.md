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
- OpenAPI publicou clientes, Movimentacoes Comerciais, Roteiros e envio individual, sem o comando coletivo removido.

## Lacuna encontrada e tratamento local

A implantacao consultada ainda revelava `X-Powered-By` e nao devolvia a politica minima de seguranca do BFF. O `next.config.ts` foi endurecido e recebeu cobertura ponta a ponta. A evidencia remota somente pode ser marcada como concluida depois de publicar a nova versao da Web e repetir o verificador.

## Proximas validacoes

1. publicar a versao fechada da Fase 1 na Web de homologacao;
2. repetir `scripts/homologacao/verificar-superficie-publica.sh`;
3. configurar e ativar separadamente os usuarios de Administrador, Gerente e Operador;
4. executar os fluxos autenticados sem usar dados pessoais nao autorizados;
5. homologar WhatsMiau e Worker somente com destinatario autorizado;
6. ensaiar backup e restauracao isolada no provedor.
