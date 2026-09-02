# Curto Prazo

## Base da Versao 1.0 fechada

- clientes, catalogo, mensagens e Acoes Comerciais;
- Movimentacoes Comerciais e historico do cliente;
- roteiro diario manual para coletas e entregas;
- paineis gerencial e operacional por perfil;
- documentacao tecnica e testes automatizados no repositorio.

## Prioridade 1 — homologacao da implantacao inicial

- validar clientes, catalogo, etiquetas e modelos com a operacao;
- validar atendimento, historico e roteiro diario com Gerente e Operador;
- realizar carga autorizada em homologacao;
- validar primeiro acesso e continuidade das sessoes depois de reinicios;
- concluir dominio, DNS, alertas e responsaveis operacionais;
- ensaiar restauracao no provedor e definir RPO e RTO;
- homologar instancia, credenciais e webhook do WhatsMiau antes de ativar o Worker e o envio individual;
- manter o adaptador da Central de Notificacao coberto por teste de contrato para a migracao futura.

## Prioridade 2 — seguranca, dados e continuidade

- manter a matriz de prontidao atualizada por capacidade;
- registrar contratos e variaveis novas junto da implementacao;
- impedir dados pessoais em logs, fixtures e arquivos versionados;
- validar cada nova migration em banco PostgreSQL real.
- completar a matriz de eventos de auditoria;
- aprovar politica de retencao, direitos do titular e responsabilidades LGPD;
- ensaiar restauracao, aprovar RPO e RTO e configurar alertas.

## Fase posterior — exige novo fechamento de escopo

- metas e relatorios comerciais avancados;
- classificacao comportamental de clientes e alertas de inatividade;
- solicitacoes de delivery e automacoes de relacionamento;
- perfil de leitura da Franqueadora;
- Luna como assistente contextual.
