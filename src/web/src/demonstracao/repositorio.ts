import { acoesDemonstracao, clientesDemonstracao } from "@/demonstracao/dados";
import type { PortaCrmApi } from "@/portas/crm-api";

export const repositorioDemonstracao: PortaCrmApi = {
  async listarItensDeCatalogoAtivos() {
    return [
      { id: "6d3d0d64-a111-4cff-8db8-111111111112", nome: "Lavagem de edredom", tipo: "Servico", categoria: "Casa" },
      { id: "9a842a55-b222-41ab-86f2-222222222223", nome: "Lavagem de terno", tipo: "Servico", categoria: "Vestuário" },
    ];
  },
  async listarModelosPublicados() {
    return [{ modeloId: "6d3d0d64-a111-4cff-8db8-111111111115", versaoId: "6d3d0d64-a111-4cff-8db8-111111111116", nome: "Oferta de serviço", numeroVersao: 1, canal: "Whatsapp", conteudoPreVisualizacao: "Olá, {{nomeCliente}}! Conheça {{itemCatalogo}}.", variaveis: ["nomeCliente", "itemCatalogo"] }];
  },
  async listarAcoes() {
    return { itens: acoesDemonstracao, pagina: 1, tamanhoPagina: 20, total: acoesDemonstracao.length };
  },
  async obter(id) {
    const acao = acoesDemonstracao.find((item) => item.id === id);
    return acao ? { ...acao, totais: { destinatarios: acao.totalDestinatarios ?? 0, pendentes: 0, aguardandoSolicitacao: 0, solicitados: 0, enviados: 0, entregues: 0, lidos: 0, falhos: 0, naoInformados: 0, semRetorno: 0, responderam: 0, interessados: 0, convertidos: 0, semInteresse: 0, valorConvertido: 0 }, destinatarios: [] } : null;
  },
  async criar() {
    return { id: crypto.randomUUID() };
  },
  async atualizarCriterios() {},
  async atualizarModelo() {},
  async preparar() {},
  async enviarDestinatario(_id, destinatarioId, versao) { return { id: destinatarioId, situacaoEnvio: "AguardandoSolicitacao", versao: versao + 1 }; },
  async registrarResultado() {},
  async simularPublico() {
    return {
      quantidadeEncontrada: 2,
      quantidadeElegivel: 1,
      pagina: 1,
      tamanhoPagina: 20,
      clientes: [
        { clienteId: "6d3d0d64-a111-4cff-8db8-111111111113", nome: "Ana Martins", whatsapp: "+55 13 99123-4567", elegivel: true, motivoExclusao: null },
        { clienteId: "6d3d0d64-a111-4cff-8db8-111111111114", nome: "Patricia Souza", whatsapp: null, elegivel: false, motivoExclusao: "SemPermissao" },
      ],
    };
  },
  async listarClientes() {
    return { itens: clientesDemonstracao, pagina: 1, tamanhoPagina: 20, total: clientesDemonstracao.length };
  },
  async criarCliente() { return { id: crypto.randomUUID() }; },
  async preVisualizarImportacao() {
    return { referenciaArquivo: crypto.randomUUID(), colunas: ["nome", "whatsapp"], totalLinhas: 1, amostra: [{ numero: 2, valores: ["Ana Martins", "13999999999"], erros: [] }] };
  },
  async confirmarImportacao() { return { id: crypto.randomUUID(), situacao: "Concluida", totalLinhas: 1, totalInseridas: 1, totalAtualizadas: 0, totalRejeitadas: 0, linhas: [{ numero: 2, resultado: "Inserida", clienteId: crypto.randomUUID(), erro: null }] }; },
  async listarCatalogo() { return (await this.listarItensDeCatalogoAtivos()).map((item) => ({ ...item, valorReferencia: null, situacao: "Ativo" as const, codigoExterno: null })); },
  async criarServico() { return { id: crypto.randomUUID() }; },
  async listarEtiquetas() { return [{ id: "6d3d0d64-a111-4cff-8db8-111111111119", nome: "Residencial" }]; },
  async criarEtiqueta() { return { id: crypto.randomUUID() }; },
  async criarEPublicarModelo() { return { id: crypto.randomUUID() }; },
};
import "server-only";
