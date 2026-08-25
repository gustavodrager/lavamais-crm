# Modulo de Autorizacao

Mantem os papeis `Administrador`, `Gerente` e `Operador` e aplica as politicas especificas do CRM.

Usuario, tenant e papel sao derivados no servidor a partir da sessao autenticada. Todas as consultas empresariais permanecem filtradas pelo tenant, e recursos pertencentes a outro tenant nao sao revelados.

Este modulo e a fonte unica do papel e da situacao de acesso. A identidade local valida a credencial e a sessao, mas resolve `papel_crm` neste modulo em cada requisicao. Inativacao e alteracao de papel produzem efeito sobre sessoes ja emitidas.

O modulo preserva o provisionamento controlado de usuarios e papeis. A identidade local vigente esta documentada no modulo `Identidade` e no ADR-011.
