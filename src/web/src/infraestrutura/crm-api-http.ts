import "server-only";

import { z } from "zod";
import type { CriarAcaoComercialEntrada, PortaCrmApi } from "@/portas/crm-api";
import type { CriteriosDeSegmentacao } from "@/contratos/apresentacao";

const esquemaSituacao = z.enum(["Rascunho", "Preparada", "EmProcessamento", "Concluida", "ConcluidaComFalhas", "Cancelada"]);
const esquemaCriterios = z.object({
  versaoSchema: z.literal(1),
  modo: z.enum(["Filtros", "Manual"]),
  tipoCliente: z.string().nullable(),
  cidades: z.array(z.string()).nullable(),
  bairros: z.array(z.string()).nullable(),
  etiquetaIds: z.array(z.string().uuid()).nullable(),
  cadastradoApartirDe: z.string().datetime({ offset: true }).nullable(),
  dataNascimentoDe: z.string().nullable(),
  dataNascimentoAte: z.string().nullable(),
  clienteIds: z.array(z.string().uuid()).nullable(),
});
const esquemaAcaoApi = z.object({
  id: z.string().uuid(), nome: z.string(), objetivo: z.string().nullable(),
  itemDeCatalogoId: z.string().uuid(), versaoModeloId: z.string().uuid().nullable(),
  criterios: esquemaCriterios, situacao: esquemaSituacao,
  dataAtualizacao: z.string().datetime({ offset: true }),
  versao: z.number().int().nonnegative(),
});
const esquemaTotais = z.object({
  destinatarios: z.number().int().nonnegative(), pendentes: z.number().int().nonnegative(), solicitados: z.number().int().nonnegative(), enviados: z.number().int().nonnegative(),
  entregues: z.number().int().nonnegative(), lidos: z.number().int().nonnegative(),
  falhos: z.number().int().nonnegative(), convertidos: z.number().int().nonnegative(),
  valorConvertido: z.number().nonnegative(),
}).passthrough();
const esquemaDestinatario = z.object({
  id: z.string().uuid(), clienteId: z.string().uuid(), nomeCliente: z.string(), destino: z.string(), conteudoPreVisualizacao: z.string(),
  situacaoEnvio: z.enum(["Pendente", "Solicitado", "Enviado", "Entregue", "Lido", "Falhou"]),
  resultadoComercial: z.enum(["NaoInformado", "SemRetorno", "Respondeu", "Interessado", "Convertido", "NaoTemInteresse"]),
  valorConvertido: z.number().nullable(), dataResultadoComercial: z.string().datetime({ offset: true }).nullable(), codigoFalha: z.string().nullable(), versao: z.number().int().nonnegative(),
});
const esquemaDetalhe = z.object({ acao: esquemaAcaoApi, totais: esquemaTotais, destinatarios: z.array(esquemaDestinatario) }).passthrough();
const esquemaCliente = z.object({ id: z.string(), nome: z.string(), whatsapp: z.string(), localidade: z.string(), etiquetas: z.array(z.string()), permiteWhatsapp: z.boolean() });
const esquemaItemDeCatalogo = z.object({
  id: z.string().uuid(),
  tipo: z.enum(["Produto", "Servico"]),
  nome: z.string().min(1),
  categoria: z.string().nullable(),
  situacao: z.enum(["Ativo", "Inativo"]),
});
const esquemaPaginado = <T extends z.ZodType>(item: T) => z.object({ itens: z.array(item), pagina: z.number().int().positive(), tamanhoPagina: z.number().int().positive(), total: z.number().int().nonnegative() });
const esquemaCriacao = z.object({ id: z.string().uuid() });
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
    motivoExclusao: z.enum(["ClienteInativo", "ContatoInvalido", "SemPermissao", "ContatoDuplicado"]).nullable(),
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

  async listarAcoes() {
    const itens = z.array(esquemaAcaoApi).parse(await this.requisitar("/api/v1/acoes-comerciais"));
    return { itens: itens.map((acao) => ({ ...acao, totalDestinatarios: null })), pagina: 1, tamanhoPagina: itens.length, total: itens.length };
  }

  async obter(id: string) {
    const resposta = await this.requisitar(`/api/v1/acoes-comerciais/${encodeURIComponent(id)}`, { aceitarNaoEncontrado: true });
    if (resposta === null) return null;
    const detalhe = esquemaDetalhe.parse(resposta);
    return { ...detalhe.acao, totalDestinatarios: detalhe.totais.destinatarios, totais: detalhe.totais, destinatarios: detalhe.destinatarios };
  }

  async listarClientes() {
    return esquemaPaginado(esquemaCliente).parse(await this.requisitar("/api/v1/clientes"));
  }

  async listarItensDeCatalogoAtivos() {
    const itens = z.array(esquemaItemDeCatalogo).parse(
      await this.requisitar("/api/v1/itens-de-catalogo?situacao=Ativo"),
    );
    return itens.map(({ id, nome, tipo, categoria }) => ({ id, nome, tipo, categoria }));
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

  async iniciar(id: string, versao: number) {
    await this.requisitar(`/api/v1/acoes-comerciais/${encodeURIComponent(id)}/iniciar`, { metodo: "POST", corpo: { versao } });
  }

  async simularPublico(id: string, pagina = 1, tamanhoPagina = 20) {
    const parametros = new URLSearchParams({ pagina: String(pagina), tamanhoPagina: String(tamanhoPagina) });
    return esquemaSimulacao.parse(await this.requisitar(
      `/api/v1/acoes-comerciais/${encodeURIComponent(id)}/simular-publico?${parametros}`,
      { metodo: "POST" },
    ));
  }

  private async requisitar(caminho: string, opcoes: { metodo?: "GET" | "POST" | "PUT"; corpo?: unknown; aceitarNaoEncontrado?: boolean } = {}) {
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
}
