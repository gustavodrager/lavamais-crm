# Regras do WhatsApp Web assistido

## Elegibilidade

- o cliente deve estar ativo;
- o telefone deve estar normalizado e possuir de 10 a 15 dígitos;
- a permissão de comunicação por WhatsApp deve estar ativa;
- o destinatário e a mensagem devem ter sido congelados na preparação da ação.

## Abertura

- somente `Administrador`, `Gerente` e `Operador` ativos podem abrir a conversa;
- a URL usa exclusivamente `https://wa.me/{telefone}?text={mensagem}`;
- o CRM tenta reutilizar uma janela auxiliar nomeada;
- se o popup for bloqueado, oferece nova aba com `noopener noreferrer`;
- a abertura registra auditoria;
- a abertura não muda `Pendente` para `Enviado`.

## Confirmação manual

- a confirmação exige a ação explícita `Sim, eu enviei`;
- o CRM registra usuário, horário, destinatário e ação;
- somente um destinatário é alterado por vez;
- concorrência otimista impede confirmação duplicada;
- `Enviado` não significa entregue ou lido;
- o resultado comercial só pode ser registrado depois da confirmação.

## Sessão e QR Code

- sessão, QR Code e cookies pertencem ao WhatsApp;
- o CRM não tenta criar, ler, renovar ou armazenar a sessão;
- o WhatsApp pode manter o dispositivo vinculado ou solicitar novo vínculo;
- expiração da sessão não deve marcar a mensagem como enviada.

## Segurança e LGPD

- telefone e conteúdo não entram em logs técnicos;
- o tenant vem da sessão autenticada;
- o navegador não recebe chaves externas porque não existem credenciais de provedor;
- não há webhook ou leitura de conversa;
- consentimento revogado exclui o cliente de novas audiências.
