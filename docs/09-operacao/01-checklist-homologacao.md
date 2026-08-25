# Checklist de Homologacao

## Antes do deploy

- [ ] confirmar commit, artefatos e ambiente `Homologacao`;
- [ ] confirmar que nenhuma alteracao local ficou fora do commit;
- [ ] validar pipelines de backend e frontend;
- [ ] revisar migrations novas e scripts PostgreSQL numerados;
- [ ] confirmar backup ou ponto de restauracao anterior quando houver dados;
- [ ] validar variaveis conforme `docs/07-tecnico/configuracao`;
- [ ] manter `EnvioNotificacoes__Habilitado=false` e Worker com zero replicas enquanto o Hub nao estiver liberado.

## Banco

- [ ] executar o Migrador uma unica vez;
- [ ] aplicar scripts de `infraestrutura/postgresql/` em ordem numerica;
- [ ] registrar commit, horario UTC, ambiente, executor e resultado;
- [ ] confirmar schemas e historicos de migrations esperados;
- [ ] nao carregar dados antes de validar o schema.

## Aplicacoes

- [ ] publicar API e validar `/saude/vivo` e `/saude/pronto`;
- [ ] publicar Web/BFF e validar pagina de entrada;
- [ ] validar primeiro acesso ou login existente;
- [ ] reiniciar Web/BFF e confirmar continuidade da sessao;
- [ ] validar isolamento de tenant e papeis;
- [ ] executar fluxo de clientes, importacao, catalogo, modelos e audiencia preparada;
- [ ] validar a capacidade de movimentacoes comerciais quando a frente do ADR-012 estiver concluida.

## Evidencias

- [ ] registrar versoes implantadas e URLs;
- [ ] registrar resultados sem copiar tokens ou dados pessoais;
- [ ] atualizar a matriz de prontidao;
- [ ] abrir pendencias com responsavel e criterio de conclusao.
