# Modulo de Autorizacao

Mantem os papeis `Administrador`, `Gerente` e `Operador` e aplica as politicas especificas do CRM.

Usuario, tenant e papel sao derivados no servidor a partir da sessao autenticada. Todas as consultas empresariais permanecem filtradas pelo tenant, e recursos pertencentes a outro tenant nao sao revelados.

O modulo preserva o provisionamento controlado de usuarios e papeis. A identidade local vigente esta documentada no modulo `Identidade` e no ADR-011.
