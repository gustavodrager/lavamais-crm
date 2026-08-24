"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { ErroCrmApi } from "@/infraestrutura/crm-api-http";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";
import { obterPortaSessao } from "@/infraestrutura/obter-porta-sessao";

const esquema = z.object({
  nome: z.string().trim().min(3).max(160),
  objetivo: z.string().trim().min(10).max(500),
  itemDeCatalogoId: z.string().uuid().nullable(),
});

export type EntradaCriarRascunho = z.input<typeof esquema>;
export type FalhaCriarRascunho = {
  sucesso: false;
  mensagem: string;
  campos?: Partial<Record<keyof EntradaCriarRascunho, string>>;
};

export async function criarRascunho(entrada: EntradaCriarRascunho): Promise<FalhaCriarRascunho> {
  const sessao = await obterPortaSessao().obterSessao();
  if (!sessao) redirect("/entrar?retorno=/acoes-comerciais/nova");

  const validacao = esquema.safeParse(entrada);
  if (!validacao.success) {
    const campos = validacao.error.flatten().fieldErrors;
    return {
      sucesso: false,
      mensagem: "Revise os campos informados.",
      campos: {
        nome: campos.nome?.[0],
        objetivo: campos.objetivo?.[0],
        itemDeCatalogoId: campos.itemDeCatalogoId?.[0],
      },
    };
  }

  let id: string;
  try {
    const resultado = await obterPortaCrmApi().criar({
      ...validacao.data,
      versaoModeloId: null,
      criterios: {
        versaoSchema: 2,
        modo: "Filtros",
        tipoCliente: null,
        cidades: null,
        bairros: null,
        etiquetaIds: null,
        cadastradoApartirDe: null,
        dataNascimentoDe: null,
        dataNascimentoAte: null,
        clienteIds: null,
        clienteIdsExcluidos: null,
      },
    });
    id = resultado.id;
  } catch (erro) {
    if (erro instanceof ErroCrmApi) {
      const mensagem = erro.status === 401
        ? "Sua sessão expirou. Entre novamente para criar a ação."
        : erro.status === 403
          ? "Seu perfil não possui permissão para criar Ações Comerciais."
          : erro.status === 409
            ? "A ação entrou em conflito com uma alteração recente. Tente novamente."
            : erro.status === 422
              ? erro.message
              : erro.status === 503
                ? "A CRM API está indisponível. Tente novamente em alguns instantes."
                : "Não foi possível criar o rascunho. Revise os dados e tente novamente.";
      return { sucesso: false, mensagem };
    }
    throw erro;
  }

  redirect(`/acoes-comerciais/${id}`);
}
