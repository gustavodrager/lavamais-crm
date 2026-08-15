# Modulo de Importacoes

O modulo recebe arquivos CSV UTF-8 de ate 10 MB para inclusao inicial de clientes. O fluxo possui duas etapas: pre-visualizacao com uma amostra de ate 20 linhas e confirmacao com relatorio persistido por linha.

O mapeamento exige as colunas de nome e WhatsApp. Email, bairro, cidade, tipo e permissao de marketing por WhatsApp sao opcionais. Campos entre aspas, virgulas dentro de campos e aspas escapadas sao aceitos.

Na confirmacao, cada cliente e criado pelo contrato de aplicacao do modulo `Clientes`; o modulo `Importacoes` nao acessa seu contexto ou suas tabelas. Linhas invalidas e clientes duplicados sao rejeitados individualmente, sem atualizar cadastros existentes.

O arquivo temporario recebe um identificador aleatorio, fica separado por tenant e e excluido depois da confirmacao. A politica de expiracao para pre-visualizacoes nunca confirmadas permanece uma decisao controlada de implantacao.
