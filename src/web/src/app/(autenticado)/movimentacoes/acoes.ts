"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ErroCrmApi } from "@/infraestrutura/crm-api-http";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";
import { obterPortaSessao } from "@/infraestrutura/obter-porta-sessao";

const esquema = z.object({
  clienteId: z.string().uuid(),
  itemDeCatalogoId: z.string().uuid(),
  valorTotal: z.string().trim().min(1).max(30),
  dataMovimentacao: z.string().trim().max(30),
  codigoExterno: z.string().trim().max(100),
  observacao: z.string().trim().max(500),
});

export async function registrarMovimentacao(dados: FormData) {
  if (!await obterPortaSessao().obterSessao()) redirect("/entrar?retorno=/movimentacoes");
  const validacao = esquema.safeParse(Object.fromEntries(dados));
  if (!validacao.success) redirect("/movimentacoes?erro=Revise+os+dados+da+movimentação");
  const entrada = validacao.data;
  const valorTotal = Number(entrada.valorTotal.replaceAll(".", "").replace(",", "."));
  if (!Number.isFinite(valorTotal) || valorTotal < 0) redirect("/movimentacoes?erro=Informe+um+valor+válido");
  const dataMovimentacao = entrada.dataMovimentacao ? new Date(`${entrada.dataMovimentacao}:00-03:00`).toISOString() : null;
  try {
    await obterPortaCrmApi().registrarMovimentacao({ clienteId: entrada.clienteId, itemDeCatalogoId: entrada.itemDeCatalogoId, valorTotal, dataMovimentacao, codigoExterno: entrada.codigoExterno || null, observacao: entrada.observacao || null });
  } catch (erro) {
    const mensagem = erro instanceof ErroCrmApi && (erro.status === 409 || erro.status === 422) ? erro.message : "Não foi possível registrar a movimentação agora.";
    redirect(`/movimentacoes?erro=${encodeURIComponent(mensagem)}`);
  }
  revalidatePath("/movimentacoes");
  redirect("/movimentacoes?sucesso=Movimentação+registrada");
}
