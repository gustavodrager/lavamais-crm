# Segmentacao Inicial

## Restricao de dados

A LavaMais nao fornecera inicialmente historico de pedidos ou movimentacoes. Consequentemente, a Versao 1.0 nao calcula inatividade, frequencia, ticket medio, queda de consumo ou recuperacao.

## Filtros disponiveis

- bairro;
- cidade;
- tipo de cliente;
- etiquetas;
- interesses declarados;
- cliente cadastrado dentro de um periodo;
- aniversario dentro de um periodo, quando informado;
- permissao de marketing pelo canal;
- selecao manual.

## Regra de elegibilidade

Independentemente dos filtros escolhidos, um destinatario so pode entrar na audiencia quando:

- pertence ao tenant autenticado;
- esta ativo;
- possui WhatsApp valido;
- possui permissao de comunicacao compativel;
- nao foi excluido manualmente da acao;
- nao aparece duplicado na audiencia.

## Simulacao e congelamento

A simulacao e dinamica e pode mudar enquanto os clientes sao atualizados. Ao preparar a Acao Comercial, os destinatarios elegiveis sao congelados em um snapshot. Alteracoes posteriores no cadastro nao acrescentam novos clientes silenciosamente.

## Evolucao

Classificacoes como `Ativo`, `EmRisco`, `Inativo`, `Recuperado`, `AltoTicket` e `QuedaDeFrequencia` so serao implementadas depois que existir uma fonte confiavel de movimentacoes e regras aprovadas.
