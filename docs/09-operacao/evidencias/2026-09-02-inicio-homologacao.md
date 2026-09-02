# Inicio da Homologacao — 2 de setembro de 2026

## Escopo da verificacao

Verificacao publica inicial e, depois da ativacao dos perfis, ensaio autenticado com dados controlados. O Worker e o WhatsApp permaneceram desligados.

## Evidencias confirmadas

- projeto Railway `lavamais-crm` e ambiente `homologacao` localizados explicitamente;
- PostgreSQL com uma replica ativa e volume pronto;
- Web/BFF e API com implantacoes ativas;
- Migrador encerrado com sucesso;
- Worker sem implantacao ativa;
- `/saude/vivo` retornou `200` e `Healthy`;
- `/saude/pronto` retornou `200`, com API e PostgreSQL saudaveis;
- pagina publica `/entrar` retornou `200` e apresentou o primeiro acesso;
- rota Web protegida redirecionou visitante sem sessao para `/entrar`;
- endpoints empresariais de clientes, movimentacoes, roteiros e capacidades retornaram `401` sem sessao;
- OpenAPI publicou clientes, Movimentacoes Comerciais, Roteiros e envio individual, sem o comando coletivo removido;
- commit funcional publicado na Web: `2a17bb2`;
- implantacao Web `fa2819e9-93b9-47da-9d14-39f9fd12d47a`, criada em `2026-09-02T13:50:22.542Z`, concluida com `SUCCESS` e instancia `RUNNING`;
- PostgreSQL, Migrador e Worker mantiveram as implantacoes anteriores; o Worker permaneceu sem implantacao;
- `scripts/homologacao/verificar-superficie-publica.sh` concluiu todas as verificacoes sem falhas depois da publicacao.

## Lacuna corrigida e validada remotamente

A implantacao anterior revelava `X-Powered-By` e nao devolvia a politica minima de seguranca do BFF. A Web publicada a partir do commit `2a17bb2` removeu esse cabecalho e passou a devolver CSP, `Cross-Origin-Opener-Policy`, `Permissions-Policy`, `Referrer-Policy`, `X-Content-Type-Options` e `X-Frame-Options`. O verificador remoto confirmou o comportamento em homologacao sem autenticacao e sem escrita de dados.

## Usuarios iniciais de homologacao

- o Gerente foi configurado externamente com o telefone autorizado terminado em `7083`;
- o Operador foi configurado externamente com o telefone corporativo da loja terminado em `5955`;
- nomes, telefones e papeis nao foram gravados no repositorio;
- nenhuma senha foi criada pela equipe tecnica; cada usuario definira sua propria senha no primeiro acesso;
- a API foi reimplantada como `6048893a-4df5-42e0-b871-0afb7c2fbd91`, criada em `2026-09-02T14:33:47.057Z` e concluida com `SUCCESS`;
- depois da reimplantacao, a superficie publica passou novamente sem falhas e o indicador de primeiro acesso retornou `disponivel: true`;
- WhatsApp e Worker permaneceram desligados durante toda a configuracao.

Em seguida, os tres perfis realizaram o primeiro acesso. O encerramento da ativacao foi confirmado sem consultar credenciais: o indicador publico passou a retornar `disponivel: false` e as chamadas autenticadas de Acoes Comerciais e Movimentacoes Comerciais retornaram `200`.

## Destinatarios autorizados para o ensaio de WhatsApp

- Gustavo Drager, com telefone autorizado terminado em `2540`;
- Vanessa Drager, com telefone autorizado terminado em `5526` e cadastro preexistente na base;
- a autorizacao foi informada pelo responsavel do projeto em 2 de setembro de 2026 e se limita a homologacao;
- nenhum numero completo foi registrado nesta evidencia;
- nenhum envio foi realizado: API e Worker ainda nao possuem a instancia, a chave e o segredo de webhook do WhatsMiau.

## Ensaio autenticado do Gerente

- a interface identificou corretamente o papel `Gerente` e exibiu apenas as capacidades desse perfil;
- a busca confirmou que Gustavo ainda nao existia e evitou duplicidade;
- Gustavo foi cadastrado como cliente ativo e autorizado para WhatsApp, sem inventar endereco ou outros dados;
- Vanessa foi localizada no cadastro preexistente, com autorizacao para WhatsApp e telefone valido terminado em `5526`;
- a Movimentacao Comercial `HML-20260902-GD-001` foi registrada para Gustavo com um item de `Toalha de banho - Lavagem`, total informado de `R$ 10,00` e observacao explicita de homologacao sem efeito fiscal, financeiro, de producao ou caixa;
- o detalhe de Gustavo atualizou historico, total, media, ultima movimentacao e servico utilizado;
- foi criado um roteiro em rascunho para `Motorista HML`, sem paradas, e a interface bloqueou corretamente a inclusao de Gustavo por endereco incompleto;
- a Acao Comercial `HML - Ensaio autorizado Gustavo e Vanessa - 02/09/2026` foi criada somente com os dois destinatarios autorizados;
- a audiencia foi congelada com o modelo publicado `LavaMais no seu bairro`, versao 1;
- a fila permaneceu com dois destinatarios pendentes, `0 de 2` mensagens iniciadas e aviso explicito de envio indisponivel;
- nenhum resultado comercial foi inventado ou registrado.

## Ensaio autenticado do Operador

- a interface identificou corretamente o papel `Operador` e restringiu a navegacao a Inicio, Clientes, Atendimentos, Mensagens e Roteiro;
- tentativas de acesso direto a Configuracoes, criacao de Acao Comercial e Importacao foram bloqueadas ou redirecionadas para uma area permitida;
- a Acao Comercial controlada ficou disponivel apenas como fila de execucao, sem comandos de criacao ou cancelamento;
- Gustavo e Vanessa apareceram como os dois destinatarios pendentes, com mensagem personalizada e aviso explicito de envio indisponivel;
- nenhuma mensagem foi iniciada e nenhum resultado comercial foi registrado;
- um atendimento de homologacao foi registrado para Vanessa com um item de `Toalha de banho - Lavagem`, total informado de `R$ 10,00` e observacao explicita de ensaio sem efeito fiscal, financeiro, de producao ou caixa;
- o historico de Vanessa passou a apresentar dois atendimentos, preservando o registro anterior e sem oferecer cancelamento ao Operador;
- no modo Executar, o sistema informou corretamente que o roteiro de 2 de setembro ainda nao havia sido publicado;
- no modo Organizar, o Operador visualizou o rascunho de `Motorista HML` com zero paradas;
- nenhum cliente foi incluido no roteiro, pois os enderecos dos destinatarios autorizados permanecem incompletos.

## Ensaio autenticado do Administrador

- a interface identificou corretamente o papel `Administrador` e exibiu Inicio, Clientes, Atendimentos, Acoes Comerciais, Roteiros, Importacao e Configuracoes;
- o painel consolidou os dois atendimentos controlados do dia, dois clientes e valor total informado de `R$ 20,00`;
- a selecao de experiencia ofereceu as visoes Administrador, Gerente e Operador, sem alterar a identidade autenticada;
- a Importacao apresentou as etapas de arquivo, conferencia e resultado, alem da regra explicita de cadastrar como sem permissao quem nao possuir autorizacao de WhatsApp;
- nenhum arquivo foi enviado e nenhuma carga foi confirmada;
- Configuracoes apresentou catalogo, etiquetas e o canal de WhatsApp como indisponivel; nenhum servico, etiqueta ou carga de catalogo foi criado;
- a biblioteca exibiu um modelo de mensagem publicado e aprovado; nenhum novo modelo foi criado;
- os comandos de cancelamento de atendimento e Acao Comercial ficaram disponiveis ao Administrador, mas nenhum cancelamento foi iniciado;
- a Acao Comercial controlada permaneceu preparada, com dois destinatarios pendentes, zero mensagens iniciadas e nenhum resultado comercial registrado;
- a Auditoria e a administracao de usuarios permanecem disponiveis somente pela API; nao existe tela dedicada e `/auditoria` apresentou `Pagina nao encontrada`;
- a consulta autenticada especifica de Auditoria e Usuarios pela API nao foi executada, pois exigiria expor ou manipular o token opaco mantido exclusivamente no BFF.

Ao final dos ensaios dos tres perfis, `scripts/homologacao/verificar-superficie-publica.sh` passou novamente sem falhas: API e PostgreSQL prontos, contrato publico esperado, endpoints empresariais protegidos, pagina de entrada disponivel e cabecalhos de seguranca ativos.

## Ensaio autenticado do roteiro e correcao em homologacao

- os enderecos autorizados de Gustavo e Vanessa foram completados e conferidos no CRM; nenhum endereco completo foi copiado para esta evidencia;
- a primeira tentativa de incluir Vanessa no roteiro reproduziu uma falha de concorrencia otimista e retornou `409`; nenhuma parada parcial foi criada;
- um teste de integracao passou a reproduzir o caso ausente: criar um roteiro vazio, recarrega-lo em uma nova sessao e adicionar a primeira parada;
- a causa foi o mapeamento dos identificadores gerados pela aplicacao como se fossem gerados pelo banco, fazendo a persistencia tentar atualizar uma parada nova em vez de inseri-la;
- o mapeamento foi corrigido e o tratamento de concorrencia das alteracoes do roteiro foi centralizado em uma resposta operacional segura;
- a solucao compilou sem avisos nem erros e passaram `22` testes unitarios, `1` teste de arquitetura e `56` testes de integracao, totalizando `79` testes;
- a correcao foi registrada no commit `62e6a8e` e publicada somente na API pelo deployment `589197e9-3d4a-4f92-b6b3-fe06ac194ade`, concluido com `SUCCESS`;
- depois da publicacao, `scripts/homologacao/verificar-superficie-publica.sh` passou integralmente e nao houve erro de aplicacao no novo deployment;
- o roteiro controlado recebeu duas paradas: uma entrega para Vanessa e uma coleta para Gustavo, ambas marcadas explicitamente como ensaio sem deslocamento real;
- o roteiro foi publicado e as duas paradas percorreram os estados `Pendente`, `A caminho` e `Concluida`;
- o resultado final foi `100%`, com duas paradas concluidas e zero nao realizadas;
- nenhum link de WhatsApp, ligacao ou mapa foi acionado; o Worker permaneceu sem implantacao ativa e nenhum envio foi realizado.

## Pendencia de dados na homologacao

A lista autenticada apresentou `3.523` clientes. O ensaio nao alterou registros fora dos dois destinatarios autorizados, mas a origem, a autorizacao, a minimizacao e a retencao dessa carga devem ser formalmente confirmadas antes de ampliar a homologacao ou liberar qualquer envio.

## Proximas validacoes

1. confirmar formalmente a autorizacao da carga existente de clientes em homologacao;
2. obter o aceite operacional da equipe sobre periodos, replanejamento e significado de conclusao das paradas do roteiro;
3. decidir se a tela administrativa de Auditoria e Usuarios entra antes do piloto assistido ou permanece como operacao tecnica da Versao 1.0;
4. validar os endpoints administrativos autenticados sem retirar o token opaco do BFF;
5. provisionar a instancia e as credenciais do WhatsMiau, cadastrar o webhook e somente entao ativar uma replica do Worker;
6. homologar envio individual, entrega, leitura e idempotencia somente com os destinatarios autorizados;
7. ensaiar backup e restauracao isolada no provedor.
