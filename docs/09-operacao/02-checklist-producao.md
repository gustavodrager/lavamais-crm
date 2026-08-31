# Checklist de Producao

Produção permanece bloqueada enquanto qualquer item obrigatório estiver aberto.

## Liberacao

- [ ] homologacao operacional aprovada pela LavaMais;
- [ ] dominio e DNS definitivos validados;
- [ ] segredos exclusivos de producao provisionados;
- [ ] primeiro administrador e procedimento de recuperacao controlada definidos;
- [ ] PITR confirmado e restauracao isolada ensaiada;
- [ ] RPO, RTO, retencao e responsaveis aprovados;
- [ ] alertas e procedimento de incidente ativos;
- [ ] politica de dados pessoais e retencao aprovada;
- [ ] adaptador de notificacoes seguro, idempotente e homologado antes de qualquer envio;
- [ ] instancia, modelos, parametros, webhook e credenciais do WhatsMiau aprovados;

## Implantacao

- [ ] bloquear cargas e operacoes concorrentes durante a mudanca de schema;
- [ ] criar ou confirmar ponto de restauracao;
- [ ] executar Migrador uma unica vez;
- [ ] aplicar scripts PostgreSQL numerados;
- [ ] publicar API e validar saude;
- [ ] publicar Web/BFF e validar login;
- [ ] liberar Worker somente depois da API e do canal WhatsApp;
- [ ] iniciar Worker com uma replica;
- [ ] acompanhar logs, outbox e estados sem expor dados pessoais.

## Validacao posterior

- [ ] executar smoke test com dados controlados;
- [ ] confirmar que nenhuma mensagem coletiva pode ser disparada;
- [ ] testar idempotencia com destinatario autorizado;
- [ ] confirmar auditoria e resultado comercial;
- [ ] registrar versao, horario UTC, executor e evidencias;
- [ ] encerrar a janela somente depois da observacao acordada.
