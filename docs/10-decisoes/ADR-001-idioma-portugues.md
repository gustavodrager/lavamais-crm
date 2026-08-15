# ADR-001 — Portugues como idioma padrao

- Status: aceito
- Data: 2026-08-15

## Contexto

O produto, seus usuarios e sua equipe principal utilizam portugues. Misturar idiomas no dominio aumenta ambiguidade e dificulta manter o mesmo vocabulario entre negocio, documentacao e codigo.

## Decisao

Usar portugues em dominio, variaveis, metodos, testes, banco, JSON, rotas, logs, documentacao e commits. Identificadores nao usam acentos.

Termos impostos por linguagens, frameworks, protocolos ou contratos externos permanecem como definidos pela origem.

## Consequencias

- maior correspondencia entre negocio e implementacao;
- adaptadores devem traduzir contratos externos;
- revisoes devem rejeitar mistura desnecessaria de idiomas;
- arquivos tecnicos padrao, como `README.md` e `Dockerfile`, preservam seus nomes convencionais.
