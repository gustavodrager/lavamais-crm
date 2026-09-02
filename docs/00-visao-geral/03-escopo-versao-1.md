# Escopo da Versao 1.0

## Decisao de fechamento

Escopo funcional fechado em 2 de setembro de 2026 para a implantacao inicial da LavaMais Praia Grande.

A Versao 1.0 consolida um CRM comercial utilizavel pela equipe para conhecer o cliente, registrar atendimentos, executar contatos individuais e organizar manualmente as coletas e entregas do dia. A liberacao em producao continua condicionada a homologacao, seguranca, dados e operacao descritos em `docs/11-implantacao-inicial`.

## Objetivo

Permitir que a unidade execute o ciclo comercial abaixo de forma simples e rastreavel:

```text
Cliente -> Atendimento -> Historico -> Acao Comercial -> Contato -> Resultado
                         \-> Roteiro diario manual
```

A movimentacao comercial alimenta o historico do CRM. Ela nao substitui pedido, caixa, producao, fiscal ou o Essence GO Industrial.

## Dentro do escopo

### Acesso, perfis e tenant

- login local pelo telefone autorizado e senha definida no primeiro acesso;
- sessao opaca mantida no BFF, sem token disponivel ao JavaScript do navegador;
- selecao e validacao do tenant no servidor;
- papeis locais `Administrador`, `Gerente` e `Operador`;
- isolamento por tenant e autorizacao na API;
- auditoria das operacoes criticas ja instrumentadas.

### Clientes e atendimento

- cadastro, edicao, consulta e inativacao;
- nome e WhatsApp obrigatorios;
- e-mail, data de nascimento, tipo, codigo externo, contatos e endereco;
- etiquetas e permissao de comunicacao por WhatsApp;
- busca por nome, WhatsApp ou localidade;
- importacao por CSV exclusiva do Administrador, com pre-visualizacao e validacao;
- identificacao de duplicidade por WhatsApp normalizado dentro do tenant;
- historico comercial no detalhe do cliente.

### Movimentacoes comerciais

- registro manual de uma visita ou atendimento comercial;
- cliente ativo, data, observacao e codigo externo opcional;
- uma ou mais linhas de artigo e servico do catalogo de lavanderia;
- quantidade, preco de tabela, preco praticado opcional e total calculado no servidor;
- cancelamento com motivo por Administrador ou Gerente;
- indicadores descritivos no historico: quantidade, total informado, media informada, ultima movimentacao e servicos distintos.

### Catalogo

- cadastro de produtos e servicos usados em Acoes Comerciais;
- catalogo de lavanderia com artigos, servicos, ofertas e preco unitario;
- categorias, descricao, situacao e carga inicial controlada.

### Acoes Comerciais e relacionamento

- criacao em rascunho por Administrador ou Gerente;
- objetivo e item de catalogo opcional conforme o modelo escolhido;
- filtros simples ou selecao manual de clientes;
- simulacao do publico elegivel;
- revisao e exclusao manual de destinatarios;
- congelamento da audiencia antes do envio;
- escolha de modelo de mensagem publicado;
- fila operacional para a Operadora;
- acompanhamento de pendencia e confirmacao manual por destinatario;
- registro manual de retorno, interesse, conversao e valor convertido.

### WhatsApp e modelos de mensagem

- modelos previamente aprovados para contato proativo;
- criacao e publicacao por Administrador ou Gerente;
- variaveis controladas, como nome do cliente e item do catalogo;
- pre-visualizacao antes da preparacao;
- abertura individual da conversa pelo link oficial `wa.me` em janela auxiliar;
- confirmacao manual auditada depois que a pessoa envia no WhatsApp;
- nenhum comando de disparo coletivo.

O uso real permanece restrito a destinatarios autorizados ate a homologacao da estacao, da sessao oficial da loja e do procedimento operacional.

### Roteiro diario manual

- criacao de um roteiro por data e motorista;
- inclusao manual de clientes com endereco operacional completo;
- paradas de coleta ou entrega, periodo e observacao;
- reordenacao e publicacao da sequencia;
- visualizacao para impressao;
- execucao no celular com mapa, telefone e WhatsApp;
- registro de deslocamento, conclusao, adiamento ou nao realizacao.

Nao existe uma entidade separada de solicitacao de delivery nesta versao. Cada parada e adicionada manualmente ao roteiro a partir do cadastro do cliente.

### Painel inicial

- painel gerencial orientado a pendencias de Acoes Comerciais, resultados informados, atendimentos recentes e roteiro do dia;
- painel operacional orientado a proxima tarefa, mensagens, retornos, atendimentos e roteiro;
- visao do Administrador como Gerente ou Operador para conferir a experiencia por perfil.

O painel nao e um dashboard financeiro e nao calcula faturamento oficial, metas comerciais ou indicadores de producao.

## Matriz de perfis da Versao 1.0

| Capacidade | Administrador | Gerente | Operador |
|---|---:|---:|---:|
| Consultar e manter clientes | Sim | Sim | Sim |
| Importar clientes por CSV | Sim | Nao | Nao |
| Registrar movimentacao comercial | Sim | Sim | Sim |
| Cancelar movimentacao | Sim | Sim | Nao |
| Criar e preparar Acao Comercial | Sim | Sim | Nao |
| Publicar modelo de mensagem | Sim | Sim | Nao |
| Enviar mensagem individual e registrar retorno | Sim | Sim | Sim |
| Organizar e executar roteiro manual | Sim | Sim | Sim |
| Administrar usuarios e consultar auditoria pela API | Sim | Nao | Nao |

## Telas da Versao 1.0

1. Entrada e primeiro acesso.
2. Inicio gerencial ou operacional.
3. Lista, cadastro, edicao e detalhe de clientes.
4. Importacao de clientes.
5. Registro e historico de atendimentos comerciais.
6. Lista, criacao, preparacao e acompanhamento de Acoes Comerciais.
7. Biblioteca de mensagens aprovadas.
8. Organizacao e execucao do roteiro diario.
9. Configuracoes de catalogo, etiquetas e disponibilidade do canal.

## Fora da Versao 1.0

- classificacao automatica de cliente ativo, em risco, inativo, VIP ou recuperado;
- alertas automaticos de 7, 15 e 30 dias;
- metas diarias, semanais ou mensais;
- relatorios comerciais avancados e rankings;
- dashboard financeiro, faturamento oficial ou projecao comercial;
- campanhas recorrentes, agendamento ou disparo em massa;
- central automatica de oportunidades e funil comercial;
- solicitacao automatizada de retirada ou entrega;
- roteirizacao automatica, geolocalizacao ou rastreamento;
- integracao ativa com o Essence GO Industrial;
- perfil da Franqueadora e consolidacao entre unidades;
- Luna ou outra assistente contextual;
- e-mail, SMS, respostas automaticas ou chatbot;
- producao, triagem, lavagem, passadoria, estoque, caixa ou fiscal;
- portal do titular, descarte automatizado ou gestao juridica completa de LGPD.

Esses itens exigem nova decisao de escopo. Metas, relatorios, segmentacao por comportamento, Franqueadora e Luna sao candidatos a uma fase posterior, nao pendencias escondidas desta entrega.

## Criterios de sucesso

- uma base autorizada pode ser importada com pre-visualizacao e isolamento por tenant;
- a equipe localiza ou cadastra um cliente sem apoio tecnico;
- a recepcao registra um atendimento e ele aparece no historico correto;
- o total da movimentacao e calculado no servidor e o cancelamento fica rastreavel;
- o Gerente cria e prepara uma Acao Comercial com publico elegivel;
- a Operadora confere e solicita somente uma mensagem por vez;
- repetir uma solicitacao nao duplica o envio;
- o estado de cada destinatario pode ser acompanhado;
- retorno e conversao podem ser registrados manualmente;
- a equipe organiza e executa o roteiro diario manual;
- os fluxos respeitam tenant e permissao por perfil;
- os testes automatizados e o build de producao passam;
- a homologacao e todos os bloqueios de producao sao concluidos antes de dados reais em producao.

## Terminologia

`AcaoComercial` e o termo oficial da Versao 1.0. `Campanha` fica reservado para a evolucao com recorrencia, agendamento, automacao e regras mais complexas.

`MovimentacaoComercial` ou `atendimento` e o registro informativo do relacionamento comercial. Nao deve ser chamado de pedido operacional.

`RoteiroDiario` organiza paradas manualmente. Nao deve ser apresentado como roteirizacao automatica.
