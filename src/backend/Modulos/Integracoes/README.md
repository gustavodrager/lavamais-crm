# Módulo Integrações

Este módulo não possui runtime ativo.

O `ContextoDeIntegracoes` vazio permanece temporariamente no Migrador para aplicar a migration `RemoverInfraestruturaDeNotificacoesAutomaticas` em bancos que receberam a arquitetura anterior. A migration remove outbox e notificações locais.

A API não referencia este projeto. Depois que todos os ambientes aplicarem a migration e houver uma estratégia de consolidação do histórico, o módulo poderá ser removido por nova decisão controlada.
