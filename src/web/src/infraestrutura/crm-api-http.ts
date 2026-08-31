import "server-only";

import { z } from "zod";
import type { CriarAcaoComercialEntrada, DadosMutaveisCliente, PortaCrmApi } from "@/portas/crm-api";
import type { CriteriosDeSegmentacao } from "@/contratos/apresentacao";
import type { ResultadoComercial } from "@/contratos/apresentacao";

const esquemaSituacao = z.enum(["Rascunho", "Preparada", "EmProcessamento", "Concluida", "ConcluidaComFalhas", "Cancelada"]);
const esquemaCriterios = z.object({
  versaoSchema: z.union([z.literal(1), z.literal(2)]),
  modo: z.enum(["Filtros", "Manual"]),
  tipoCliente: z.string().nullable(),
  cidades: z.array(z.string()).nullable(),
  bairros: z.array(z.string()).nullable(),
  etiquetaIds: z.array(z.string().uuid()).nullable(),
  cadastradoApartirDe: z.string().datetime({ offset: true }).nullable(),
  dataNascimentoDe: z.string().nullable(),
  dataNascimentoAte: z.string().nullable(),
  clienteIds: z.array(z.string().uuid()).nullable(),
  clienteIdsExcluidos: z.array(z.string().uuid()).nullable().default(null),
});
const esquemaAcaoApi = z.object({
  id: z.string().uuid(), nome: z.string(), objetivo: z.string().nullable(),
  itemDeCatalogoId: z.string().uuid().nullable(), versaoModeloId: z.string().uuid().nullable(),
  criterios: esquemaCriterios, situacao: esquemaSituacao,
  dataAtualizacao: z.string().datetime({ offset: true }),
  versao: z.number().int().nonnegative(), quantidadeDestinatarios: z.number().int().nonnegative().optional(),
  mensagensParaEnviar: z.number().int().nonnegative().default(0),
  falhasParaRevisar: z.number().int().nonnegative().default(0),
  retornosParaRegistrar: z.number().int().nonnegative().default(0),
  resultadosRegistrados: z.number().int().nonnegative().default(0),
});
const esquemaTotais = z.object({
  destinatarios: z.number().int().nonnegative(), pendentes: z.number().int().nonnegative(), aguardandoSolicitacao: z.number().int().nonnegative(), solicitados: z.number().int().nonnegative(), enviados: z.number().int().nonnegative(),
  entregues: z.number().int().nonnegative(), lidos: z.number().int().nonnegative(),
  falhos: z.number().int().nonnegative(), naoInformados: z.number().int().nonnegative(), semRetorno: z.number().int().nonnegative(), responderam: z.number().int().nonnegative(), interessados: z.number().int().nonnegative(), convertidos: z.number().int().nonnegative(), semInteresse: z.number().int().nonnegative(),
  valorConvertido: z.number().nonnegative(),
}).passthrough();
const esquemaDestinatario = z.object({
  id: z.string().uuid(), clienteId: z.string().uuid(), nomeCliente: z.string(), destino: z.string(), conteudoPreVisualizacao: z.string(),
  situacaoEnvio: z.enum(["Pendente", "AguardandoSolicitacao", "Solicitado", "Enviado", "Entregue", "Lido", "Falhou"]),
  resultadoComercial: z.enum(["NaoInformado", "SemRetorno", "Respondeu", "Interessado", "Convertido", "NaoTemInteresse"]),
  valorConvertido: z.number().nullable(), dataResultadoComercial: z.string().datetime({ offset: true }).nullable(), codigoFalha: z.string().nullable(), versao: z.number().int().nonnegative(),
});
const esquemaDetalhe = z.object({ acao: esquemaAcaoApi, totais: esquemaTotais, destinatarios: z.array(esquemaDestinatario) }).passthrough();
const esquemaClienteApi = z.object({
  id: z.string().uuid(), nome: z.string(), nomeFantasia: z.string().nullable(), whatsapp: z.string(), email: z.string().nullable(), dataNascimento: z.string().nullable(), tipo: z.string().nullable(), situacao: z.enum(["Ativo", "Inativo"]), permiteMarketingWhatsapp: z.boolean(),
  endereco: z.object({ logradouro: z.string().nullable(), numero: z.string().nullable(), complemento: z.string().nullable(), bairro: z.string().nullable(), cidade: z.string().nullable(), estado: z.string().nullable(), cep: z.string().nullable() }).nullable(),
  etiquetaIds: z.array(z.string().uuid()), codigoExterno: z.string().nullable(), dataCadastroOrigem: z.string().datetime({ offset: true }).nullable(),
  dataCriacao: z.string().datetime({ offset: true }), dataAtualizacao: z.string().datetime({ offset: true }),
}).passthrough();
const esquemaItemDeCatalogo = z.object({
  id: z.string().uuid(),
  tipo: z.enum(["Produto", "Servico"]),
  nome: z.string().min(1),
  categoria: z.string().nullable(),
  situacao: z.enum(["Ativo", "Inativo"]),
  valorReferencia: z.number().nullable().optional(),
  codigoExterno: z.string().nullable().optional(),
});
const esquemaPaginado = <T extends z.ZodType>(item: T) => z.object({ itens: z.array(item), pagina: z.number().int().positive(), tamanhoPagina: z.number().int().positive(), total: z.number().int().nonnegative() });
const esquemaCriacao = z.object({ id: z.string().uuid() });
const esquemaPreVisualizacaoImportacao = z.object({ referenciaArquivo: z.string().uuid(), colunas: z.array(z.string()), totalLinhas: z.number().int().nonnegative(), amostra: z.array(z.object({ numero: z.number().int().positive(), valores: z.array(z.string()), erros: z.array(z.string()) }).passthrough()) });
const esquemaResultadoImportacao = z.object({
  id: z.string().uuid(),
  situacao: z.string(),
  totalLinhas: z.number().int().nonnegative(),
  totalInseridas: z.number().int().nonnegative(),
  totalAtualizadas: z.number().int().nonnegative(),
  totalRejeitadas: z.number().int().nonnegative(),
  linhas: z.array(z.object({
    numero: z.number().int().positive(),
    resultado: z.string(),
    clienteId: z.string().uuid().nullable(),
    erro: z.string().nullable(),
  })),
}).passthrough();
const esquemaEtiqueta = z.object({ id: z.string().uuid(), nome: z.string() });
const esquemaEnvioIndividual = z.object({ id: z.string().uuid(), situacaoEnvio: z.literal("AguardandoSolicitacao"), versao: z.number().int().nonnegative() });
const esquemaCapacidades = z.object({ envioNotificacoesHabilitado: z.boolean() });
const esquemaSimulacao = z.object({
  quantidadeEncontrada: z.number().int().nonnegative(),
  quantidadeElegivel: z.number().int().nonnegative(),
  pagina: z.number().int().positive(),
  tamanhoPagina: z.number().int().positive(),
  clientes: z.array(z.object({
    clienteId: z.string().uuid(),
    nome: z.string(),
    whatsapp: z.string().nullable(),
    elegivel: z.boolean(),
    motivoExclusao: z.enum(["ClienteInativo", "ContatoInvalido", "SemPermissao", "ContatoDuplicado", "ExcluidoManualmente"]).nullable(),
  })),
});
const esquemaModelo = z.object({
  id: z.string().uuid(),
  nome: z.string().min(1),
  canal: z.literal("Whatsapp"),
  situacao: z.enum(["Rascunho", "Publicado", "Inativo"]),
  versaoAtualId: z.string().uuid().nullable(),
  versoes: z.array(z.object({
    id: z.string().uuid(), numero: z.number().int().positive(), conteudoPreVisualizacao: z.string(),
    variaveis: z.array(z.string()), chaveTemplateNotificacao: z.string(), dataPublicacao: z.string().datetime({ offset: true }),
  })),
});
const esquemaMovimentacao = z.object({
  id: z.string().uuid(), clienteId: z.string().uuid(), nomeCliente: z.string(),
  valorTotal: z.number().nonnegative(), dataMovimentacao: z.string().datetime({ offset: true }), codigoExterno: z.string().nullable(), observacao: z.string().nullable(),
  origem: z.enum(["Recepcao", "ImportacaoEssence", "IntegracaoEssence"]), situacao: z.enum(["Registrada", "Cancelada"]),
  versao: z.number().int().nonnegative(),
  linhas: z.array(z.object({
    id: z.string().uuid(), ofertaDeServicoId: z.string().uuid(), artigoDeLavanderiaId: z.string().uuid(), nomeArtigo: z.string(),
    servicoDeLavanderiaId: z.string().uuid(), nomeServico: z.string(), quantidade: z.number().int().positive(),
    precoTabela: z.number().nonnegative(), precoUnitario: z.number().nonnegative(), subtotal: z.number().nonnegative(),
  })),
});
const esquemaOfertaDoCatalogoDeLavanderia = z.object({
  id: z.string().uuid(), artigoDeLavanderiaId: z.string().uuid(), nomeArtigo: z.string(), categoria: z.string(),
  servicoDeLavanderiaId: z.string().uuid(), nomeServico: z.string(), precoUnitario: z.number().nonnegative(),
  situacao: z.literal("Ativo"), versao: z.number().int().nonnegative(),
});
const esquemaRoteiro = z.object({
  id: z.string().uuid(), data: z.string(), nomeMotorista: z.string(), situacao: z.enum(["EmPreparacao", "Publicado", "EmAndamento", "Finalizado"]), versao: z.number().int().nonnegative(),
  paradas: z.array(z.object({ id: z.string().uuid(), clienteId: z.string().uuid(), nomeCliente: z.string(), whatsapp: z.string(), enderecoCompleto: z.string(), tipo: z.enum(["Coleta", "Entrega"]), periodo: z.string(), observacao: z.string().nullable(), ordem: z.number().int().positive(), situacao: z.enum(["Pendente", "EmDeslocamento", "Concluida", "NaoRealizada"]), motivoNaoRealizacao: z.string().nullable(), dataInicio: z.string().datetime({ offset: true }).nullable(), dataConclusao: z.string().datetime({ offset: true }).nullable() })),
});

interface ProblemDetails {
  title?: string;
  detail?: string;
  status?: number;
  traceId?: string;
}

export class ErroCrmApi extends Error {
  constructor(public readonly status: number, message: string, public readonly identificador?: string) {
    super(message);
    this.name = "ErroCrmApi";
  }
}

type ObterAccessToken = () => Promise<string | null>;

export class CrmApiHttp implements PortaCrmApi {
  constructor(private readonly urlBase: string, private readonly obterAccessToken: ObterAccessToken) {}

  async obterCapacidades() {
    return esquemaCapacidades.parse(await this.requisitar("/api/v1/capacidades"));
  }

  async listarAcoes() {
    const itens = z.array(esquemaAcaoApi).parse(await this.requisitar("/api/v1/acoes-comerciais"));
    return { itens: itens.map((acao) => ({ ...acao, totalDestinatarios: acao.quantidadeDestinatarios ?? null })), pagina: 1, tamanhoPagina: itens.length, total: itens.length };
  }

  async obter(id: string) {
    const resposta = await this.requisitar(`/api/v1/acoes-comerciais/${encodeURIComponent(id)}`, { aceitarNaoEncontrado: true });
    if (resposta === null) return null;
    const detalhe = esquemaDetalhe.parse(resposta);
    return { ...detalhe.acao, totalDestinatarios: detalhe.totais.destinatarios, totais: detalhe.totais, destinatarios: detalhe.destinatarios };
  }

  async listarClientes(busca?: string, pagina = 1, tamanhoPagina = 20) {
    const parametros = new URLSearchParams({ pagina: String(pagina), tamanhoPagina: String(tamanhoPagina) }); if (busca) parametros.set("busca", busca);
    const resultado = esquemaPaginado(esquemaClienteApi).parse(await this.requisitar(`/api/v1/clientes?${parametros}`));
    return { ...resultado, itens: resultado.itens.map((cliente) => ({ id: cliente.id, nome: cliente.nome, whatsapp: cliente.whatsapp, localidade: [cliente.endereco?.bairro, cliente.endereco?.cidade].filter(Boolean).join(" · ") || "Não informada", quantidadeEtiquetas: cliente.etiquetaIds.length, permiteWhatsapp: cliente.permiteMarketingWhatsapp, temEnderecoOperacional: Boolean(cliente.endereco?.logradouro && cliente.endereco?.numero && cliente.endereco?.cidade), situacao: cliente.situacao, codigoExterno: cliente.codigoExterno })) };
  }

  async obterCliente(id: string) {
    const resposta = await this.requisitar(`/api/v1/clientes/${encodeURIComponent(id)}`, { aceitarNaoEncontrado: true });
    if (resposta === null) return null;
    const cliente = esquemaClienteApi.parse(resposta);
    return { ...cliente, localidade: [cliente.endereco?.bairro, cliente.endereco?.cidade].filter(Boolean).join(" · ") || "Não informada", quantidadeEtiquetas: cliente.etiquetaIds.length, permiteWhatsapp: cliente.permiteMarketingWhatsapp };
  }

  async criarCliente(entrada: DadosMutaveisCliente) {
    return esquemaCriacao.parse(await this.requisitar("/api/v1/clientes", { metodo: "POST", corpo: entrada }));
  }

  async atualizarCliente(id: string, entrada: DadosMutaveisCliente) {
    await this.requisitar(`/api/v1/clientes/${encodeURIComponent(id)}`, { metodo: "PUT", corpo: entrada });
  }

  async listarItensDeCatalogoAtivos() {
    const itens = z.array(esquemaItemDeCatalogo).parse(
      await this.requisitar("/api/v1/itens-de-catalogo?situacao=Ativo"),
    );
    return itens.map(({ id, nome, tipo, categoria }) => ({ id, nome, tipo, categoria }));
  }

  async listarCatalogo() {
    const itens = z.array(esquemaItemDeCatalogo).parse(await this.requisitar("/api/v1/itens-de-catalogo"));
    return itens.map((item) => ({ id: item.id, nome: item.nome, tipo: item.tipo, categoria: item.categoria, valorReferencia: item.valorReferencia ?? null, situacao: item.situacao, codigoExterno: item.codigoExterno ?? null }));
  }

  async criarServico(entrada: { nome: string; categoria: string | null; valorReferencia: number | null; codigoExterno: string | null }) {
    return esquemaCriacao.parse(await this.requisitar("/api/v1/itens-de-catalogo", { metodo: "POST", corpo: { tipo: "Servico", descricao: null, situacao: "Ativo", dataCadastroOrigem: null, ...entrada } }));
  }

  async listarMovimentacoes(clienteId?: string, limite = 30) {
    const parametros = new URLSearchParams({ limite: String(limite) }); if (clienteId) parametros.set("clienteId", clienteId);
    const movimentacoes = z.array(esquemaMovimentacao).parse(await this.requisitar(`/api/v1/movimentacoes-comerciais?${parametros}`));
    return [...movimentacoes].sort((a, b) => new Date(b.dataMovimentacao).getTime() - new Date(a.dataMovimentacao).getTime());
  }

  async listarOfertasDoCatalogoDeLavanderia() {
    const ofertas = z.array(esquemaOfertaDoCatalogoDeLavanderia).parse(await this.requisitar("/api/v1/catalogo-lavanderia/ofertas"));
    return ofertas.map(({ id, artigoDeLavanderiaId, nomeArtigo, categoria, servicoDeLavanderiaId, nomeServico, precoUnitario }) => ({ id, artigoDeLavanderiaId, nomeArtigo, categoria, servicoDeLavanderiaId, nomeServico, precoUnitario }));
  }
  async carregarCatalogoInicialDeLavanderia() {
    return z.object({ artigosCriados: z.number().int().nonnegative(), servicosCriados: z.number().int().nonnegative(), ofertasCriadas: z.number().int().nonnegative() }).parse(await this.requisitar("/api/v1/catalogo-lavanderia/carga-inicial", { metodo: "POST" }));
  }

  async registrarMovimentacao(entrada: { clienteId: string; linhas: Array<{ ofertaDeServicoId: string; quantidade: number; precoUnitario: number | null }>; dataMovimentacao: string | null; codigoExterno: string | null; observacao: string | null }) {
    return esquemaCriacao.parse(await this.requisitar("/api/v1/movimentacoes-comerciais", { metodo: "POST", corpo: entrada }));
  }
  async cancelarMovimentacao(id: string, motivo: string, versao: number) {
    await this.requisitar(`/api/v1/movimentacoes-comerciais/${encodeURIComponent(id)}/cancelar`, { metodo: "POST", corpo: { motivo, versao } });
  }

  async obterRoteiro(data: string) { const resposta = await this.requisitar(`/api/v1/roteiros?data=${encodeURIComponent(data)}`, { aceitarNaoEncontrado: true }); return resposta === null ? null : esquemaRoteiro.parse(resposta); }
  async criarRoteiro(data: string, nomeMotorista: string) { return esquemaCriacao.parse(await this.requisitar("/api/v1/roteiros", { metodo: "POST", corpo: { data, nomeMotorista } })); }
  async atualizarMotorista(roteiroId: string, nomeMotorista: string, versao: number) { await this.requisitar(`/api/v1/roteiros/${encodeURIComponent(roteiroId)}`, { metodo: "PUT", corpo: { nomeMotorista, versao } }); }
  async excluirRoteiro(roteiroId: string, versao: number) { await this.requisitar(`/api/v1/roteiros/${encodeURIComponent(roteiroId)}`, { metodo: "DELETE", corpo: { versao } }); }
  async adicionarParada(roteiroId: string, entrada: { clienteId: string; tipo: "Coleta" | "Entrega"; periodo: string; observacao: string | null; versao: number }) { await this.requisitar(`/api/v1/roteiros/${encodeURIComponent(roteiroId)}/paradas`, { metodo: "POST", corpo: entrada }); }
  async atualizarParada(roteiroId: string, paradaId: string, entrada: { tipo: "Coleta" | "Entrega"; periodo: string; observacao: string | null; versao: number }) { await this.requisitar(`/api/v1/roteiros/${encodeURIComponent(roteiroId)}/paradas/${encodeURIComponent(paradaId)}`, { metodo: "PUT", corpo: entrada }); }
  async removerParada(roteiroId: string, paradaId: string, versao: number) { await this.requisitar(`/api/v1/roteiros/${encodeURIComponent(roteiroId)}/paradas/${encodeURIComponent(paradaId)}`, { metodo: "DELETE", corpo: { versao } }); }
  async reordenarParadas(roteiroId: string, paradaIds: string[], versao: number) { await this.requisitar(`/api/v1/roteiros/${encodeURIComponent(roteiroId)}/ordem`, { metodo: "PUT", corpo: { paradaIds, versao } }); }
  async publicarRoteiro(roteiroId: string, versao: number) { await this.requisitar(`/api/v1/roteiros/${encodeURIComponent(roteiroId)}/publicar`, { metodo: "POST", corpo: { versao } }); }
  async iniciarParada(id: string, versao: number) { await this.requisitar(`/api/v1/roteiros/paradas/${encodeURIComponent(id)}/iniciar`, { metodo: "POST", corpo: { versao } }); }
  async concluirParada(id: string, versao: number) { await this.requisitar(`/api/v1/roteiros/paradas/${encodeURIComponent(id)}/concluir`, { metodo: "POST", corpo: { versao } }); }
  async adiarParada(id: string, versao: number) { await this.requisitar(`/api/v1/roteiros/paradas/${encodeURIComponent(id)}/adiar`, { metodo: "POST", corpo: { versao } }); }
  async naoRealizarParada(id: string, motivo: string, versao: number) { await this.requisitar(`/api/v1/roteiros/paradas/${encodeURIComponent(id)}/nao-realizar`, { metodo: "POST", corpo: { motivo, versao } }); }

  async listarEtiquetas() { return z.array(esquemaEtiqueta).parse(await this.requisitar("/api/v1/etiquetas")); }
  async criarEtiqueta(nome: string) { return esquemaCriacao.parse(await this.requisitar("/api/v1/etiquetas", { metodo: "POST", corpo: { nome } })); }

  async criarEPublicarModelo(entrada: { nome: string; conteudoPreVisualizacao: string; chaveTemplateNotificacao: string }) {
    const modelo = esquemaCriacao.parse(await this.requisitar("/api/v1/modelos-de-mensagem", { metodo: "POST", corpo: { nome: entrada.nome } }));
    const variaveis = ["nomeCliente", "itemCatalogo"].filter((variavel) => entrada.conteudoPreVisualizacao.includes(`{{${variavel}}}`));
    await this.requisitar(`/api/v1/modelos-de-mensagem/${modelo.id}/publicar`, { metodo: "POST", corpo: { conteudoPreVisualizacao: entrada.conteudoPreVisualizacao, variaveis, chaveTemplateNotificacao: entrada.chaveTemplateNotificacao } });
    return modelo;
  }

  async preVisualizarImportacao(arquivo: File) {
    const dados = new FormData(); dados.set("arquivo", arquivo);
    const parametros = new URLSearchParams({ mapeamento: JSON.stringify(this.mapeamentoPadraoImportacao()) });
    return esquemaPreVisualizacaoImportacao.parse(await this.requisitarFormulario(`/api/v1/importacoes/clientes/pre-visualizar?${parametros}`, dados));
  }

  async confirmarImportacao(referenciaArquivo: string) {
    return esquemaResultadoImportacao.parse(await this.requisitar("/api/v1/importacoes/clientes", { metodo: "POST", corpo: { referenciaArquivo, mapeamento: this.mapeamentoPadraoImportacao() } }));
  }

  async listarModelosPublicados() {
    const modelos = z.array(esquemaModelo).parse(await this.requisitar("/api/v1/modelos-de-mensagem"));
    return modelos.flatMap((modelo) => {
      if (modelo.situacao !== "Publicado" || !modelo.versaoAtualId) return [];
      const versao = modelo.versoes.find((item) => item.id === modelo.versaoAtualId);
      return versao ? [{ modeloId: modelo.id, versaoId: versao.id, nome: modelo.nome, numeroVersao: versao.numero, canal: modelo.canal, conteudoPreVisualizacao: versao.conteudoPreVisualizacao, variaveis: versao.variaveis }] : [];
    });
  }

  async criar(entrada: CriarAcaoComercialEntrada) {
    return esquemaCriacao.parse(await this.requisitar("/api/v1/acoes-comerciais", { metodo: "POST", corpo: entrada }));
  }
  async atualizarAcao(id: string, entrada: CriarAcaoComercialEntrada) {
    await this.requisitar(`/api/v1/acoes-comerciais/${encodeURIComponent(id)}`, { metodo: "PUT", corpo: entrada });
  }

  async atualizarCriterios(id: string, criterios: CriteriosDeSegmentacao) {
    const acao = await this.obter(id);
    if (!acao) throw new ErroCrmApi(404, "A Ação Comercial não foi encontrada.");
    await this.requisitar(`/api/v1/acoes-comerciais/${encodeURIComponent(id)}`, {
      metodo: "PUT",
      corpo: {
        nome: acao.nome,
        objetivo: acao.objetivo,
        itemDeCatalogoId: acao.itemDeCatalogoId,
        versaoModeloId: acao.versaoModeloId,
        criterios,
      },
    });
  }

  async atualizarModelo(id: string, versaoModeloId: string) {
    const acao = await this.obter(id);
    if (!acao) throw new ErroCrmApi(404, "A Ação Comercial não foi encontrada.");
    await this.requisitar(`/api/v1/acoes-comerciais/${encodeURIComponent(id)}`, { metodo: "PUT", corpo: { nome: acao.nome, objetivo: acao.objetivo, itemDeCatalogoId: acao.itemDeCatalogoId, versaoModeloId, criterios: acao.criterios } });
  }

  async preparar(id: string, versao: number) {
    await this.requisitar(`/api/v1/acoes-comerciais/${encodeURIComponent(id)}/preparar`, { metodo: "POST", corpo: { versao } });
  }
  async cancelarAcao(id: string, motivo: string, versao: number) {
    await this.requisitar(`/api/v1/acoes-comerciais/${encodeURIComponent(id)}/cancelar`, { metodo: "POST", corpo: { motivo, versao } });
  }

  async enviarDestinatario(id: string, destinatarioId: string, versao: number) {
    return esquemaEnvioIndividual.parse(await this.requisitar(`/api/v1/acoes-comerciais/${encodeURIComponent(id)}/destinatarios/${encodeURIComponent(destinatarioId)}/enviar`, { metodo: "POST", corpo: { versao } }));
  }

  async registrarResultado(id: string, destinatarioId: string, resultado: Exclude<ResultadoComercial, "NaoInformado">, valorConvertido: number | null, versao: number) {
    await this.requisitar(`/api/v1/acoes-comerciais/${encodeURIComponent(id)}/destinatarios/${encodeURIComponent(destinatarioId)}/resultado`, { metodo: "PUT", corpo: { resultado, valorConvertido, versao } });
  }

  async simularPublico(id: string, pagina = 1, tamanhoPagina = 20) {
    const parametros = new URLSearchParams({ pagina: String(pagina), tamanhoPagina: String(tamanhoPagina) });
    return esquemaSimulacao.parse(await this.requisitar(
      `/api/v1/acoes-comerciais/${encodeURIComponent(id)}/simular-publico?${parametros}`,
      { metodo: "POST" },
    ));
  }

  private async requisitar(caminho: string, opcoes: { metodo?: "GET" | "POST" | "PUT" | "DELETE"; corpo?: unknown; aceitarNaoEncontrado?: boolean } = {}) {
    const token = await this.obterAccessToken();
    if (!token) throw new ErroCrmApi(401, "Sessao indisponivel para acessar a CRM API.");
    let resposta: Response;
    try {
      resposta = await fetch(new URL(caminho, this.urlBase), {
      method: opcoes.metodo ?? "GET",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json", ...(opcoes.corpo ? { "Content-Type": "application/json" } : {}) },
      body: opcoes.corpo ? JSON.stringify(opcoes.corpo) : undefined,
      cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });
    } catch (erro) {
      throw new ErroCrmApi(503, "A CRM API esta indisponivel no momento.", erro instanceof Error ? erro.name : undefined);
    }
    if (resposta.status === 404 && opcoes.aceitarNaoEncontrado) return null;
    if (!resposta.ok) {
      const problema = await resposta.json().catch(() => ({})) as ProblemDetails;
      throw new ErroCrmApi(resposta.status, problema.detail ?? problema.title ?? "A CRM API nao concluiu a solicitacao.", problema.traceId);
    }
    if (resposta.status === 204) return null;
    return resposta.json() as Promise<unknown>;
  }

  private mapeamentoPadraoImportacao() {
    return { nome: "nome", whatsapp: "whatsapp", email: "email", bairro: "bairro", cidade: "cidade", tipo: "tipo", permiteMarketingWhatsapp: "permiteMarketingWhatsapp", codigoExterno: "codigoExterno", dataCadastroOrigem: "dataCadastroOrigem", dddPadrao: 13, permiteMarketingWhatsappPadrao: false };
  }

  private async requisitarFormulario(caminho: string, dados: FormData) {
    const token = await this.obterAccessToken(); if (!token) throw new ErroCrmApi(401, "Sessao indisponivel para acessar a CRM API.");
    let resposta: Response;
    try { resposta = await fetch(new URL(caminho, this.urlBase), { method: "POST", headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }, body: dados, cache: "no-store", signal: AbortSignal.timeout(30_000) }); }
    catch (erro) { throw new ErroCrmApi(503, "A CRM API esta indisponivel no momento.", erro instanceof Error ? erro.name : undefined); }
    if (!resposta.ok) { const problema = await resposta.json().catch(() => ({})) as ProblemDetails; throw new ErroCrmApi(resposta.status, problema.detail ?? problema.title ?? "A CRM API nao concluiu a solicitacao.", problema.traceId); }
    return resposta.json() as Promise<unknown>;
  }
}
