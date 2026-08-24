export const bairrosAtendidosPorCidade = {
  "Praia Grande": [
    "Aviação",
    "Boqueirão",
    "Canto do Forte",
    "Glória",
    "Guilhermina",
    "Militar",
    "Sítio do Campo",
    "Tude Bastos",
    "Xixová",
  ],
} as const;

export type CidadeAtendida = keyof typeof bairrosAtendidosPorCidade;
export const cidadesAtendidas = Object.keys(bairrosAtendidosPorCidade) as CidadeAtendida[];
