# Modulo de Acoes Comerciais

Nesta fatia, o modulo mantem rascunhos vinculados a um item ativo do catalogo e, opcionalmente, a uma versao publicada de modelo. Os criterios de publico sao tipados, versionados e persistidos em `jsonb`.

A simulacao e paginada e reavalia clientes pelo modulo `Segmentacao`. A preparacao reavalia a elegibilidade em uma transacao repetivel, congela destinatarios e snapshots, impede novas edicoes e registra auditoria atomicamente. Envio e resultado pertencem as fatias seguintes.
