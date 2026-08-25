# Modulo de Integracoes

Isola efeitos externos do CRM e mantem a outbox transacional usada pelo Worker.

Cada solicitacao individual de envio recebe chave de idempotencia deterministica. O Worker reutiliza essa chave em novas tentativas, controla leases interrompidos e delega ao Notification Hub o envio tecnico, retries de provedor e estados de entrega.

Credenciais externas ficam somente na API ou no Worker. O CRM registra o estado comercial e o identificador da notificacao; o Notification Hub permanece responsavel pelo estado tecnico detalhado.

Enquanto `EnvioNotificacoes__Habilitado=false`, nenhuma mudanca de destinatario ou mensagem de outbox e criada pelo endpoint de envio.
