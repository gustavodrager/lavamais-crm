# Modulo de Auditoria

Registra eventos sensiveis de forma imutavel e isolada por tenant. A preparacao de uma acao comercial grava seu evento na mesma transacao PostgreSQL que congela a audiencia.

Os registros guardam identificadores e dados operacionais controlados; contatos e conteudos completos nao sao copiados para a auditoria.
