# Hybex e Essence GO Industrial

Status: levantamento preliminar, sem contato com a Hybex e sem acesso ao ambiente da LavaMais.

## Contexto

A LavaMais utiliza o Essence GO Industrial, divulgado publicamente pela Hybex em:

- <https://materiais.hybex.com.br/essence-go-industrial>

O sistema atual pode ser uma futura fonte de clientes, produtos, servicos, pedidos ou movimentacoes.

## O que foi possivel concluir sem acesso

- existe material publico de apresentacao do produto;
- nao foi localizada documentacao publica suficiente de uma API aberta para implementar uma integracao confiavel;
- formatos, campos e limites de exportacao do ambiente real ainda nao foram confirmados;
- qualquer afirmacao sobre endpoints privados ou acesso direto ao banco seria especulativa.

## Decisao atual

A Versao 1.0 nao depende de integracao online com o Essence GO Industrial.

A entrada inicial sera por CSV, com mapeamento e validacao no CRM. Isso permite comecar mesmo sem historico de pedidos e cria um contrato de importacao independente do fornecedor.

## Estrategia de integracao

Ordem de preferencia quando houver autorizacao para acessar o ambiente:

1. exportacao oficial de clientes por CSV;
2. exportacao oficial de produtos, servicos e movimentacoes;
3. API documentada e suportada, se estiver disponivel;
4. processo intermediario controlado, somente se houver mecanismo oficial de exportacao.

Nao usar:

- acesso direto ao banco do fornecedor;
- engenharia reversa de endpoints privados;
- automacao de tela ou scraping como integracao permanente;
- coleta de dados sem autorizacao da LavaMais.

## Informacoes a verificar no primeiro acesso

- quais cadastros podem ser exportados;
- formatos e codificacao dos arquivos;
- identificadores estaveis de cliente, produto, servico e pedido;
- campos de contato e permissao de marketing;
- existencia de data de atualizacao;
- capacidade de exportacao incremental;
- duplicidades e qualidade dos telefones;
- volume total de dados;
- documentacao de API visivel no painel;
- credenciais e escopos separados para integracao.

## Adaptadores previstos

```text
ImportadorDeClientesCsv
ImportadorDeCatalogoCsv        futuro
ImportadorDeMovimentacoesCsv   futuro
ClienteEssenceGoApi            somente se houver API oficial
```

O dominio do CRM nao dependera de nomes ou modelos do fornecedor. Cada adaptador traduz o contrato externo para os contratos internos em portugues.
