import type { ResumoAcaoComercial, ResumoCliente } from "@/contratos/apresentacao";

const criteriosVazios = {
  versaoSchema: 2 as const,
  modo: "Filtros" as const,
  tipoCliente: null,
  cidades: null,
  bairros: null,
  etiquetaIds: null,
  cadastradoApartirDe: null,
  dataNascimentoDe: null,
  dataNascimentoAte: null,
  clienteIds: null,
  clienteIdsExcluidos: null,
};

export const acoesDemonstracao: ResumoAcaoComercial[] = [
  { id: "6d3d0d64-a111-4cff-8db8-111111111111", nome: "Cuidados com edredons", objetivo: null, itemDeCatalogoId: "6d3d0d64-a111-4cff-8db8-111111111112", versaoModeloId: null, criterios: criteriosVazios, situacao: "EmProcessamento", totalDestinatarios: 84, mensagensParaEnviar: 8, retornosParaRegistrar: 14, resultadosRegistrados: 60, dataAtualizacao: "2026-08-14T14:30:00Z", versao: 1 },
  { id: "9a842a55-b222-41ab-86f2-222222222222", nome: "Higienizacao de ternos", objetivo: null, itemDeCatalogoId: "9a842a55-b222-41ab-86f2-222222222223", versaoModeloId: null, criterios: criteriosVazios, situacao: "Preparada", totalDestinatarios: 31, mensagensParaEnviar: 31, retornosParaRegistrar: 0, resultadosRegistrados: 0, dataAtualizacao: "2026-08-13T17:10:00Z", versao: 1 },
  { id: "bb19f233-c333-42dc-9a26-333333333333", nome: "Boas-vindas de agosto", objetivo: null, itemDeCatalogoId: "bb19f233-c333-42dc-9a26-333333333334", versaoModeloId: null, criterios: criteriosVazios, situacao: "Concluida", totalDestinatarios: 126, mensagensParaEnviar: 0, retornosParaRegistrar: 0, resultadosRegistrados: 126, dataAtualizacao: "2026-08-08T12:00:00Z", versao: 1 },
];

export const clientesDemonstracao: ResumoCliente[] = [
  { id: "1", nome: "Ana Martins", whatsapp: "+55 13 99123-4567", localidade: "Boqueirao, Praia Grande", quantidadeEtiquetas: 2, permiteWhatsapp: true, situacao: "Ativo", codigoExterno: "1001" },
  { id: "2", nome: "Carlos Almeida", whatsapp: "+55 13 98845-2201", localidade: "Guilhermina, Praia Grande", quantidadeEtiquetas: 1, permiteWhatsapp: true, situacao: "Ativo", codigoExterno: "1002" },
  { id: "3", nome: "Patricia Souza", whatsapp: "+55 13 99774-8032", localidade: "Canto do Forte, Praia Grande", quantidadeEtiquetas: 1, permiteWhatsapp: false, situacao: "Ativo", codigoExterno: null },
];
