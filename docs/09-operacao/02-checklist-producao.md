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
- [ ] conta oficial, estacoes autorizadas, modelos e consentimentos aprovados;
- [ ] vinculacao, revogacao e sessao expirada do WhatsApp Web homologadas;

## Implantacao

- [ ] bloquear cargas e operacoes concorrentes durante a mudanca de schema;
- [ ] criar ou confirmar ponto de restauracao;
- [ ] executar Migrador uma unica vez;
- [ ] aplicar scripts PostgreSQL numerados;
- [ ] publicar API e validar saude;
- [ ] publicar Web/BFF e validar login;
- [ ] confirmar que nenhum servico obsoleto de mensagens esta ativo;
- [ ] acompanhar erros, auditoria e estados sem expor dados pessoais.

## Validacao posterior

- [ ] executar smoke test com dados controlados;
- [ ] confirmar que nenhuma mensagem coletiva pode ser disparada;
- [ ] testar concorrencia da confirmacao com destinatario autorizado;
- [ ] confirmar auditoria e resultado comercial;
- [ ] registrar versao, horario UTC, executor e evidencias;
- [ ] encerrar a janela somente depois da observacao acordada.
