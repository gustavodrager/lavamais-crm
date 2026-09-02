# Rollback e Recuperacao

## Aplicacao

Uma versao pode ser revertida quando continua compativel com o schema aplicado. Confirmar essa compatibilidade antes de promover o artefato anterior.

1. identificar componente, commit, horario UTC e impacto;
2. interromper somente o componente necessario;
3. preservar logs e `CorrelationId` sem dados pessoais;
4. promover a ultima versao compativel;
5. validar saude e fluxo afetado;
6. registrar decisao, executor e resultado.

## Banco

Nao existe rollback automatico de migration em producao.

- preferir correcao aditiva quando os dados permanecem integros;
- usar restauracao somente com alvo, ponto e impacto confirmados;
- ensaiar restauracao em banco isolado antes de substituir qualquer ambiente;
- interromper API e Web quando houver risco de novas escritas;
- conferir auditoria e confirmacoes manuais depois da recuperacao.

## WhatsApp Web e envios

- nao existe processamento em segundo plano para interromper;
- antes de repetir uma mensagem, conferir o estado no CRM e a conversa no WhatsApp com a equipe;
- registrar destinatarios afetados por identificador, sem copiar telefone ou conteudo para o incidente.

## Criterio de encerramento

O incidente termina somente depois de restaurar o servico, validar integridade, registrar a causa e definir acao preventiva com responsavel.
