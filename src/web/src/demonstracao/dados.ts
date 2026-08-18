import type { ResumoAcaoComercial, ResumoCliente } from "@/contratos/apresentacao";

export const acoesDemonstracao: ResumoAcaoComercial[] = [
  { id: "6d3d0d64-a111-4cff-8db8-111111111111", nome: "Cuidados com edredons", objetivo: null, itemDeCatalogoId: "6d3d0d64-a111-4cff-8db8-111111111112", situacao: "EmProcessamento", totalDestinatarios: 84, dataAtualizacao: "2026-08-14T14:30:00Z" },
  { id: "9a842a55-b222-41ab-86f2-222222222222", nome: "Higienizacao de ternos", objetivo: null, itemDeCatalogoId: "9a842a55-b222-41ab-86f2-222222222223", situacao: "Preparada", totalDestinatarios: 31, dataAtualizacao: "2026-08-13T17:10:00Z" },
  { id: "bb19f233-c333-42dc-9a26-333333333333", nome: "Boas-vindas de agosto", objetivo: null, itemDeCatalogoId: "bb19f233-c333-42dc-9a26-333333333334", situacao: "Concluida", totalDestinatarios: 126, dataAtualizacao: "2026-08-08T12:00:00Z" },
];

export const clientesDemonstracao: ResumoCliente[] = [
  { id: "1", nome: "Ana Martins", whatsapp: "+55 13 99123-4567", localidade: "Boqueirao, Praia Grande", etiquetas: ["Edredom", "Residencial"], permiteWhatsapp: true },
  { id: "2", nome: "Carlos Almeida", whatsapp: "+55 13 98845-2201", localidade: "Guilhermina, Praia Grande", etiquetas: ["Corporativo"], permiteWhatsapp: true },
  { id: "3", nome: "Patricia Souza", whatsapp: "+55 13 99774-8032", localidade: "Canto do Forte, Praia Grande", etiquetas: ["Ternos"], permiteWhatsapp: false },
];
