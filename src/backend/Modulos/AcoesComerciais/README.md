# Módulo Ações Comerciais

Cria rascunhos, simula e congela a audiência, renderiza a mensagem aprovada e conduz o atendimento individual.

Cada destinatário possui apenas os estados `Pendente` e `Enviado`. Abrir a conversa registra `ConversaWhatsappAberta` sem mudar o destinatário. A confirmação explícita depois do envio no WhatsApp registra `EnvioWhatsappConfirmadoManualmente`, usuário e horário. A primeira confirmação inicia o processamento; a ação conclui quando todos os destinatários foram confirmados.

Não existe envio coletivo, provedor, outbox, Worker, entrega ou leitura técnica. O resultado comercial só pode ser informado depois de `Enviado` e é auditado sem criar pedido ou faturamento.
