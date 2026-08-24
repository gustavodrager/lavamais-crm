# Identidade visual e padrao de imagens do CRM

Status: vigente para o desenho e a implementacao da interface do LavaMais CRM.

## Objetivo

Traduzir a identidade publica da LavaMais Praia Grande para uma interface de CRM clara, confiavel e adequada ao uso diario. O sistema deve ser reconhecido como parte da marca sem reproduzir a composicao promocional dos posts em todas as telas.

Este documento orienta:

- aplicacao do logo;
- paleta e tokens de cor;
- tipografia, formas, icones e espacamento;
- selecao e tratamento de imagens;
- composicao das telas da Versao 1.0;
- criterios de acessibilidade e consistencia.

## Referencias e grau de confianca

As referencias visuais foram consultadas em 24 de agosto de 2026:

- perfil oficial da unidade: [Instagram `@lavanderialavamaispg`](https://www.instagram.com/lavanderialavamaispg/);
- pagina oficial da unidade: [LavaMais Praia Grande/SP](https://www.lavamais.com/unidade/praia-grande-sp);
- foto de perfil e publicacoes visiveis no Instagram da unidade.

A paleta deste documento foi derivada visualmente dessas referencias publicas. Ela e adequada para orientar o CRM, mas nao substitui um manual de marca ou arquivos vetoriais oficiais. Se a franqueadora fornecer esses materiais, as medidas e cores oficiais prevalecem e este documento deve ser atualizado.

## Essencia visual

A comunicacao da unidade combina:

- azul-claro como sinal de limpeza, leveza e proximidade;
- azul-marinho para contraste, confianca e titulos;
- branco como base de composicoes limpas;
- amarelo e laranja em pequenos destaques da assinatura da marca;
- fotografias claras de roupas, tecidos, ambientes e servicos;
- formas arredondadas, bolhas e curvas associadas a agua e cuidado;
- chamadas curtas, diretas e de leitura rapida.

No CRM, essa identidade deve aparecer com mais contencao. O conteudo operacional, os estados e as proximas acoes sempre possuem prioridade sobre elementos decorativos.

## Logo

![Logo de referencia da LavaMais Praia Grande](assets/logo-lavamais-praia-grande-instagram.jpg)

Arquivo de referencia local: [`assets/logo-lavamais-praia-grande-instagram.jpg`](assets/logo-lavamais-praia-grande-instagram.jpg).

Ativo tratado e utilizado pelo frontend: [`../../../src/web/public/logo-lavamais-praia-grande.png`](../../../src/web/public/logo-lavamais-praia-grande.png). Essa versao preserva o logo circular e usa transparencia real fora do circulo.

### Limitacao do arquivo atual

O arquivo disponivel publicamente e uma foto de perfil JPEG de 150 por 150 pixels, com composicao circular. A versao PNG transparente do frontend foi tratada a partir dessa referencia e serve como ativo temporario digital. Ela nao substitui o arquivo vetorial oficial e nao deve ser usada em materiais impressos.

Antes da aplicacao definitiva, solicitar preferencialmente:

1. logo horizontal em SVG;
2. simbolo ou avatar em SVG;
3. versoes positiva, negativa e monocromatica;
4. confirmacao das cores oficiais;
5. regras de area de protecao da franqueadora.

### Aplicacao no CRM

| Contexto | Aplicacao recomendada |
|---|---|
| Barra lateral em desktop | logo horizontal oficial, quando disponivel, com altura visual entre 28 e 36 px |
| Cabecalho em celular | simbolo ou avatar com 32 px; nome `LavaMais CRM` ao lado |
| Entrada | logo horizontal com largura maxima de 180 px |
| Icone do navegador | simbolo simplificado oficial; nunca reduzir a assinatura completa |
| Relatorios e exportacoes | versao horizontal no cabecalho, sem fundo promocional |

### Area de protecao e integridade

- reservar ao redor do logo espaco livre equivalente a pelo menos metade da altura do simbolo;
- manter proporcao original;
- preferir fundo branco ou azul-marinho uniforme;
- usar a versao negativa oficial sobre fundo escuro;
- manter a assinatura `Praia Grande/SP` quando a tela representar especificamente a unidade inicial;
- usar `LavaMais CRM` no texto acessivel, mesmo quando a imagem possuir texto embutido.

Nunca:

- redesenhar o logo com outra fonte;
- alterar cores, inclinar, esticar ou aplicar sombra intensa;
- recortar parte da assinatura;
- usar a foto de perfil ampliada e pixelada;
- colocar o logo sobre fotografia sem contraste controlado;
- tratar o icone generico de gotas atual como logo oficial.

## Paleta do CRM

### Cores de marca derivadas

| Token conceitual | Hex de referencia | Uso principal |
|---|---:|---|
| Azul LavaMais | `#45ABE0` | marca, destaques suaves, ilustracoes e superficies selecionadas |
| Azul acao | `#087DBA` | botoes primarios, links e foco com contraste adequado |
| Azul profundo | `#123F73` | titulos, navegacao ativa, cabecalhos e fundos de alto contraste |
| Amarelo cuidado | `#F2C230` | pequenos acentos, marcadores e detalhes da marca |
| Laranja lavanderia | `#F2A51F` | pequenos acentos complementares e assinatura visual |
| Branco limpeza | `#FFFFFF` | paineis, formularios e area principal de leitura |

Os valores sao aproximacoes digitais das referencias publicas. O azul de acao e mais escuro que o azul do logo para permitir texto branco legivel em controles interativos.

### Neutros de interface

| Token conceitual | Hex | Uso principal |
|---|---:|---|
| Fundo frio | `#F5F9FC` | fundo geral da aplicacao |
| Superficie suave | `#EAF4FA` | filtros, blocos informativos e selecao secundaria |
| Borda | `#D6E3EC` | divisores e contornos |
| Texto secundario | `#526579` | descricoes, metadados e ajuda |
| Texto principal | `#102A43` | corpo de texto e rotulos |
| Azul noturno | `#082B4C` | fundos escuros opcionais e maior contraste |

### Cores semanticas

Cores de estado nao devem ser substituidas pelas cores promocionais da marca:

| Estado | Cor de referencia | Regra |
|---|---:|---|
| Sucesso | `#16835B` | acao concluida, entregue ou convertida |
| Atencao | `#A86600` | pendencia que requer observacao |
| Erro | `#C73535` | falha, bloqueio ou acao destrutiva |
| Informacao | `#087DBA` | orientacao neutra e progresso |

O estado nunca depende apenas da cor. Combinar cor com texto, icone e, quando necessario, descricao.

### Proporcao de uso

Como orientacao para uma tela comum:

- 70% a 80% de branco e neutros claros;
- 15% a 25% de azuis;
- no maximo 5% de amarelo e laranja;
- cores semanticas somente quando houver significado de negocio.

Amarelo e laranja nao devem ser usados como texto pequeno sobre branco nem competir com o botao primario.

## Tokens sugeridos para a interface

A implementacao deve centralizar as cores em tokens, sem espalhar valores hexadecimais pelos componentes.

```css
:root {
  --marca-azul: #45abe0;
  --marca-azul-acao: #087dba;
  --marca-azul-profundo: #123f73;
  --marca-amarelo: #f2c230;
  --marca-laranja: #f2a51f;

  --background: #f5f9fc;
  --foreground: #102a43;
  --card: #ffffff;
  --card-foreground: #102a43;
  --primary: #087dba;
  --primary-foreground: #ffffff;
  --secondary: #eaf4fa;
  --secondary-foreground: #123f73;
  --muted: #eaf4fa;
  --muted-foreground: #526579;
  --border: #d6e3ec;
  --input: #d6e3ec;
  --ring: #087dba;
  --destructive: #c73535;
}
```

O tema escuro nao e prioridade da implantacao inicial. Se for mantido tecnicamente, deve ser validado como experiencia completa antes de ser oferecido ao usuario.

## Tipografia

O CRM deve usar uma familia sem serifa de alta legibilidade. A pilha nativa atual e apropriada para a implantacao inicial:

```text
ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

Hierarquia recomendada:

| Papel | Tamanho | Peso | Uso |
|---|---:|---:|---|
| Titulo de pagina | 28-32 px | 700 | objetivo principal da tela |
| Titulo de secao | 20-24 px | 650-700 | blocos da jornada |
| Titulo de cartao | 16-18 px | 600 | resumo de entidade ou etapa |
| Corpo | 14-16 px | 400 | conteudo e formularios |
| Rotulo | 14 px | 600 | campos e controles |
| Auxiliar | 12-13 px | 400-500 | metadados e ajuda curta |

Regras:

- usar caixa de frase em titulos e botoes;
- evitar blocos inteiros em caixa alta;
- manter comprimento de linha entre 45 e 80 caracteres em textos longos;
- reservar o azul profundo para titulos importantes;
- nao tentar reproduzir a tipografia desenhada do logo no conteudo do CRM.

## Formas, icones e profundidade

- cantos de 10 a 14 px em paineis e controles principais;
- botoes com cantos entre 8 e 10 px, sem formato de capsula por padrao;
- sombras discretas somente para separar camadas flutuantes;
- borda clara como separacao principal dos cartoes;
- icones lineares, consistentes e acompanhados de rotulo nas acoes essenciais;
- bolhas e ondas podem aparecer em entrada, estados vazios e paineis institucionais, nunca atras de tabelas ou formularios densos.

## Padrao de imagens

### Direcao fotografica

Priorizar imagens que transmitam cuidado, limpeza e praticidade:

- roupas limpas, dobradas ou penduradas;
- texturas de tecido em bom estado;
- ambientes claros, organizados e reais;
- atendimento profissional sem poses artificiais;
- servicos da unidade quando relacionados ao conteudo;
- pessoas diversas em situacoes naturais, mediante autorizacao de uso.

### Tratamento

- luz natural ou branca, sem dominante amarela intensa;
- temperatura levemente fria ou neutra;
- contraste moderado e detalhes preservados nos tecidos brancos;
- fundos organizados e com pouco ruido;
- sobreposicao azul somente quando o texto precisar de apoio;
- cantos arredondados coerentes com os cartoes;
- texto alternativo descrevendo funcao e conteudo relevante.

### Evitar

- bancos de imagem com aparencia excessivamente artificial;
- maquinas ou processos que facam o CRM parecer sistema de producao;
- fundos poluidos atras de texto;
- filtros saturados, brilho excessivo ou azul aplicado sobre pele;
- imagens apenas decorativas em listas, tabelas e formularios;
- copiar telefone, endereco ou chamada promocional dos posts para a interface operacional.

### Formatos e desempenho

| Uso | Proporcao | Tamanho recomendado | Formato |
|---|---:|---:|---|
| Hero de entrada | 4:3 ou 3:2 | ate 1600 px no maior lado | AVIF ou WebP |
| Cartao editorial | 16:9 ou 4:3 | 800-1200 px | AVIF ou WebP |
| Avatar ou simbolo | 1:1 | 128-256 px | SVG quando possivel; WebP como alternativa |
| Miniatura | 1:1 ou 4:3 | 320-480 px | WebP |

- informar largura e altura para evitar deslocamento de layout;
- nao carregar imagem grande quando uma miniatura resolve;
- manter JPEG apenas para o ativo temporario proveniente do Instagram;
- nao incorporar publicacoes do Instagram como dependencia visual do produto.

## Layout do CRM

### Estrutura principal

```text
┌──────────────────┬─────────────────────────────────────────────┐
│ Logo LavaMais    │ Cabecalho: contexto, usuario e acoes       │
│                  ├─────────────────────────────────────────────┤
│ Navegacao        │ Titulo + descricao curta + acao primaria   │
│                  │                                             │
│                  │ Conteudo em paineis brancos                 │
│                  │                                             │
│ Unidade/tenant   │                                             │
└──────────────────┴─────────────────────────────────────────────┘
```

- barra lateral branca ou azul noturno, com navegacao simples;
- fundo geral frio e paineis brancos;
- uma acao primaria azul por contexto;
- largura de leitura controlada, preservando espaco em telas grandes;
- cabecalho discreto, sem banner promocional recorrente;
- nome da unidade no seletor ou rodape da barra lateral, nunca como autoridade enviada pelo navegador.

### Aplicacao nas telas da Versao 1.0

#### Entrada

- logo em destaque com fundo branco;
- faixa ou imagem lateral opcional com tecido limpo e sobreposicao azul;
- formulario curto e visualmente dominante;
- mensagem de marca: `Relacionamento comercial simples e cuidadoso.`

#### Inicio e Acoes Comerciais

- titulo, resumo da etapa e botao `Nova acao comercial`;
- cartoes de resumo apenas quando representarem dados reais;
- lista como elemento principal;
- estados com badge, texto e icone;
- azul-claro para selecao e progresso, sem colorir linhas inteiras de forma intensa.

#### Criacao e revisao

- jornada em etapas: item, publico, modelo, revisao e envio;
- indicador de progresso azul;
- painel lateral ou resumo fixo em telas largas;
- alerta amarelo reservado para conferencia antes do envio;
- botao de envio individual claramente separado de acoes destrutivas.

#### Clientes, catalogo e configuracoes

- filtros em superficie azul muito clara;
- tabelas brancas, linhas arejadas e cabecalho de alto contraste;
- formularios divididos por assunto, nao por decoracao;
- imagens somente quando ajudarem a identificar um item do catalogo.

## Componentes e estados

| Componente | Padrao visual |
|---|---|
| Botao primario | azul acao, texto branco, foco visivel |
| Botao secundario | fundo azul muito claro, texto azul profundo |
| Botao destrutivo | vermelho semantico, nunca amarelo ou laranja |
| Link | azul acao, sublinhado em texto corrido |
| Campo | fundo branco, borda neutra, foco azul de pelo menos 2 px |
| Cartao | fundo branco, borda clara, sombra minima ou ausente |
| Badge | cor semantica suave, texto e icone correspondentes |
| Estado vazio | icone ou ilustracao simples, titulo, orientacao e uma proxima acao |
| Carregamento | esqueleto neutro; evitar animacoes decorativas longas |

## Acessibilidade

- atender no minimo WCAG 2.2 nivel AA;
- contraste minimo de 4,5:1 para texto normal e 3:1 para texto grande e componentes;
- foco sempre visivel;
- alvo interativo minimo de 44 por 44 px em celular;
- navegacao completa por teclado;
- rotulos persistentes em campos, sem depender apenas de placeholder;
- respeitar preferencia por movimento reduzido;
- nao usar amarelo ou laranja como unica indicacao;
- fornecer alternativa textual para imagens informativas;
- testar zoom de 200% e larguras de 320 px em fluxos essenciais.

## Tom da interface

A voz deve ser direta, acolhedora e profissional. A identidade dos posts inspira proximidade, mas a interface operacional exige precisao.

Preferir:

- `Revise os destinatarios antes de continuar.`
- `A acao comercial esta pronta para processamento.`
- `Nenhum cliente atende aos filtros selecionados.`

Evitar:

- excesso de exclamacoes e emojis;
- slogans em todas as telas;
- linguagem de producao ou logistica;
- termos tecnicos quando uma orientacao de negocio for suficiente;
- o termo `campanha` para o fluxo da Versao 1.0, cujo nome oficial e `Acao Comercial`.

## Criterios de aceite visual

Uma tela esta alinhada a este guia quando:

- o logo e aplicado sem distorcao e com alternativa textual;
- a hierarquia deixa clara a proxima acao;
- valores de cor vem de tokens;
- cores semanticas preservam seu significado;
- o amarelo e o laranja aparecem apenas como acento;
- imagens ajudam a tarefa e possuem tratamento coerente;
- a tela funciona sem imagens e sem depender apenas de cor;
- estados de carregamento, vazio, erro e sucesso foram considerados;
- contraste, teclado, foco e responsividade foram verificados;
- o resultado remete a LavaMais sem parecer uma publicacao promocional.

## Proximos passos de implementacao

1. obter o pacote oficial de marca em SVG e substituir o JPEG temporario;
2. confirmar a paleta com a franqueadora;
3. converter os valores aprovados em tokens do tema global;
4. substituir o icone generico do componente `Marca` pelo ativo oficial;
5. aplicar o sistema visual primeiro na entrada e no layout autenticado;
6. criar uma pagina interna de componentes e estados para validacao;
7. verificar contraste e os fluxos principais em desktop e celular;
8. registrar alteracoes posteriores neste documento.
