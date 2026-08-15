# LavaMais CRM - Protótipo Recepção e Administrador

> Status: prototipo historico. Nao define a Versao 1.0 vigente. Consulte `../docs/11-implantacao-inicial/`.

## Objetivo

Protótipo navegável em HTML, CSS e JavaScript puro criado para validar uma proposta anterior com duas experiências especializadas da LavaMais Praia Grande.

- **Seleção de perfil**: tela inicial do protótipo para escolher entre Recepção e Gerente, sem login.
- **Recepção**: operação rápida, poucos cliques e experiência próxima de caixa/POS.
- **Administrador**: gestão, CRM, relacionamento, inteligência comercial e oportunidades.

## Fluxo da Recepção

1. Recepção
2. Buscar cliente
3. Cliente encontrado
4. Receber sacola
5. Sucesso

## Telas criadas

- **Seleção de Perfil**: entrada do protótipo com logo LavaMais CRM e cards para acessar Recepção ou Gerente.
- **Dashboard Administrador**: indicadores do dia, inteligência comercial, clientes, produtos, alertas, timeline e oportunidades.
- **Oportunidades do Dia**: recomendações comerciais com ação direta para clientes, campanhas, WhatsApp e alertas.
- **Clientes**: Central de Relacionamento com busca grande, filtros rápidos, cards de clientes e perfil completo.
- **Perfil do Cliente**: card principal, Perfil Inteligente, Assistente Comercial, timeline, histórico comercial, produtos mais usados e comunicação.
- **Relacionamento**: WhatsApp sugerido, campanhas e datas importantes agrupadas no mesmo módulo.
- **Insights**: alertas inteligentes, tendências de produtos e oportunidades de meta agrupadas.
- **Configurações**: preferências do CRM, unidade, usuários e mensagens padrão.
- **Recepção**: busca grande por nome ou WhatsApp, QR simulado e últimos atendimentos.
- **Cliente Encontrado**: ficha reduzida com ações e Perfil Inteligente.
- **Receber Sacola**: busca instantânea de peças, sugestões de últimas peças, botões de peças mais usadas, carrinho com quantidade, contador total e observações.
- **Sucesso**: confirmação com total de peças e atalhos para continuar a recepção.

## Como abrir localmente

Abra `prototipo/index.html` diretamente no navegador.

Não há dependências, build, backend ou integrações reais.

## Decisões de UX

- O Administrador abre em um dashboard de respostas, não em tabelas.
- O protótipo começa mostrando que existem experiências específicas para cada perfil.
- Cada experiência mostra o Perfil Atual e permite voltar para a seleção com Trocar Perfil.
- A navegação administrativa foi reduzida a seis módulos: Dashboard, Clientes, Recepção, Relacionamento, Insights e Configurações.
- No mobile, o menu inferior permanece fixo durante Dashboard, Clientes, Perfil do Cliente, Recepção, Receber Sacola, Relacionamento, Insights e Configurações.
- O módulo Clientes virou a Central de Relacionamento, com cards, indicadores, perfil inteligente e oportunidades por cliente.
- Campanhas, WhatsApp, alertas, metas e relatórios ficam agrupados dentro de Relacionamento e Insights para reduzir carga cognitiva.
- A navegação administrativa usa cards, listas, ranking, progresso, timeline e páginas focadas.
- WhatsApp nunca aparece vazio: sempre há uma mensagem sugerida.
- A tela de recebimento virou o centro do produto.
- O operador não precisa abrir modais para adicionar peças.
- Os itens mais comuns ficam sempre visíveis.
- As últimas peças do cliente aparecem como sugestão, sem serem adicionadas automaticamente.
- O total de peças fica fixo no rodapé durante o recebimento.
- O fluxo evita navegação lateral e segue uma sequência linear.
- A interface foi pensada primeiro para tablet e recepção presencial.

## Próximos passos sugeridos

- Validar com o Major quais cards devem virar indicadores reais.
- Definir regras dos alertas inteligentes e das campanhas sugeridas.
- Validar a lista real de peças mais usadas com a equipe.
- Testar o fluxo em tablet na bancada de recepção.
- Ajustar textos dos botões com operadores reais.
- Definir quais dados do cliente precisam aparecer no cabeçalho final.
