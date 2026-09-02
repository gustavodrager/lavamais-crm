# Ordem de Implementacao

## Fatia 0 — Fundacao

- criar monorepo e solucoes;
- ambiente local com PostgreSQL;
- logging, Problem Details, OpenAPI e testes basicos;
- pipeline inicial.

## Fatia 1 — Identidade e tenant

- login local por telefone e senha definida no primeiro acesso;
- sessao opaca validada pela API;
- token mantido somente na sessao server-side do BFF;
- contexto de tenant e papel derivados no servidor;
- provisionamento controlado do primeiro administrador;
- limitacao de taxa no login e no primeiro acesso;
- testes de isolamento.

## Fatia 2 — Clientes

- cadastro e busca;
- contatos e enderecos;
- etiquetas e permissao;
- normalizacao e duplicidade.

## Fatia 3 — Importacao CSV

- conteudo pendente persistido e isolado por tenant;
- mapeamento e pre-visualizacao;
- confirmacao e relatorio;
- testes com arquivos validos e invalidos.

## Fatia 4 — Catalogo e modelos

- itens de catalogo;
- modelos comerciais e publicacao de versao;
- variaveis controladas e conteudo revisado.

## Fatia 5 — Rascunho e segmentacao

- CRUD de rascunho;
- criterios tipados;
- simulacao paginada;
- motivos de exclusao.

## Fatia 6 — Preparacao

- snapshot de audiencia;
- transicao de estado;
- concorrencia otimista;
- auditoria.

## Fatia 7 — Envio

- URL oficial `wa.me` com telefone e mensagem congelados;
- janela auxiliar reutilizavel e alternativa em nova aba;
- auditoria da abertura sem mudanca de estado;
- confirmacao manual com usuario, horario e concorrencia otimista;
- estados `Pendente` e `Enviado`;
- remocao de provedor, webhook, outbox e processamento em segundo plano.

## Fatia 8 — Resultado e acompanhamento

- detalhe da acao;
- estados por destinatario;
- resultado comercial;
- totais consolidados.

## Fatia 9 — Endurecimento

- testes ponta a ponta;
- verificacoes de seguranca;
- observabilidade;
- backup e restauracao testados;
- runbook de implantacao.

## Fatia 10 — Movimentacoes comerciais

- catalogo de lavanderia com artigos, servicos e ofertas;
- registro manual do atendimento com total calculado no servidor;
- historico e indicadores descritivos no cliente;
- cancelamento rastreavel por Gestor;
- autorizacao, tenant, migration, API, interface e testes.

## Fatia 11 — Roteiro diario manual

- roteiro por data e motorista;
- paradas de coleta e entrega com snapshot operacional do cliente;
- reordenacao, publicacao, impressao e execucao no celular;
- estados de deslocamento, conclusao, adiamento e nao realizacao;
- tenant, migration, API, interface e testes.

## Fatia 12 — Consolidacao da Versao 1.0

- fechar os limites funcionais e os papeis;
- alinhar documentacao de arquitetura, API e banco ao codigo;
- atualizar a matriz de prontidao e o roadmap;
- estabilizar os testes ponta a ponta da interface atual;
- manter producao bloqueada ate a homologacao formal.

Cada fatia deve terminar utilizavel e testada antes da proxima.
