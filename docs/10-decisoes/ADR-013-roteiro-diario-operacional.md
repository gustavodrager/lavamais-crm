# ADR-013 — Roteiro diario operacional

- Status: aceito
- Data: 2026-08-25
- Complementa: ADR-005

## Contexto

A LavaMais possui inicialmente um motorista que realiza coletas e entregas sem uma sequencia compartilhada. A recepcao organiza essas atividades e precisa publicar um roteiro simples para consulta no celular e impressao.

## Decisao

Adicionar o modulo isolado `Roteiros`, como extensao operacional controlada. Um roteiro pertence a uma data e possui nome do motorista, situacao e paradas ordenadas. Cada parada congela nome, telefone e endereco do cliente e registra tipo (`Coleta` ou `Entrega`), periodo, observacao e situacao.

A recepcao organiza e publica. Qualquer usuario ativo autenticado pode consultar e executar o roteiro no celular. Nesta etapa nao existem GPS, rastreamento continuo, calculo de transito, otimizacao automatica, prova de entrega, controle de pedido ou integracao com o Essence.

## Consequencias

- o modulo nao acessa diretamente o banco de clientes e usa contrato de aplicacao;
- a ordenacao e manual e previsivel;
- a estrutura aceita identificar um motorista por roteiro, permitindo evolucao futura para varios roteiros no mesmo dia mediante nova decisao e migration;
- dados pessoais exibidos ficam limitados ao necessario para realizar a parada.
