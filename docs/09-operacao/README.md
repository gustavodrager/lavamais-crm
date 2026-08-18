# Operacao do Backend

Este runbook cobre a operacao tecnica inicial da CRM API, do CRM Worker e do PostgreSQL. Ele nao substitui a definicao de provedor, responsaveis, retencao, RPO e RTO antes da producao.

## Implantacao

1. fornecer segredos por variaveis do ambiente, sem arquivos versionados;
2. executar migrations como etapa unica e controlada antes de liberar a nova versao;
3. iniciar a API e validar `/saude/vivo` e `/saude/pronto`;
4. iniciar uma unica instancia do Worker e confirmar processamento da outbox;
5. executar uma acao de homologacao com destinatario autorizado e conferir idempotencia e reconciliacao.

Rollback de aplicacao deve reutilizar uma versao compatível com o schema já aplicado. Migrations destrutivas exigem plano específico e backup validado; não se executa `database update` automaticamente no startup.

## Observabilidade

A API gera logs JSON estruturados com `CorrelationId`, método, caminho sem query string, status e duração. Corpos, tokens, chaves e dados pessoais não são registrados. O medidor e a fonte de atividades usam o nome `LavaMais.Crm`, preparados para um exportador OpenTelemetry definido na infraestrutura.

Alertar ao menos para:

- `/saude/pronto` indisponível;
- aumento de respostas 5xx;
- mensagens da outbox sem conclusão ou com lease expirando repetidamente;
- destinatários em estado não final por período superior ao acordado com o Notification Hub;
- falhas recorrentes do ciclo do Worker.

## Backup e restauração

Os scripts usam as variáveis padrão do PostgreSQL (`PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD` e, quando necessário, `PGSSLMODE`). A senha nunca deve ser passada na linha de comando.
O `pg_dump` deve ter versão igual ou superior à do servidor. Em ambiente local conteinerizado, `LAVAMAIS_POSTGRES_CONTAINER` faz os scripts usarem `pg_dump` e `pg_restore` do próprio contêiner, evitando incompatibilidade de versão.

```bash
scripts/backend/criar-backup-postgres.sh lavamais_crm /caminho-seguro/lavamais.dump
scripts/backend/restaurar-backup-postgres.sh lavamais_crm_restaurado /caminho-seguro/lavamais.dump
scripts/backend/testar-backup-restauracao.sh
```

Exemplo conteinerizado: `LAVAMAIS_POSTGRES_CONTAINER=nome-do-container scripts/backend/testar-backup-restauracao.sh`.

O primeiro script cria backup customizado, restringe o arquivo ao usuário e valida o catálogo. A restauração usa `--clean` e é destrutiva para objetos existentes no banco de destino; deve ser executada primeiro em banco isolado. O teste cria dois bancos temporários com nomes exclusivos, valida o conteúdo restaurado e os remove ao terminar.

Em 18 de agosto de 2026, o teste foi executado com PostgreSQL 17 em contêiner isolado: o catálogo do backup foi validado, o conteúdo foi restaurado e conferido, e os bancos temporários foram removidos. Essa prova técnica não substitui o ensaio no provedor e com a política de retenção de produção.

Antes da produção ainda é obrigatório definir e testar com o provedor: agenda, retenção, criptografia, cópia externa, monitoramento, RPO, RTO e procedimento de recuperação completa.

## Incidentes

1. preservar `CorrelationId`, horário UTC, versão e tenant afetado, sem copiar tokens ou dados pessoais;
2. interromper apenas o componente necessário; parar o Worker não remove mensagens da outbox;
3. confirmar banco e tenant antes de qualquer correção de dados;
4. registrar ações e responsáveis;
5. em suspeita de vazamento, revogar credenciais envolvidas e seguir o procedimento jurídico e operacional de resposta a incidente.
