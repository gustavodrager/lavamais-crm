"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { modelosPadraoLavaMais } from "@/conteudo/modelos-padrao-lavamais";
import { ErroCrmApi } from "@/infraestrutura/crm-api-http";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";
import { obterPortaSessao } from "@/infraestrutura/obter-porta-sessao";

export type ResultadoPublicacaoMensagem =
  | { sucesso: true; mensagem: string }
  | { sucesso: false; mensagem: string };

export async function aprovarEDisponibilizarMensagem(entrada: {
  modeloPadraoId: string;
  nome: string;
  conteudoPreVisualizacao: string;
}): Promise<ResultadoPublicacaoMensagem> {
  const sessao = await obterPortaSessao().obterSessao();
  if (!sessao) redirect("/entrar?retorno=%2Facoes-comerciais%3Fvisao%3Dmensagens");
  if (sessao.papel !== "Administrador" && sessao.papel !== "Gerente") {
    return { sucesso: false, mensagem: "Somente administradores e gerentes podem aprovar e disponibilizar mensagens." };
  }

  const validacao = z.object({
    modeloPadraoId: z.string().trim().min(1).max(80),
    nome: z.string().trim().min(2).max(160),
    conteudoPreVisualizacao: z.string().trim().min(5).max(2000),
  }).safeParse(entrada);
  if (!validacao.success) return { sucesso: false, mensagem: "Revise o nome e o texto da mensagem." };

  const modeloPadrao = modelosPadraoLavaMais.find((modelo) => modelo.id === validacao.data.modeloPadraoId);
  if (!modeloPadrao) return { sucesso: false, mensagem: "Escolha uma mensagem sugerida pela LavaMais." };

  const variaveis = [...validacao.data.conteudoPreVisualizacao.matchAll(/{{([^{}]+)}}/g)].map((item) => item[1]);
  const conteudoSemVariaveis = validacao.data.conteudoPreVisualizacao.replace(/{{[^{}]+}}/g, "");
  if (conteudoSemVariaveis.includes("{{") || conteudoSemVariaveis.includes("}}")) {
    return { sucesso: false, mensagem: "Revise os campos automáticos da mensagem antes de aprová-la." };
  }
  if (variaveis.some((variavel) => variavel !== "nomeCliente" && variavel !== "itemCatalogo")) {
    return { sucesso: false, mensagem: "O texto possui um campo automático não permitido." };
  }

  try {
    await obterPortaCrmApi().criarEPublicarModelo({
      nome: validacao.data.nome,
      conteudoPreVisualizacao: validacao.data.conteudoPreVisualizacao,
    });
    revalidatePath("/acoes-comerciais");
    return { sucesso: true, mensagem: `A mensagem “${validacao.data.nome}” foi aprovada e disponibilizada.` };
  } catch (erro) {
    if (erro instanceof ErroCrmApi) {
      if (erro.status === 403) return { sucesso: false, mensagem: "Seu perfil não possui permissão para publicar mensagens." };
      if (erro.status === 409 || erro.status === 422) return { sucesso: false, mensagem: erro.message };
      return { sucesso: false, mensagem: "Não foi possível disponibilizar a mensagem agora." };
    }
    throw erro;
  }
}
