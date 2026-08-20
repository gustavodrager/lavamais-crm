# ADR-007 — PostgreSQL inicial no Railway

- Status: aceito
- Data: 2026-08-20

## Contexto

O CRM precisa de bancos remotos separados para homologacao e producao. A LavaMais ja possui um plano ativo no Railway, enquanto a hospedagem da API, do Worker e do frontend ainda sera definida.

Dados reais de clientes exigem isolamento entre ambientes, credenciais exclusivas, rede privada, migrations controladas e uma politica de backup validada antes da entrada em producao.

## Decisao

Usar o projeto Railway `lavamais-crm` para o PostgreSQL inicial do CRM, com os ambientes permanentes `homologacao` e `production`.

Os dois ambientes usam o mesmo servico logico `Postgres`, mas cada ambiente possui:

- instancia de execucao propria;
- volume persistente proprio;
- credenciais geradas de forma independente;
- rede privada do Railway;
- ciclo de deploy independente.

Nao habilitar proxy TCP publico para administracao do banco. A API e o Worker devem consumir a conexao privada fornecida pelo Railway quando forem implantados no mesmo projeto ou em uma topologia privada compativel.

Migrations continuam sendo uma etapa unica e controlada do deploy. Nenhuma migration ou carga de clientes deve ser executada automaticamente no startup da aplicacao.

O ambiente `production` permanece sem dados empresariais ate que backup, retencao, restauracao, RPO, RTO, segredos, autorizacao e checklist de implantacao estejam validados. O backup continuo do Railway nao foi habilitado nesta decisao.

## Consequencias

- homologacao pode receber migrations e cargas de validacao sem compartilhar dados com producao;
- credenciais e URLs de conexao nao sao versionadas;
- a escolha de hospedagem da API, do Worker e do frontend permanece pendente;
- backup continuo ou snapshots agendados precisam de avaliacao de custo e de um ensaio de restauracao antes do uso de producao;
- qualquer exposicao publica do PostgreSQL exige nova avaliacao de seguranca;
- mudanca de provedor ou topologia deve ser registrada em outro ADR.
