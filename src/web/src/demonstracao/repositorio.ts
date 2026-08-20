import { acoesDemonstracao, clientesDemonstracao } from "@/demonstracao/dados";
import type { PortaCrmApi } from "@/portas/crm-api";

export const repositorioDemonstracao: PortaCrmApi = {
  async listarItensDeCatalogoAtivos() {
    return [
      { id: "6d3d0d64-a111-4cff-8db8-111111111112", nome: "Lavagem de edredom", tipo: "Servico", categoria: "Casa" },
      { id: "9a842a55-b222-41ab-86f2-222222222223", nome: "Lavagem de terno", tipo: "Servico", categoria: "Vestuário" },
    ];
  },
  async listarAcoes() {
    return { itens: acoesDemonstracao, pagina: 1, tamanhoPagina: 20, total: acoesDemonstracao.length };
  },
  async obter(id) {
    const acao = acoesDemonstracao.find((item) => item.id === id);
    return acao ? { ...acao, totais: { destinatarios: acao.totalDestinatarios ?? 0, enviados: 0, entregues: 0, lidos: 0, falhos: 0, convertidos: 0, valorConvertido: 0 } } : null;
  },
  async criar() {
    return { id: crypto.randomUUID() };
  },
  async listarClientes() {
    return { itens: clientesDemonstracao, pagina: 1, tamanhoPagina: 20, total: clientesDemonstracao.length };
  },
};
import "server-only";
