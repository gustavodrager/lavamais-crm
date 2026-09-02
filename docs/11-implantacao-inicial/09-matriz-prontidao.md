# Matriz de Prontidao da Versao 1.0

Atualizada em 2 de setembro de 2026. `Concluido` representa implementacao, documentacao e testes no repositorio; nao significa liberacao para producao.

| Capacidade | Backend | Frontend | Testes | Homologacao | Producao |
|---|---|---|---|---|---|
| Identidade local e sessao BFF | Concluido | Concluido | Concluido | Tres perfis ativados e autenticados | Bloqueada |
| Autorizacao e tenant | Concluido | Aplicado | Concluido | Papeis validados; isolamento entre tenants pendente | Bloqueada |
| Clientes e etiquetas | Concluido | Concluido | Concluido | Clientes validados; etiquetas sem ensaio de escrita | Bloqueada |
| Importacao CSV | Concluido | Concluido | Concluido | Pendente de carga autorizada | Bloqueada |
| Catalogo | Concluido | Concluido | Concluido | Catalogos disponiveis; escrita administrativa nao exercitada | Bloqueada |
| Modelos de mensagem | Concluido | Concluido | Concluido | Um modelo publicado validado | Bloqueada |
| Rascunho e segmentacao | Concluido | Concluido | Concluido | Audiencia manual controlada validada | Bloqueada |
| Preparacao da audiencia | Concluido | Concluido | Concluido | Validada com dois destinatarios autorizados | Bloqueada |
| Envio individual e outbox | Concluido | Concluido | Concluido | Desabilitado por configuracao | Bloqueada |
| Reconciliacao pelo Worker | Concluido | Acompanhamento concluido | Concluido | Worker com zero replicas | Bloqueada |
| Resultado comercial | Concluido | Concluido | Concluido | Pendente de validacao operacional | Bloqueada |
| Movimentacoes comerciais manuais | Concluido | Concluido | Concluido | Registro e consulta validados; cancelamento nao executado | Bloqueada |
| Historico comercial do cliente | Concluido | Concluido | Concluido | Validado com dados controlados | Bloqueada |
| Roteiro diario manual | Concluido | Concluido | Concluido | Inclusao, publicacao e execucao validadas com duas paradas controladas; aceite operacional pendente | Bloqueada |
| Paineis gerencial e operacional | Consultas concluidas | Concluido | Concluido | Validado nos tres perfis | Bloqueada |
| Auditoria | Parcial | Sem tela dedicada | Parcial | API e protecao publicadas; consulta administrativa pendente | Bloqueada |
| Backup e restauracao | Scripts validados localmente | Nao se aplica | Prova local concluida | Ensaio no provedor pendente | Bloqueada |
| Observabilidade e alertas | Fundacao concluida | Nao se aplica | Parcial | Alertas pendentes | Bloqueada |
| Escopo e documentacao da Versao 1.0 | Concluido | Concluido | Verificacoes locais concluidas | Pronta para revisao | Bloqueada |

## Criterio para alterar status

- `Concluido`: implementacao, documentacao e testes relevantes passam;
- `Parcial`: parte do fluxo foi validada, mas existe dependencia ou evidencia pendente;
- `Disponivel para homologacao`: deploy existe e o fluxo pode ser validado com dados controlados;
- `Bloqueada`: pelo menos um item de `08-bloqueios-producao.md` impede liberacao.
