"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { ErroCrmApi } from "@/infraestrutura/crm-api-http";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";
import { obterPortaSessao } from "@/infraestrutura/obter-porta-sessao";
import { papelDaVisao } from "@/lib/sessao-apresentacao";

export async function criarAcaoDaSugestao(codigo: string): Promise<{ sucesso: false; mensagem: string }> {
  const validacao = z.string().trim().min(3).max(80).safeParse(codigo);
  if (!validacao.success) return { sucesso: false, mensagem: "A sugestão informada é inválida." };
  const sessao = await obterPortaSessao().obterSessao();
  if (!sessao) redirect("/entrar?retorno=/sugestoes-acoes");
  if (papelDaVisao(sessao) !== "Administrador") return { sucesso: false, mensagem: "Somente administradores podem gerar ações a partir das sugestões." };

  try {
    const api = obterPortaCrmApi();
    const sugestao = (await api.listarSugestoesDeAcoes()).find((item) => item.codigo === validacao.data);
    if (!sugestao || sugestao.clienteIds.length === 0) return { sucesso: false, mensagem: "Esta sugestão não possui clientes disponíveis no momento." };
    const acao = await api.criar({
      nome: sugestao.nome,
      objetivo: sugestao.motivo,
      itemDeCatalogoId: null,
      versaoModeloId: null,
      criterios: { versaoSchema: 2, modo: "Manual", tipoCliente: null, cidades: null, bairros: null, etiquetaIds: null, cadastradoApartirDe: null, dataNascimentoDe: null, dataNascimentoAte: null, clienteIds: sugestao.clienteIds, clienteIdsExcluidos: null },
    });
    redirect(`/acoes-comerciais/${acao.id}`);
  } catch (erro) {
    if (erro instanceof ErroCrmApi) return { sucesso: false, mensagem: erro.status === 403 ? "Seu perfil não possui permissão para gerar esta ação." : erro.status === 422 ? erro.message : "Não foi possível gerar a ação agora." };
    throw erro;
  }
}
