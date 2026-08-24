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
    conteudoPreVisualizacao: "Olá, {{nomeCliente}}! A LavaMais pode cuidar de {{itemCatalogo}} para você, com coleta e entrega na sua região. Quer combinar o melhor horário?",
  },
  {
    id: "mais-tempo",
    nome: "Mais tempo para você",
    objetivo: "Vender conveniência sem depender de desconto.",
    conteudoPreVisualizacao: "Olá, {{nomeCliente}}! Que tal deixar {{itemCatalogo}} aos cuidados da LavaMais e ganhar mais tempo no seu dia? Podemos buscar e entregar para você. Quer saber como funciona?",
  },
  {
    id: "roupas-cama",
    nome: "Cuidado com roupas de cama",
    objetivo: "Promover a higienização de peças grandes.",
    conteudoPreVisualizacao: "Olá, {{nomeCliente}}! Está na hora de deixar {{itemCatalogo}} limpo, cheiroso e bem cuidado. A LavaMais faz a higienização e ainda pode buscar e entregar na sua região. Vamos agendar?",
  },
  {
    id: "ocasiao-especial",
    nome: "Roupa pronta para a ocasião",
    objetivo: "Oferecer cuidado para roupas sociais e peças delicadas.",
    conteudoPreVisualizacao: "Olá, {{nomeCliente}}! Tem uma ocasião especial chegando? A LavaMais cuida de {{itemCatalogo}} com toda a atenção para você usar suas peças limpas e bem apresentadas. Quer agendar o atendimento?",
  },
  {
    id: "dias-chuva",
    nome: "Ajuda nos dias de chuva",
    objetivo: "Oferecer lavagem e secagem em períodos úmidos.",
    conteudoPreVisualizacao: "Olá, {{nomeCliente}}! Com chuva e umidade, cuidar de {{itemCatalogo}} em casa pode ficar mais difícil. A LavaMais lava, seca e entrega tudo pronto para você. Quer combinar uma coleta?",
  },
  {
    id: "rota-bairro",
    nome: "LavaMais no seu bairro",
    objetivo: "Concentrar pedidos próximos na mesma rota.",
    conteudoPreVisualizacao: "Olá, {{nomeCliente}}! A LavaMais estará realizando coletas na sua região. Podemos aproveitar a rota para cuidar de {{itemCatalogo}} e entregar tudo pronto para você. Tem interesse?",
  },
];
