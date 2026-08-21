# Operacao do Backend

Este runbook cobre a operacao tecnica inicial da CRM API, do CRM Worker, do BFF e do PostgreSQL. O PostgreSQL remoto inicial esta no projeto Railway `lavamais-crm`, nos ambientes isolados `homologacao` e `production`, conforme ADR-008.

## Implantacao

1. fornecer segredos por variaveis do ambiente, sem arquivos versionados;
2. executar migrations e o script `infraestrutura/postgresql/001-sessoes-web.sql` como etapa unica e controlada antes de liberar a nova versao;
3. iniciar a API e validar `/saude/vivo` e `/saude/pronto`;
4. iniciar uma unica instancia do Worker e confirmar processamento da outbox;
5. executar uma acao de homologacao com destinatario autorizado e conferir idempotencia e reconciliacao.

Em 20 de agosto de 2026, a homologacao foi publicada no Railway com componentes separados. A API responde em `https://lavamais-crm-api-homologacao.up.railway.app` e o BFF em `https://lavamais-crm-web-homologacao.up.railway.app`. O migrador concluiu e encerrou com sucesso. O Worker foi validado contra o banco e mantido com zero replicas ate existir um Notification Hub compativel e credenciado.

O ambiente de producao permanece somente com o PostgreSQL, sem aplicacao e sem dados empresariais. A promocao exige primeiro login OIDC funcional, contrato seguro do Notification Hub e ensaio de restauracao.

Rollback de aplicacao deve reutilizar uma versao compatível com o schema já aplicado. Migrations destrutivas exigem plano específico e backup validado; não se executa `database update` automaticamente no startup.

### Conexao dos componentes no Railway

Para a API e o Worker, criar em cada ambiente uma variavel de referencia `DATABASE_URL=${{Postgres.DATABASE_URL}}`. Usar `ASPNETCORE_ENVIRONMENT=Homologacao` e `DOTNET_ENVIRONMENT=Homologacao` em homologacao; em producao, usar `Production` nos dois componentes.

Para o BFF, criar `LAVAMAIS_SESSOES_DATABASE_URL=${{Postgres.DATABASE_URL}}` e uma chave aleatoria Base64 de 32 bytes em `LAVAMAIS_CHAVE_CRIPTOGRAFIA_SESSAO`. A chave nao pode ser compartilhada entre ambientes ou registrada em logs; sua rotacao encerra as sessoes existentes.

O backend converte a URL do Railway para o formato do Npgsql. Nao copiar a URL resolvida, usuario ou senha para arquivos, comandos, logs ou documentacao. Nao criar `DATABASE_PUBLIC_URL`: a comunicacao deve permanecer na rede privada do projeto.

## Observabilidade

A API gera logs JSON estruturados com `CorrelationId`, método, caminho sem query string, status e duração. Corpos, tokens, chaves e dados pessoais não são registrados. O medidor e a fonte de atividades usam o nome `LavaMais.Crm`, preparados para um exportador OpenTelemetry definido na infraestrutura.

Alertar ao menos para:

- `/saude/pronto` indisponível;
- aumento de respostas 5xx;
- mensagens da outbox sem conclusão ou com lease expirando repetidamente;
- destinatários em estado não final por período superior ao acordado com o Notification Hub;
- falhas recorrentes do ciclo do Worker.

## Backup e restauração

Em 20 de agosto de 2026, as instancias PostgreSQL de `homologacao` e `production` estavam ativas, com volumes e credenciais separados. O PITR do Railway foi habilitado nos dois ambientes, com bucket dedicado e janela esperada de aproximadamente quatro semanas depois da primeira copia-base. A cobertura inicial e o ensaio de restauracao ainda precisam ser confirmados antes de inserir dados empresariais em producao.

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
