# ADR-020 — Perfis operacionais da Versao 1.0

- Status: aceito
- Data: 2026-09-02
- Substitui parcialmente: ADR-007, apenas quanto aos papeis que podem executar o envio individual
- Esclarece: ADR-013 e ADR-018

## Contexto

A implantacao possui tres papeis locais, mas as decisoes anteriores nao reuniam em um unico lugar os limites de cada perfil. A interface ja diferencia gestao e execucao, e a autorizacao precisa continuar consistente no BFF e na API.

## Decisao

### Administrador

- possui acesso total da unidade;
- importa clientes;
- administra usuarios e consulta auditoria pela API;
- pode executar todas as capacidades do Gerente e do Operador;
- pode alternar a visualizacao da interface para conferir os outros perfis.

### Gerente

- mantem clientes, catalogo, etiquetas e modelos de mensagem;
- cria, configura, prepara e cancela Acoes Comerciais;
- envia mensagens individuais e registra resultados;
- registra e cancela Movimentacoes Comerciais;
- organiza, publica e executa roteiros manuais;
- nao importa clientes nem administra usuarios.

### Operador

- consulta, cadastra e atualiza clientes;
- registra Movimentacoes Comerciais, sem poder cancela-las;
- consulta a fila preparada, envia uma mensagem por vez e registra o resultado;
- organiza e executa o roteiro diario manual;
- nao importa clientes, publica modelos, cria Acoes Comerciais ou acessa configuracoes gerenciais;
- nao recebe na interface os indicadores de valor reservados a gestao.

Nao existe perfil da Franqueadora na Versao 1.0.

## Regras tecnicas

- o tenant e o papel sao derivados da sessao no servidor;
- ocultar um comando na interface nao substitui a autorizacao da API;
- recursos de outro tenant retornam `404` quando revelar a existencia causaria vazamento;
- comandos gerenciais exigem a politica `Gestor` ou `Administrador` correspondente;
- consultas e comandos operacionais exigem usuario ativo;
- a visualizacao simulada pelo Administrador restringe a experiencia da interface, mas nao cria uma nova identidade.

## Consequencias

- o Operador passa a constar formalmente entre os papeis autorizados a solicitar um envio individual;
- a importacao CSV permanece exclusiva do Administrador;
- o cancelamento de atendimento permanece restrito a Administrador e Gerente;
- mudancas futuras de perfil exigem teste de API, teste de interface e atualizacao da matriz de escopo.
