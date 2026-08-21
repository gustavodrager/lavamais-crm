# Modulo de Importacoes

O modulo recebe arquivos CSV UTF-8 de ate 10 MB para inclusao inicial de clientes. O fluxo possui duas etapas: pre-visualizacao com uma amostra de ate 20 linhas e confirmacao com relatorio persistido por linha.

O mapeamento exige as colunas de nome e WhatsApp. Email, bairro, cidade, tipo, permissao de marketing por WhatsApp, `codigoExterno` e `dataCadastroOrigem` sao opcionais. O importador aceita virgula ou ponto e virgula, aplica DDD padrao quando configurado e respeita campos entre aspas.

Na confirmacao, cada cliente e incluido ou atualizado pelo contrato de aplicacao do modulo `Clientes`; o modulo `Importacoes` nao acessa seu contexto ou suas tabelas. A atualizacao e idempotente por `codigoExterno` ou WhatsApp normalizado. Linhas invalidas e correspondencias ambiguas sao rejeitadas individualmente.

O conteudo do arquivo fica persistido no PostgreSQL, isolado por tenant, somente entre a pre-visualizacao e a confirmacao. Depois do processamento, o conteudo e removido e permanecem nome, totais e relatorio por linha. A expiracao de pre-visualizacoes nunca confirmadas permanece uma decisao controlada de implantacao.
