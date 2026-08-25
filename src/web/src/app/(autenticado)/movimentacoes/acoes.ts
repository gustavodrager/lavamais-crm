"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ErroCrmApi } from "@/infraestrutura/crm-api-http";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";
import { obterPortaSessao } from "@/infraestrutura/obter-porta-sessao";

const esquema = z.object({
  clienteId: z.string().uuid(),
  linhas: z.string().trim().min(2).max(20000),
  dataMovimentacao: z.string().trim().max(30),
  codigoExterno: z.string().trim().max(100),
  observacao: z.string().trim().max(500),
});

export type EstadoRegistroMovimentacao = { mensagem?: string; sucesso?: boolean; requerLogin?: boolean };

export async function registrarMovimentacao(_estado: EstadoRegistroMovimentacao, dados: FormData): Promise<EstadoRegistroMovimentacao> {
  if (!await obterPortaSessao().obterSessao()) return { mensagem: "Sua sessão expirou. Os dados continuam no formulário; entre novamente para continuar.", requerLogin: true };
  const validacao = esquema.safeParse(Object.fromEntries(dados));
  if (!validacao.success) return { mensagem: "Revise os dados da movimentação." };
  const entrada = validacao.data;
  let linhasBrutas: unknown;
  try { linhasBrutas = JSON.parse(entrada.linhas); } catch { return { mensagem: "Revise os artigos e serviços informados." }; }
  const linhasValidadas = z.array(z.object({ ofertaDeServicoId: z.string().uuid(), quantidade: z.number().int().positive(), precoUnitario: z.string().nullable() })).min(1).safeParse(linhasBrutas);
  if (!linhasValidadas.success) return { mensagem: "Revise os artigos, serviços e quantidades." };
  const linhas = linhasValidadas.data.map((linha) => ({ ...linha, precoUnitario: linha.precoUnitario ? Number(linha.precoUnitario.replace(",", ".")) : null }));
  if (linhas.some((linha) => linha.precoUnitario !== null && (!Number.isFinite(linha.precoUnitario) || linha.precoUnitario < 0))) return { mensagem: "Informe preços unitários válidos." };
  const dataMovimentacao = entrada.dataMovimentacao ? new Date(`${entrada.dataMovimentacao}:00-03:00`).toISOString() : null;
  try {
    await obterPortaCrmApi().registrarMovimentacao({ clienteId: entrada.clienteId, linhas, dataMovimentacao, codigoExterno: entrada.codigoExterno || null, observacao: entrada.observacao || null });
  } catch (erro) {
    const mensagem = erro instanceof ErroCrmApi && (erro.status === 409 || erro.status === 422) ? erro.message : "Não foi possível registrar a movimentação agora.";
    return { mensagem };
  }
  revalidatePath("/movimentacoes");
  redirect("/movimentacoes?sucesso=Movimentação+registrada");
}

export type ResultadoCancelarMovimentacao = { sucesso: true } | { sucesso: false; mensagem: string };
export async function cancelarMovimentacao(entrada: { id: string; motivo: string; versao: number }): Promise<ResultadoCancelarMovimentacao> {
  const validacao = z.object({ id: z.string().uuid(), motivo: z.string().trim().min(3).max(300), versao: z.number().int().nonnegative() }).safeParse(entrada);
  if (!validacao.success) return { sucesso: false, mensagem: "Informe o motivo do cancelamento." };
  const sessao = await obterPortaSessao().obterSessao();
  if (!sessao) return { sucesso: false, mensagem: "Sua sessão expirou. Entre novamente." };
  if (sessao.papel === "Operador") return { sucesso: false, mensagem: "Somente gerentes podem cancelar movimentações." };
  try { await obterPortaCrmApi().cancelarMovimentacao(validacao.data.id, validacao.data.motivo, validacao.data.versao); }
  catch (erro) { if (erro instanceof ErroCrmApi) return { sucesso: false, mensagem: erro.status === 409 ? "O registro mudou. Atualize a página." : erro.status === 403 ? "Seu perfil não pode cancelar movimentações." : erro.message }; throw erro; }
  revalidatePath("/movimentacoes");
  return { sucesso: true };
}
