# ADR-022: Sugestoes comerciais e aprovacao humana

- Status: Aceita
- Data: 2026-09-04
- Evolui: ADR-005 e ADR-014

## Contexto

A carga historica do Essence passou a disponibilizar movimentacoes reais por cliente. A administracao precisa transformar esse historico em oportunidades simples de relacionamento, mantendo controle humano sobre publico e mensagem.

## Decisao

O CRM passa a oferecer ao perfil Administrador uma pagina de sugestoes calculadas sobre o historico comercial. A primeira entrega possui cinco grupos deterministas: atraso no ciclo individual, alto valor em risco, proximidade de recompra, incentivo a segunda compra e retencao de cliente recuperado.

Gerar uma sugestao cria somente um rascunho com os identificadores dos clientes. O administrador escolhe uma mensagem padrao publicada e envia a acao para aprovacao. Administrador ou Gerente pode aprovar e congelar a audiencia, ou rejeitar com motivo. Apenas uma acao aprovada e com clientes elegiveis aparece para o Operador.

As mensagens continuam fixas e reutilizaveis. Somente versoes publicadas por Administrador ou Gerente podem ser escolhidas. O WhatsApp permanece assistido, individual e sem envio automatico, conforme o ADR-021.

## Regras de dados e seguranca

- o tenant e obtido da sessao e nunca do navegador;
- sugestoes sao recalculadas a cada consulta e nao alteram clientes ou movimentacoes;
- o codigo da sugestao e revalidado no servidor ao gerar a acao;
- a lacuna conhecida entre 03/09/2025 e 02/01/2026 nao compoe intervalos de frequencia;
- consentimento para marketing, telefone valido e cliente ativo continuam obrigatorios ao aprovar;
- aprovacao, rejeicao e preparacao possuem auditoria e concorrencia otimista;
- nenhuma mensagem e enviada automaticamente.

## Consequencias

- o historico real passa a orientar contatos comerciais sem criar um motor complexo de campanhas;
- os grupos podem se sobrepor e exigem julgamento do administrador;
- uma sugestao sem clientes elegiveis pode gerar rascunho, mas nao pode ser aprovada;
- novas regras, agendamento ou automacao exigem decisao posterior.
