# Relacionamento pelo WhatsApp Web

## Objetivo

Permitir que a equipe use o WhatsApp oficial da loja sem automação e sem sair do fluxo comercial do CRM.

## Experiência da Versão 1.0

1. o administrador gera ou cria a ação e escolhe uma mensagem padrão publicada;
2. o gerente ou administrador aprova a ação e congela a audiência;
3. a operadora escolhe uma pessoa da fila;
4. o CRM mostra telefone e texto final congelado;
5. `Abrir WhatsApp` abre a conversa em uma janela auxiliar oficial;
6. se necessário, o próprio WhatsApp solicita vínculo por QR Code;
7. a operadora envia a mensagem no WhatsApp;
8. ao voltar ao CRM, confirma `Sim, eu enviei`;
9. depois registra o resultado comercial.

O navegador pode bloquear a janela auxiliar. Nesse caso, o CRM oferece o mesmo link em uma nova aba.

## Limite importante

O WhatsApp Web não aceita ser incorporado dentro da tela do CRM. O QR Code, a sessão e as conversas permanecem no domínio do WhatsApp. O CRM não sabe se a mensagem foi entregue ou lida.

`Enviado` significa somente que uma pessoa autenticada confirmou manualmente o envio. A abertura isolada não altera o estado.

## Fora do escopo

- envio automático ou coletivo;
- leitura de conversas;
- comprovação automática de entrega ou leitura;
- armazenamento de QR Code ou sessão;
- WhatsApp Business Platform;
- provedor externo de mensagens.

Consulte o [ADR-021](../10-decisoes/ADR-021-whatsapp-web-assistido.md).

As sugestoes baseadas no historico e a aprovacao das acoes estao no [ADR-022](../10-decisoes/ADR-022-sugestoes-e-aprovacao-de-acoes.md).
