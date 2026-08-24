# ADR-010 — Homologacao incremental sem as centrais

- Status: aceito
- Data: 2026-08-24

## Contexto

A Central de Identidade e a Central de Notificacao ainda nao estao disponiveis para o LavaMais CRM. O nucleo do produto precisa ser validado antes dessas integracoes: clientes, importacao, catalogo, modelos, Acao Comercial, segmentacao e preparacao da audiencia.

Criar servicos simulados completos aumentaria a complexidade desta fase e desviaria a validacao do dominio principal.

## Decisao

- o ambiente `Homologacao` pode usar uma identidade tecnica fixa, configurada exclusivamente no servidor;
- o tenant, o identificador do usuario e o papel nunca sao recebidos do navegador;
- o modo falha na inicializacao quando ativado em qualquer ambiente diferente de `Homologacao`;
- o BFF nao apresenta login enquanto esse modo estiver ativo;
- o envio individual permanece indisponivel na interface e o Worker permanece desligado;
- o endpoint de envio responde `503` sem alterar estado nem gravar outbox enquanto o envio estiver desabilitado;
- nenhuma notificacao simulada ou real e criada nesta etapa;
- a API, a outbox e os contratos definitivos das centrais permanecem preservados para a integracao posterior.

## Consequencias

- a homologacao valida o fluxo somente ate a audiencia preparada;
- o endereco de homologacao nao deve receber dados pessoais ou empresariais sem controle operacional de acesso;
- a autorizacao local baseada no banco nao e exercitada enquanto a identidade tecnica estiver ativa;
- antes da producao, o modo precisa ser desabilitado e substituido pela Central de Identidade;
- o Worker somente pode ser ativado depois da integracao segura com a Central de Notificacao.
