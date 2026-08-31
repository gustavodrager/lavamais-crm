# Bloqueios de Producao

Producao nao recebe aplicacao nem dados empresariais enquanto qualquer bloqueio abaixo estiver aberto.

## Seguranca e acesso

- [ ] segredos exclusivos de producao provisionados;
- [ ] primeiro administrador e recuperacao controlada definidos;
- [ ] sessoes persistentes validadas depois de reinicios;
- [ ] papeis e isolamento de tenant validados;
- [ ] dominio definitivo e acesso operacional controlado.

## Dados e recuperacao

- [ ] politica de dados pessoais e retencao aprovada;
- [ ] PITR confirmado;
- [ ] restauracao isolada ensaiada;
- [ ] RPO e RTO aprovados;
- [ ] procedimento de incidente e responsaveis definidos.

## Comunicacao

- [ ] WhatsMiau autenticado e idempotencia do CRM homologada;
- [ ] instancia, chave e segredo de webhook exclusivos provisionados;
- [ ] modelos, parametros e uso de `sendText` aprovados;
- [ ] envio individual homologado com destinatario autorizado;
- [ ] Worker liberado formalmente para iniciar.

## Produto e operacao

- [ ] carga real validada em homologacao;
- [ ] jornada principal aprovada pela LavaMais;
- [ ] criterios de sucesso definidos;
- [ ] equipe treinada;
- [ ] checklists de implantacao e rollback ensaiados.
