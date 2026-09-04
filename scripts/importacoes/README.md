# Normalização das exportações do Essence

O normalizador converte os quatro relatórios XLSX validados em `clientes.csv`, `movimentacoes.csv` e `produtos.csv`, contratos já aceitos pelo `LavaMais.Crm.ImportadorEssence`.

Ele não altera as planilhas, não acessa o banco e não presume consentimento. Clientes com telefone ausente, múltiplo ou compartilhado são excluídos da carga automática e relacionados, somente pelo código externo, em `normalizacao.json`.

```bash
python3 -m pip install -r scripts/importacoes/requirements.txt
python3 scripts/importacoes/normalizar-exportacoes-essence.py \
  --movimentacoes <rel_movi.xlsx> \
  --itens <rel_item.xlsx> \
  --historico <tickets_em_saida.xlsx> \
  --produtos <rank_produtos.xlsx> \
  --saida <diretorio-seguro>
```

Depois, execute o importador sem `--confirmar` e revise os dois relatórios JSON. Os CSVs e relatórios contêm dados pessoais e não devem ser versionados.
