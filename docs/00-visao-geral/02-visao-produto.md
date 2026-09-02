# Visao do Produto

## Proposito

O LavaMais CRM e uma plataforma de relacionamento comercial que ajuda a equipe a transformar conhecimento sobre clientes em comunicacao relevante, oportunidades e vendas.

O produto sera implantado inicialmente na LavaMais Praia Grande, mas nasce multitenant para permitir novas unidades e clientes no futuro.

## Problema

Informacoes importantes sobre os clientes estao dispersas entre pessoas, WhatsApp e sistemas operacionais. Isso dificulta selecionar quem deve receber determinado contato, personalizar a abordagem e acompanhar o resultado.

## Primeira proposta de valor

> Escolher um produto ou servico, encontrar clientes elegiveis na base e executar uma Acao Comercial personalizada com rastreabilidade.

## Implantacao inicial

O primeiro fluxo do produto sera a `AcaoComercial`:

```text
Produto ou servico
        +
Publico selecionado
        +
Modelo de mensagem
        ↓
Revisao dos destinatarios
        ↓
Abertura individual no WhatsApp Web
        ↓
Confirmacao manual de envio e resultado comercial
```

Sem historico de pedidos, o sistema nao fingira possuir inteligencia que os dados ainda nao permitem. As primeiras sugestoes e segmentacoes usam:

- tipo de cliente;
- bairro e cidade;
- etiquetas e interesses declarados;
- data de cadastro;
- data de nascimento, quando informada;
- permissao de comunicacao;
- selecao manual.

O aprendizado comercial sera construido a partir das acoes e interacoes registradas pelo proprio CRM e de integracoes futuras.

## Evolucao esperada

Depois da implantacao inicial, o produto podera evoluir para:

- Cliente 360;
- historico de interacoes;
- oportunidades sugeridas;
- campanhas recorrentes e agendadas;
- funil comercial;
- tarefas e proximas acoes;
- integracao com pedidos e movimentacoes;
- indicadores, metas e relatorios;
- automacoes e inteligencia aplicada aos dados.

## Principios

- simples para a equipe operar diariamente;
- orientado a acao, e nao apenas a cadastro;
- seguro para dados pessoais;
- rastreavel e auditavel;
- multitenant desde a base;
- preparado para crescer sem complexidade prematura;
- integracoes externas futuras sempre isoladas por contratos.

## Fora do dominio

Producao, lavagem, triagem, passadoria, estoque, caixa, financeiro completo, motoristas e roteirizacao pertencem ao futuro LavaMais Operacao e Producao.
