# Carga historica controlada do Essence — 3 de setembro de 2026

## Escopo

- Ambiente: `Homologacao`.
- Tenant: LavaMais Praia Grande, identificado pela configuracao tecnica de homologacao.
- Origem: quatro conjuntos logicos XLSX validados; copias repetidas nao foram processadas.
- Operacao: normalizacao local, simulacao, carga controlada, reversao da composicao sintetica de homologacao e reconciliacao idempotente.
- Producao: nao acessada.

## Normalizacao

- 1.876 codigos de cliente observados.
- 1.725 clientes aptos a carga automatica.
- 151 identidades separadas para conciliacao por telefone ausente, invalido, multiplo, compartilhado ou nome divergente.
- 9.099 movimentacoes observadas.
- 8.377 movimentacoes vinculadas aos clientes aptos.
- 722 movimentacoes ficaram fora da carga automatica junto com as identidades pendentes.
- 11.541 itens usados somente para reconciliacao; nenhuma divergencia de pecas nos tickets relacionados.
- 156 linhas do ranking consolidadas em 155 referencias historicas; `JAQUETA` aparecia repetida apos normalizacao.

## Execucao

O importador foi executado dentro do container da API para usar a rede privada do PostgreSQL. O pacote temporario foi conferido por SHA-256 antes da execucao.

A primeira execucao remota inseriu os registros ausentes. As composicoes sinteticas anteriores, previstas pelo ADR-019 apenas para homologacao, impediam a comparacao idempotente de 3.032 tickets. A operacao oficial `ReversaoComposicaoSintetica` restaurou 3.030 composicoes e manteve 5.342 inalteradas.

Na reconciliacao final:

- clientes: 1.725 recebidos, 1.723 atualizados e 2 rejeitados;
- movimentacoes: 8.377 recebidas, 8.372 reconhecidas como existentes e identicas, 3 sem cliente conciliado e 2 divergentes;
- referencias de produto: 155 recebidas e atualizadas;
- nenhuma nova insercao ocorreu na execucao final, comprovando idempotencia do conjunto conciliado.

## Excecoes para conciliacao manual

Clientes com conflito de WhatsApp:

- `0000002967`;
- `0000003054`.

Movimentacoes dependentes desses clientes:

- ticket `2207`, cliente `0000002967`;
- tickets `2948` e `3506`, cliente `0000003054`.

Tickets existentes com valor/composicao historica diferente da exportacao atual:

- `12105`;
- `12190`.

Nenhuma dessas excecoes foi sobrescrita automaticamente.

## Estado final do tenant

- 1.770 clientes totais, incluindo registros anteriores que nao pertencem ao conjunto normalizado.
- 8.623 movimentacoes com origem `ImportacaoEssence`.
- Valor informativo total das movimentacoes importadas: R$ 715.682,27.
- 155 referencias agregadas do ranking do Essence.

Os 246 movimentos alem dos 8.377 registros do conjunto atual ja existiam na homologacao e nao aparecem nas exportacoes analisadas. Nao foram apagados.

## Controles de seguranca

- Consentimento de marketing nao foi presumido.
- Telefones compartilhados nao foram usados para fusao automatica.
- Dados operacionais de producao nao foram incorporados ao dominio do CRM.
- Arquivos e CSVs com dados pessoais permaneceram temporarios e foram removidos do container apos a reconciliacao.
- Os relatorios versionados registram somente contagens e codigos externos necessarios para conciliacao.
