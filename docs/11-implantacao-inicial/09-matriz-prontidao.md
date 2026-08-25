# Matriz de Prontidao da Versao 1.0

Atualizada em 24 de agosto de 2026. `Concluido` representa implementacao e testes no repositorio; nao significa liberacao para producao.

| Capacidade | Backend | Frontend | Testes | Homologacao | Producao |
|---|---|---|---|---|---|
| Identidade local e sessao BFF | Concluido | Concluido | Concluido | Parcial | Bloqueada |
| Autorizacao e tenant | Concluido | Aplicado | Concluido | Parcial | Bloqueada |
| Clientes e etiquetas | Concluido | Concluido | Concluido | Pendente de validacao operacional | Bloqueada |
| Importacao CSV | Concluido | Concluido | Concluido | Pendente de carga autorizada | Bloqueada |
| Catalogo | Concluido | Concluido | Concluido | Pendente de dados iniciais | Bloqueada |
| Modelos de mensagem | Concluido | Concluido | Concluido | Pendente de templates aprovados | Bloqueada |
| Rascunho e segmentacao | Concluido | Concluido | Concluido | Pendente de validacao operacional | Bloqueada |
| Preparacao da audiencia | Concluido | Concluido | Concluido | Disponivel para homologacao | Bloqueada |
| Envio individual e outbox | Concluido | Concluido | Concluido | Desabilitado por configuracao | Bloqueada |
| Reconciliacao pelo Worker | Concluido | Acompanhamento concluido | Concluido | Worker com zero replicas | Bloqueada |
| Resultado comercial | Concluido | Concluido | Concluido | Pendente de validacao operacional | Bloqueada |
| Auditoria | Concluido | Sem tela dedicada | Parcial | Pendente de validacao | Bloqueada |
| Movimentacoes comerciais manuais | Em desenvolvimento | Nao iniciado | Pendente | Nao disponivel | Bloqueada |
| Backup e restauracao | Scripts validados localmente | Nao se aplica | Prova local concluida | Ensaio no provedor pendente | Bloqueada |
| Observabilidade e alertas | Fundacao concluida | Nao se aplica | Parcial | Alertas pendentes | Bloqueada |

## Criterio para alterar status

- `Concluido`: implementacao, documentacao e testes relevantes passam;
- `Parcial`: parte do fluxo foi validada, mas existe dependencia ou evidencia pendente;
- `Disponivel para homologacao`: deploy existe e o fluxo pode ser validado com dados controlados;
- `Bloqueada`: pelo menos um item de `08-bloqueios-producao.md` impede liberacao.
