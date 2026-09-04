# Migrations e Scripts PostgreSQL

## Responsabilidades

- migrations EF pertencem ao modulo que possui o schema;
- `LavaMais.Crm.Migrador` aplica migrations do backend;
- scripts em `infraestrutura/postgresql/` pertencem ao schema tecnico do BFF;
- API e Web nao alteram schema no startup;
- apenas um executor aplica mudancas por ambiente.

## Ordem

1. confirmar commit e ambiente;
2. revisar migrations e scripts ainda nao aplicados;
3. confirmar backup ou ponto de restauracao;
4. interromper operacoes incompatíveis, quando necessario;
5. executar o Migrador;
6. aplicar scripts PostgreSQL em ordem numerica;
7. validar schemas, indices e historicos;
8. registrar resultado antes de publicar a aplicacao.

## Registro minimo

- ambiente;
- commit e versao do artefato;
- migration ou script;
- horario UTC de inicio e termino;
- executor responsavel;
- resultado e evidencia sem segredos;
- plano de recuperacao utilizado, se houver falha.

## Regras de seguranca

- migration destrutiva exige plano especifico e ensaio previo;
- nao editar migration ja aplicada para esconder mudanca;
- nao executar comandos contra URL ou banco nao confirmados;
- nao copiar credenciais resolvidas para tickets, logs ou documentacao;
- rollback de aplicacao somente usa versao compativel com o schema atual.

## Carga historica do Essence

O projeto `LavaMais.Crm.ImportadorEssence` executa a carga descrita no ADR-016. Ele nao aplica migrations e nao e iniciado pela aplicacao. Antes da confirmacao:

Quando a origem estiver nos relatorios XLSX validados em setembro de 2026, normalize-os primeiro com a ferramenta controlada. O diretorio de saida deve ser seguro e nao versionado, pois os CSVs contem dados pessoais:

```bash
python3 -m pip install -r scripts/importacoes/requirements.txt
python3 scripts/importacoes/normalizar-exportacoes-essence.py \
  --movimentacoes <rel_movi.xlsx> \
  --itens <rel_item.xlsx> \
  --historico <tickets_em_saida.xlsx> \
  --produtos <rank_produtos.xlsx> \
  --saida <diretorio-seguro>
```

Revise `normalizacao.json` antes da simulacao. Clientes com telefone ausente, multiplo ou compartilhado e identidades com nomes divergentes nao entram na carga automatica. A planilha de itens serve para reconciliar quantidade por ticket; ela nao cria controle de producao. Produtos repetidos no ranking sao consolidados como referencias historicas inativas.

Em seguida use `clientes.csv`, `movimentacoes.csv` e `produtos.csv` gerados pelo normalizador no comando abaixo.

1. normalizar os tres CSVs de clientes, movimentacoes e produtos;
2. executar sem `--confirmar` e revisar o JSON de reconciliacao;
3. confirmar tenant, ambiente e string de conexao;
4. executar o Migrador separadamente e validar que nao existem migrations pendentes;
5. repetir o comando com `--confirmar` apenas em ambiente autorizado;
6. reconciliar contagens, valores, erros e pendencias do JSON final.

Uso:

```bash
dotnet run --project src/backend/LavaMais.Crm.ImportadorEssence -- \
  --operacao CargaHistorica \
  --ambiente Homologacao \
  --tenant-id <uuid> \
  --clientes <clientes.csv> \
  --movimentacoes <movimentacoes.csv> \
  --produtos <produtos.csv> \
  --relatorio <relatorio.json>
```

Adicionar `--confirmar` somente depois da revisao. O executor rejeita o ambiente de producao por contrato e tambem bloqueia execucao quando `RAILWAY_ENVIRONMENT_NAME` identifica producao.

### Composicao sintetica de homologacao

Depois da carga historica reconciliada, a operacao abaixo substitui a oferta tecnica por ate quatro produtos sinteticos por ticket. Ela nao usa o arquivo de clientes, nao altera ticket, cliente, data ou valor total e grava o marcador `[HML SINTETICO]` na observacao:

```bash
dotnet run --project src/backend/LavaMais.Crm.ImportadorEssence -- \
  --operacao ComposicaoSintetica \
  --ambiente Homologacao \
  --tenant-id <uuid> \
  --movimentacoes <movimentacoes.csv> \
  --produtos <produtos.csv> \
  --relatorio <relatorio-composicao.json>
```

Executar primeiro sem `--confirmar`. O relatorio deve reconciliar pecas, linhas e valores planejados. Depois da confirmacao, repetir o mesmo comando para validar que todas as movimentacoes existentes ficam `inalteradas`.

Para restaurar a linha tecnica unica do ADR-016, usar o mesmo CSV de movimentacoes sem o arquivo de produtos:

```bash
dotnet run --project src/backend/LavaMais.Crm.ImportadorEssence -- \
  --operacao ReversaoComposicaoSintetica \
  --ambiente Homologacao \
  --tenant-id <uuid> \
  --movimentacoes <movimentacoes.csv> \
  --relatorio <relatorio-reversao.json>
```

A composicao e a reversao continuam bloqueadas em producao e exigem `--confirmar` para escrever no banco.
