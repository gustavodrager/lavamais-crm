# ADR-021: WhatsApp Web assistido em janela auxiliar

- Status: Aceita
- Data: 2026-09-02
- Substitui: ADR-017
- Substitui parcialmente: ADR-007, quanto ao mecanismo de envio e aos estados técnicos

## Contexto

A LavaMais Praia Grande decidiu usar diretamente o WhatsApp Web da loja na Versão 1.0. O CRM não deve usar WhatsMiau, Evolution API, outro provedor de envio, uma Central de Notificação ou automação de mensagens.

O WhatsApp Web não pode ser incorporado em um `iframe` do CRM. A política de segurança publicada por `web.whatsapp.com` restringe `frame-ancestors` aos próprios domínios do WhatsApp. O CRM também não deve capturar, reproduzir ou armazenar QR Code, cookies, sessão ou conteúdo das conversas.

O recurso oficial Click to Chat aceita telefone e texto previamente preenchido. Ele permite manter a preparação da mensagem no CRM e entregar ao WhatsApp a decisão final de envio.

## Decisão

A Versão 1.0 adota envio assistido, individual e humano:

1. a ação comercial congela cliente, telefone e conteúdo aprovado;
2. a pessoa operadora escolhe um destinatário;
3. o CRM mostra a prévia e abre `https://wa.me/{telefone}?text={mensagem}` em uma janela auxiliar nomeada;
4. o WhatsApp decide se exibe a conversa, a seleção entre aplicativo e Web ou um novo QR Code;
5. a pessoa envia a mensagem dentro do WhatsApp;
6. ao voltar ao CRM, confirma explicitamente `Sim, eu enviei`;
7. somente essa confirmação muda o destinatário de `Pendente` para `Enviado`;
8. o resultado comercial pode ser registrado depois da confirmação.

Se o navegador bloquear a janela auxiliar, o CRM oferece um link equivalente em nova aba. Não existe envio coletivo, automático ou em segundo plano.

## Contrato e estados

Abrir a conversa registra somente auditoria e não altera o estado comercial:

```text
POST /api/v1/acoes-comerciais/{acaoId}/destinatarios/{destinatarioId}/abrir-whatsapp
```

Confirmar o envio registra usuário e horário:

```text
POST /api/v1/acoes-comerciais/{acaoId}/destinatarios/{destinatarioId}/confirmar-envio-whatsapp
```

O corpo contém a versão de concorrência do destinatário:

```json
{
  "versao": 3
}
```

Os únicos estados vigentes são:

```text
Pendente -> Enviado
```

`Enviado` significa apenas que uma pessoa autenticada declarou ter realizado o envio no WhatsApp. O CRM não afirma submissão técnica, entrega, leitura ou resposta e não consulta a conversa.

## Segurança, LGPD e auditoria

- o navegador recebe somente telefone e conteúdo já autorizados para aquele destinatário;
- o link abre exclusivamente o domínio oficial `wa.me`;
- QR Code, cookies e sessão ficam fora do CRM;
- `ConversaWhatsappAberta` registra a tentativa de abertura;
- `EnvioWhatsappConfirmadoManualmente` registra usuário, destinatário e horário;
- telefone e conteúdo não entram em logs técnicos;
- consentimento de WhatsApp continua obrigatório na preparação da audiência;
- concorrência otimista impede confirmações duplicadas;
- resultado comercial exige um envio confirmado;
- a sessão vinculada pode expirar ou ser encerrada pelo WhatsApp sem ação do CRM.

## Remoção da arquitetura anterior

Deixam de fazer parte da aplicação ativa:

- cliente e credenciais de provedor;
- webhook de eventos de mensagem;
- API de capacidades do canal;
- Worker de notificações;
- outbox de mensagens;
- tabela de notificações locais;
- chave técnica de template;
- identificador de provedor, tentativas, falhas e reconciliação;
- estados de fila, entrega e leitura.

Migrations históricas são preservadas para bancos já existentes. Uma migration nova remove as tabelas e colunas obsoletas. Estados históricos `Enviado`, `Entregue` ou `Lido` são preservados apenas como `Enviado`, sem reaproveitar data técnica como confirmação manual. O módulo vazio de migrations de `Integracoes` permanece apenas durante essa transição e não participa da API ou do runtime do CRM.

## Consequências

- a operação mantém controle humano e usa a conta oficial da loja;
- não há custo nem dependência de provedor de mensagens;
- não é possível comprovar automaticamente entrega ou leitura;
- o volume fica limitado ao trabalho individual da equipe;
- a pessoa pode precisar vincular novamente o dispositivo no WhatsApp;
- uma futura WhatsApp Business Platform exigirá nova decisão, consentimento, contratos, templates, idempotência e reconciliação próprios.

## Referências oficiais

- [WhatsApp: como usar o Click to Chat](https://faq.whatsapp.com/5913398998672934)
- [WhatsApp: dispositivos vinculados](https://faq.whatsapp.com/1317564962315842/)
- [WhatsApp Web](https://web.whatsapp.com/)
