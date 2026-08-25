# Modulo de Identidade

Autentica localmente o usuario inicial do CRM pelo telefone autorizado e por senha definida no primeiro acesso, conforme o ADR-011.

Senhas sao protegidas com PBKDF2-SHA256 e salt individual. Sessoes usam tokens aleatorios opacos; somente o hash SHA-256, a expiracao e a revogacao sao persistidos no schema `identidade`.

O primeiro acesso pode ser realizado uma unica vez. Login e ativacao possuem limitacao de taxa, e telefone, tenant, usuario e papel sao configurados exclusivamente no servidor.

O modulo nao aceita tenant ou papel enviados pelo navegador como fonte de autorizacao.

Na ativacao, a identidade e o primeiro papel `Administrador` sao persistidos na mesma transacao. Depois disso, o modulo `Autorizacao` e a fonte unica do papel ativo; cada requisicao autenticada consulta essa fonte antes de emitir `papel_crm`. Usuario de identidade inativo ou sem autorizacao ativa nao e autenticado.
