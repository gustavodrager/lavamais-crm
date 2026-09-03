# Prontidao para Go-live

Este documento separa o que esta implementado no repositorio do que depende de confirmacao operacional. A topologia remota observada em 2026-09-03 esta registrada em `evidencias/2026-09-03-topologia-railway.md`.

## Configuracao segura e rotacao

**Implementado no repositorio:** `appsettings` nao contem nomes, telefones, tenant operacional ou identificadores Railway; producao e homologacao falham ao iniciar sem banco, `AllowedHosts`, tenant e administrador inicial validos; OpenAPI nao e publicado em producao; o BFF exige URL publica HTTPS e usa cookie `__Host-`, `HttpOnly`, `Secure`, `SameSite=Lax`, validade alinhada a sessao e conteudo cifrado com AES-256-GCM.

Variaveis obrigatorias da API, fornecidas pelo secret store:

```text
DATABASE_URL
AllowedHosts
IdentidadeLocal__Habilitada=true
IdentidadeLocal__TenantId
IdentidadeLocal__NomeTenant
IdentidadeLocal__UsuariosIniciais__0__Telefone
IdentidadeLocal__UsuariosIniciais__0__Nome
IdentidadeLocal__UsuariosIniciais__0__Papel=Administrador
```

Variaveis obrigatorias do Web/BFF:

```text
LAVAMAIS_CRM_API_URL
LAVAMAIS_URL_APLICACAO=https://<dominio-publico>
LAVAMAIS_SESSOES_DATABASE_URL
LAVAMAIS_CHAVE_CRIPTOGRAFIA_SESSAO
```

A chave de sessao deve conter 32 bytes aleatorios codificados em Base64. A rotacao invalida sessoes BFF: crie a nova chave no secret store, programe uma janela curta, publique somente o Web/BFF, confirme novo login e revogue sessoes antigas da API. Nao registre a chave em ticket, log ou evidencia.

Os dados de bootstrap anteriormente rastreados devem ser tratados como expostos. Antes do go-live: substituir valores no secret store, permitir somente usuarios autorizados, invalidar senhas/sessoes anteriores e registrar responsavel, horario UTC e resultado sem copiar PII. Reescrever o historico Git e uma decisao separada e disruptiva, nao executada nesta preparacao.

## Banco, backup e recuperacao

**Implementado e validado localmente:** dump custom do PostgreSQL sem owner/ACL, validacao por `pg_restore --list`, checksum SHA-256 e restauracao recusada sem checksum ou confirmacao literal do banco alvo. Em 2026-09-03, PostgreSQL 17 descartavel recebeu todas as migrations, teve backup restaurado em outro banco e aceitou a reaplicacao idempotente do Migrador.

Conexao remota usa `LAVAMAIS_POSTGRES_URL` no backup e `LAVAMAIS_POSTGRES_URL_DESTINO` na restauracao. Nunca use o banco de origem como destino do ensaio.

**A validar no Railway:** a CLI informa PITR habilitado e bucket conectado em producao e homologacao, mas nao conseguiu verificar ao vivo a cobertura nem o arquivador por falta de vinculacao SSH. Permanecem sem prova: janela, retencao, ultimo ponto consistente, criptografia, restauracao isolada, limites de conexao e compatibilidade das ferramentas. RPO/RTO nao estao comprovados. Proposta para aprovacao: RPO de 24 horas com dump diario independente enquanto PITR nao for confirmado e RTO de 4 horas, ambos condicionados a ensaio remoto cronometrado.

## Topologia Railway

**Confirmada em leitura em 2026-09-03:** producao possui somente PostgreSQL online e bucket de PITR; homologacao possui API e Web/BFF online, Migrador concluido, PostgreSQL online e worker offline. A evidencia datada contem IDs, dominios, volume e limitacoes. Nenhum recurso remoto foi alterado.

Registrar evidencia datada com servico, ambiente, commit/artefato, dominio, porta, comando inicial, health check, dependencias, rede, restart e responsavel. O Migrador deve ser tarefa de execucao unica.

## Seguranca entre componentes

- Navegador -> Web/BFF: HTTPS obrigatorio e HSTS.
- Web/BFF -> API: confirmar rede privada ou HTTPS e evitar exposicao publica desnecessaria.
- API -> PostgreSQL: confirmar TLS no endpoint; `DATABASE_URL` sozinho nao prova transporte seguro.
- CORS: nao e necessario no desenho atual porque o navegador chama o BFF. Se a API for chamada pelo navegador, criar lista explicita, nunca curinga.
- Rate limit: login tem limite local por instancia. **A validar:** multiplas replicas e protecao de borda.
- `/saude/vivo` verifica processo; `/saude/pronto`, PostgreSQL. Prontidao nao prova o fluxo funcional.

## Auditoria e LGPD

**Implementado:** Acoes Comerciais, Roteiros, Clientes, Movimentacoes Comerciais, Importacoes, Catalogo, Modelos, Autorizacao e Identidade auditam suas escritas criticas no mesmo commit transacional. A cobertura inclui primeiro acesso, criacao e revogacao de sessao, papeis, importacoes, catalogo, publicacao de modelos, consentimento, movimentacoes, roteiros e ciclo das acoes comerciais. Os metadados usam IDs, contadores, estados e classificacoes controladas; nao armazenam nome, telefone, endereco, texto de mensagem, CSV, observacao ou motivo livre.

Os testes de integracao exercitam persistencia da auditoria nos fluxos criticos e verificam ausencia de PII conhecida nos metadados. Log HTTP continua nao sendo tratado como substituto da auditoria de negocio.

Tambem dependem de aprovacao: origem, base legal, minimizacao, retencao e descarte dos dados reais.

## Contrato, qualidade e observabilidade

**Implementado:** `contratos/web-api.json` declara operacoes consumidas pelo Web/BFF e uma checagem falha se alguma desaparecer do OpenAPI. Ela cobre metodo/rota, nao compatibilidade completa dos schemas Zod. Logs JSON, `CorrelationId`, caminho sem query, metricas HTTP, `ActivitySource` e health checks estao preparados.

**Validado localmente:** build e 70 testes .NET, 76 testes Vitest, build Next.js, 15 cenarios Playwright desktop, contrato com 45 operacoes, inicializacao da API em `Production`, migrations em PostgreSQL 17 descartavel e restauracao completa. **A validar:** CI remoto verde, smoke autenticado remoto, coletor/exportador, destino, retencao, painel, traces e alertas. Criterios propostos: prontidao falha por 2 minutos; HTTP 5xx acima de 2% por 5 minutos com ao menos 10 requisicoes; p95 acima de 2 segundos por 10 minutos; falha/ausencia do backup diario; crescimento anormal de 401/429.

## Sequencia exata de go-live

1. Fechar LGPD, backup remoto, RPO/RTO e observabilidade; a auditoria minima ja esta implementada localmente.
2. Reconferir na janela a topologia Railway registrada em `evidencias/2026-09-03-topologia-railway.md`.
3. Congelar commit candidato; exigir CI verde e hashes dos artefatos.
4. Provisionar segredos exclusivos e verificar que logs nao os exibem.
5. Criar backup, validar checksum e ensaiar restauracao isolada cronometrada.
6. Bloquear cargas/importacoes e escritas durante mudanca de schema.
7. Executar o Migrador uma unica vez e registrar resultado.
8. Publicar API; validar saude, logs e ausencia de OpenAPI publico.
9. Publicar Web/BFF do mesmo commit; validar HTTPS, HSTS, login, cookie e sessao apos reinicio controlado.
10. Fazer smoke controlado: cliente, etiqueta, movimentacao, roteiro, acao individual, abertura e confirmacao manual autorizada.
11. Conferir perfis, tenant, auditoria e ausencia de envio coletivo/automatico.
12. Observar pela janela aprovada e registrar liberacao ou rollback.

Rollback: preferir artefato anterior compativel com o schema. Diante de perda/corrupcao, congelar escritas, preservar evidencias, restaurar isoladamente, validar integridade e so entao decidir a troca. Nao executar migration descendente automaticamente.
