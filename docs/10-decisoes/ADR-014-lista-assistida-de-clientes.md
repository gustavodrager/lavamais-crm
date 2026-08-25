# ADR-014 — Lista assistida de clientes para Acao Comercial

- Status: aceito
- Data: 2026-08-25
- Complementa: ADR-007

## Contexto

A selecao inicial por cidade e bairro permitia formar audiencias grandes e exigia que a recepcao entendesse filtros de segmentacao antes de iniciar o atendimento. Na operacao inicial da LavaMais, o objetivo e trabalhar com poucos contatos, conferir cada mensagem e decidir individualmente quando envia-la.

## Decisao

Na Versao 1.0, a configuracao de uma Acao Comercial oferece duas formas simples de escolher clientes:

1. lista pronta com ate dez clientes aptos para comunicacao por WhatsApp;
2. busca por nome ou WhatsApp para escolha manual de uma a dez pessoas.

Cidade e bairro deixam de ser apresentados como filtros no fluxo principal. A lista pronta considera somente clientes ativos, com contato valido e permissao para comunicacao. A preparacao continua reavaliando a elegibilidade e congelando os destinatarios.

O limite de dez pertence a lista preparada pela experiencia inicial. Ele nao autoriza envio coletivo. Depois da preparacao, o usuario:

1. escolhe uma cliente da fila;
2. abre a mensagem personalizada em uma interface de conversa;
3. confere nome, destino e conteudo aprovado;
4. confirma somente aquela mensagem;
5. segue manualmente para a proxima cliente.

## Consequencias

- a recepcao inicia o trabalho sem configurar segmentacoes tecnicas;
- o volume curto reduz erros e torna o trabalho individual compreensivel;
- nao existe selecao de todos, envio em lote ou envio automatico;
- modelos proativos permanecem aprovados e sem edicao livre;
- classificacoes por frequencia, ticket, inatividade ou historico de compras continuam fora da Versao 1.0;
- novos criterios de priorizacao exigem dados confiaveis e decisao posterior.
