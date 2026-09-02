# Relacionamento pelo WhatsApp Web

## Objetivo

Permitir que a equipe use o WhatsApp oficial da loja sem automação e sem sair do fluxo comercial do CRM.

## Experiência da Versão 1.0

1. o gerente aprova a mensagem e prepara a audiência;
2. a operadora escolhe uma pessoa da fila;
3. o CRM mostra telefone e texto final congelado;
4. `Abrir WhatsApp` abre a conversa em uma janela auxiliar oficial;
5. se necessário, o próprio WhatsApp solicita vínculo por QR Code;
6. a operadora envia a mensagem no WhatsApp;
7. ao voltar ao CRM, confirma `Sim, eu enviei`;
8. depois registra o resultado comercial.

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
