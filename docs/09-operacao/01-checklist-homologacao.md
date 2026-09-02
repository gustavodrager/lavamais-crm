# Checklist de Homologacao

## Antes do deploy

- [ ] confirmar commit, artefatos e ambiente `Homologacao`;
- [ ] confirmar que nenhuma alteracao local ficou fora do commit;
- [ ] validar pipelines de backend e frontend;
- [ ] revisar migrations novas e scripts PostgreSQL numerados;
- [ ] confirmar backup ou ponto de restauracao anterior quando houver dados;
- [ ] validar variaveis conforme `docs/07-tecnico/configuracao`;
- [ ] manter `Notificacoes__Modo=Desabilitado` e Worker com zero replicas enquanto o WhatsMiau nao estiver homologado;
- [ ] antes de habilitar `Local`, configurar os mesmos valores na API e no Worker e cadastrar o webhook com segredo exclusivo.

## Banco

- [ ] executar o Migrador uma unica vez;
- [ ] aplicar scripts de `infraestrutura/postgresql/` em ordem numerica;
- [ ] registrar commit, horario UTC, ambiente, executor e resultado;
- [ ] confirmar schemas e historicos de migrations esperados;
- [ ] nao carregar dados antes de validar o schema.

## Aplicacoes

- [ ] publicar API e validar `/saude/vivo` e `/saude/pronto`;
- [ ] publicar Web/BFF e validar pagina de entrada;
- [ ] validar os cabecalhos de seguranca do Web/BFF e a ausencia de `X-Powered-By`;
- [ ] validar primeiro acesso ou login existente;
- [ ] reiniciar Web/BFF e confirmar continuidade da sessao;
- [ ] validar isolamento de tenant e papeis;
- [ ] executar fluxo de clientes, importacao, catalogo, modelos e audiencia preparada;
- [ ] registrar, consultar e cancelar uma Movimentacao Comercial conforme o perfil;
- [ ] organizar, publicar e executar um roteiro diario manual;
- [ ] com o modo local liberado, enviar para destinatario autorizado e confirmar `Enviado`, `Entregue` e `Lido`;
- [ ] repetir a chave de idempotencia e confirmar uma unica chamada efetiva;

## Evidencias

- [ ] registrar versoes implantadas e URLs;
- [ ] registrar resultados sem copiar tokens ou dados pessoais;
- [ ] atualizar a matriz de prontidao;
- [ ] abrir pendencias com responsavel e criterio de conclusao.

Antes de usar credenciais, executar a verificacao publica e somente leitura:

```bash
scripts/homologacao/verificar-superficie-publica.sh \
  https://lavamais-crm-api-homologacao.up.railway.app \
  https://lavamais-crm-web-homologacao.up.railway.app
```
