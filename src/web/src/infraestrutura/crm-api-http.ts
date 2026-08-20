import "server-only";

import { z } from "zod";
import type { CriarAcaoComercialEntrada, PortaCrmApi } from "@/portas/crm-api";

const esquemaSituacao = z.enum(["Rascunho", "Preparada", "EmProcessamento", "Concluida", "ConcluidaComFalhas", "Cancelada"]);
const esquemaAcaoApi = z.object({
  id: z.string().uuid(), nome: z.string(), objetivo: z.string().nullable(),
  itemDeCatalogoId: z.string().uuid(), situacao: esquemaSituacao,
  dataAtualizacao: z.string().datetime({ offset: true }),
});
const esquemaTotais = z.object({
  destinatarios: z.number().int().nonnegative(), enviados: z.number().int().nonnegative(),
  entregues: z.number().int().nonnegative(), lidos: z.number().int().nonnegative(),
  falhos: z.number().int().nonnegative(), convertidos: z.number().int().nonnegative(),
  valorConvertido: z.number().nonnegative(),
}).passthrough();
const esquemaDetalhe = z.object({ acao: esquemaAcaoApi, totais: esquemaTotais }).passthrough();
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
    return { ...detalhe.acao, totalDestinatarios: detalhe.totais.destinatarios, totais: detalhe.totais };
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

  async criar(entrada: CriarAcaoComercialEntrada) {
    return esquemaCriacao.parse(await this.requisitar("/api/v1/acoes-comerciais", { metodo: "POST", corpo: entrada }));
  }

  private async requisitar(caminho: string, opcoes: { metodo?: "GET" | "POST"; corpo?: unknown; aceitarNaoEncontrado?: boolean } = {}) {
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
    return resposta.json() as Promise<unknown>;
  }
}
