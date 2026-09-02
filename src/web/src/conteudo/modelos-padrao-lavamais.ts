export interface ModeloPadraoLavaMais {
  id: string;
  nome: string;
  objetivo: string;
  conteudoPreVisualizacao: string;
}

export const modelosPadraoLavaMais: ModeloPadraoLavaMais[] = [
  {
    id: "coleta-entrega",
    nome: "Coleta e entrega LavaMais",
    objetivo: "Divulgar a comodidade do delivery.",
    conteudoPreVisualizacao: "Olá, {{nomeCliente}}! A LavaMais pode cuidar das suas roupas para você, com coleta e entrega. Quer combinar o melhor horário?",
  },
  {
    id: "mais-tempo",
    nome: "Mais tempo para você",
    objetivo: "Vender conveniência sem depender de desconto.",
    conteudoPreVisualizacao: "Olá, {{nomeCliente}}! Que tal deixar suas roupas aos cuidados da LavaMais e ganhar mais tempo no seu dia? Podemos buscar e entregar para você. Quer saber como funciona?",
  },
  {
    id: "roupas-cama",
    nome: "Cuidado com roupas de cama",
    objetivo: "Promover a higienização de peças grandes.",
    conteudoPreVisualizacao: "Olá, {{nomeCliente}}! Suas roupas de cama podem ficar limpas, cheirosas e bem cuidadas sem trabalho para você. A LavaMais higieniza, busca e entrega. Vamos agendar?",
  },
  {
    id: "ocasiao-especial",
    nome: "Roupa pronta para a ocasião",
    objetivo: "Oferecer cuidado para roupas sociais e peças delicadas.",
    conteudoPreVisualizacao: "Olá, {{nomeCliente}}! Tem uma ocasião especial chegando? A LavaMais cuida das suas roupas com toda a atenção para você usar suas peças limpas e bem apresentadas. Quer agendar o atendimento?",
  },
  {
    id: "dias-chuva",
    nome: "Ajuda nos dias de chuva",
    objetivo: "Oferecer lavagem e secagem em períodos úmidos.",
    conteudoPreVisualizacao: "Olá, {{nomeCliente}}! Com chuva e umidade, cuidar das roupas em casa pode ficar mais difícil. A LavaMais lava, seca e entrega tudo pronto para você. Quer combinar uma coleta?",
  },
  {
    id: "rota-bairro",
    nome: "LavaMais no seu bairro",
    objetivo: "Concentrar pedidos próximos na mesma rota.",
    conteudoPreVisualizacao: "Olá, {{nomeCliente}}! A LavaMais está organizando as próximas coletas. Podemos cuidar das suas roupas e entregar tudo pronto para você. Tem interesse?",
  },
];
