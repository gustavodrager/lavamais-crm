# Escopo da Versao 1.0

## Objetivo

Validar que a LavaMais consegue selecionar um publico relevante da base de clientes, enviar uma comunicacao comercial pelo canal oficial e acompanhar o resultado em um fluxo simples e rastreavel.

## Dentro do escopo

### Acesso

- login local pelo telefone autorizado e senha definida no primeiro acesso;
- selecao e validacao do tenant;
- papeis locais `Administrador`, `Gerente` e `Operador`;
- auditoria das operacoes importantes.

### Clientes

- cadastro, edicao, consulta e inativacao;
- nome e WhatsApp obrigatorios;
- contatos e endereco;
- tipo de cliente;
- etiquetas;
- permissao de comunicacao por canal;
- importacao por CSV com pre-visualizacao e validacao;
- identificacao de duplicidade por WhatsApp normalizado dentro do tenant.

### Catalogo

- cadastro de produtos e servicos;
- categoria, descricao e situacao;
- associacao de um item a Acao Comercial.

### Acao Comercial

- criacao em rascunho;
- selecao de item do catalogo;
- filtros simples ou selecao manual de clientes;
- simulacao do publico elegivel;
- revisao e exclusao manual de destinatarios;
- congelamento da audiencia antes do envio;
- escolha de modelo de mensagem de WhatsApp;
- conferencia e envio imediato individual por destinatario pelo Notification Hub;
- acompanhamento do estado de envio e entrega;
- registro manual do resultado comercial.

### Modelos de mensagem

- modelos previamente aprovados para WhatsApp proativo;
- variaveis controladas, como nome do cliente e item do catalogo;
- pre-visualizacao antes da preparacao;
- vinculacao com a chave tecnica do Notification Hub.

## Telas iniciais

1. Entrada e retorno de autenticacao.
2. Inicio com lista de acoes comerciais.
3. Nova Acao Comercial.
4. Revisao e preparacao da acao.
5. Detalhe e acompanhamento da acao.
6. Lista e cadastro de clientes.
7. Importacao de clientes.
8. Configuracoes de catalogo, etiquetas e modelos.

Essas responsabilidades podem ser combinadas em menos rotas durante o desenho da experiencia.

## Fora da Versao 1.0

- calculo de cliente ativo, em risco, inativo ou recuperado;
- ticket medio, frequencia, total gasto e ranking de clientes;
- importacao automatica de pedidos ou movimentacoes;
- integracao ativa com o Essence GO Industrial;
- perfil 360 completo;
- central automatica de oportunidades;
- funil comercial;
- metas e relatorios financeiros;
- campanhas recorrentes;
- agendamento de envios;
- e-mail e SMS na interface do CRM;
- respostas automaticas ou chatbot;
- producao e operacao da lavanderia.

## Extensao controlada de homologacao

Conforme ADR-012, a recepcao pode registrar uma `MovimentacaoComercial` minima para formar historico comercial. Esse registro nao representa controle de pedido operacional e nao substitui o Essence GO Industrial.

O detalhe do cliente apresenta o historico dessas movimentacoes e indicadores descritivos calculados somente sobre registros validos: quantidade, total movimentado, ticket medio, ultima movimentacao e quantidade de servicos distintos. Esses dados nao representam controle financeiro nem classificacao automatica do cliente.

Conforme ADR-013, a homologacao tambem inclui um roteiro diario manual para organizar coletas e entregas. Essa extensao nao realiza roteirizacao automatica, rastreamento ou controle de pedidos.

## Criterios de sucesso

- uma base real de clientes pode ser importada com seguranca;
- a equipe cria uma Acao Comercial sem apoio tecnico;
- apenas clientes elegiveis e permitidos entram na audiencia;
- repetir uma solicitacao nao duplica o envio;
- nenhum comando dispara mensagens para varios destinatarios;
- o estado de cada destinatario pode ser acompanhado;
- a equipe registra retorno e conversao manualmente;
- todas as operacoes respeitam tenant, autorizacao e auditoria.

## Terminologia

`AcaoComercial` e o termo oficial da Versao 1.0. `Campanha` fica reservado para a evolucao com recorrencia, agendamento, automacao e regras mais complexas.
