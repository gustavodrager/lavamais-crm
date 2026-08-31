# Modulo de Roteiros

Organiza manualmente coletas e entregas em um roteiro diario. A interface separa os modos `Organizar` e `Executar`: a recepcao cria, ordena e publica as paradas; o motorista consulta e atualiza a execucao pelo celular. Uma parada em deslocamento sempre tem prioridade sobre as pendentes. Paradas pendentes podem ser adicionadas, editadas, reordenadas ou adiadas durante o dia, sempre com controle de versao e auditoria.

O modulo nao calcula a melhor rota, nao rastreia localizacao e nao controla pedidos, pagamentos, producao ou comprovantes. Dados de cliente entram por contrato de aplicacao e sao congelados na parada. Paradas executadas nao podem ser alteradas.
