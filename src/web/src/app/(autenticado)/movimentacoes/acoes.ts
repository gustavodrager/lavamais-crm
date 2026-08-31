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
  busca: z.string().trim().max(200).optional(),
});

export type EstadoRegistroMovimentacao = { mensagem?: string; sucesso?: boolean; requerLogin?: boolean };

export async function registrarMovimentacao(_estado: EstadoRegistroMovimentacao, dados: FormData): Promise<EstadoRegistroMovimentacao> {
  if (!await obterPortaSessao().obterSessao()) return { mensagem: "Sua sessão expirou. Os dados continuam no formulário; entre novamente para continuar.", requerLogin: true };
  const validacao = esquema.safeParse(Object.fromEntries(dados));
  if (!validacao.success) return { mensagem: "Revise os dados do atendimento." };
  const entrada = validacao.data;
  let linhasBrutas: unknown;
  try { linhasBrutas = JSON.parse(entrada.linhas); } catch { return { mensagem: "Revise os artigos e serviços informados." }; }
  const linhasValidadas = z.array(z.object({ ofertaDeServicoId: z.string().uuid(), quantidade: z.number().int().positive(), precoUnitario: z.string().nullable() })).min(1).safeParse(linhasBrutas);
  if (!linhasValidadas.success) return { mensagem: "Revise os artigos, serviços e quantidades." };
  if (new Set(linhasValidadas.data.map((linha) => linha.ofertaDeServicoId)).size !== linhasValidadas.data.length) return { mensagem: "A mesma oferta não pode ser adicionada mais de uma vez." };
  const linhas = linhasValidadas.data.map((linha) => ({ ...linha, precoUnitario: linha.precoUnitario ? Number(linha.precoUnitario.replace(",", ".")) : null }));
  if (linhas.some((linha) => linha.precoUnitario !== null && (!Number.isFinite(linha.precoUnitario) || linha.precoUnitario < 0))) return { mensagem: "Informe preços unitários válidos." };
  let dataMovimentacao: string | null = null;
  if (entrada.dataMovimentacao) {
    const valor = entrada.dataMovimentacao.length === 16 ? `${entrada.dataMovimentacao}:00` : entrada.dataMovimentacao;
    const data = new Date(`${valor}-03:00`);
    if (Number.isNaN(data.getTime())) return { mensagem: "Informe uma data e hora válidas." };
    dataMovimentacao = data.toISOString();
  }
  try {
    await obterPortaCrmApi().registrarMovimentacao({ clienteId: entrada.clienteId, linhas, dataMovimentacao, codigoExterno: entrada.codigoExterno || null, observacao: entrada.observacao || null });
  } catch (erro) {
    if (erro instanceof ErroCrmApi) {
      if (erro.status === 401) return { mensagem: "Sua sessão expirou. Os dados continuam no formulário; entre novamente para continuar.", requerLogin: true };
      if (erro.status === 403) return { mensagem: "Seu perfil não tem permissão para registrar atendimentos." };
      if (erro.status === 409) return { mensagem: `Não foi possível registrar porque houve um conflito: ${erro.message}` };
      if (erro.status === 422) return { mensagem: `Revise o atendimento: ${erro.message}` };
    }
    return { mensagem: "Não foi possível registrar o atendimento agora. Tente novamente." };
  }
  revalidatePath("/movimentacoes");
  revalidatePath(`/clientes/${entrada.clienteId}`);
  const parametros = new URLSearchParams({ sucesso: "Atendimento registrado", clienteId: entrada.clienteId });
  if (entrada.busca) parametros.set("busca", entrada.busca);
  redirect(`/movimentacoes?${parametros}`);
}

export type ResultadoCancelarMovimentacao = { sucesso: true } | { sucesso: false; mensagem: string };
export async function cancelarMovimentacao(entrada: { id: string; motivo: string; versao: number }): Promise<ResultadoCancelarMovimentacao> {
  const validacao = z.object({ id: z.string().uuid(), motivo: z.string().trim().min(3).max(300), versao: z.number().int().nonnegative() }).safeParse(entrada);
  if (!validacao.success) return { sucesso: false, mensagem: "Informe o motivo do cancelamento." };
  const sessao = await obterPortaSessao().obterSessao();
  if (!sessao) return { sucesso: false, mensagem: "Sua sessão expirou. Entre novamente." };
  if (sessao.papel === "Operador") return { sucesso: false, mensagem: "Somente gerentes podem cancelar movimentações." };
  try { await obterPortaCrmApi().cancelarMovimentacao(validacao.data.id, validacao.data.motivo, validacao.data.versao); }
  catch (erro) { if (erro instanceof ErroCrmApi) return { sucesso: false, mensagem: erro.status === 401 ? "Sua sessão expirou. Entre novamente." : erro.status === 403 ? "Seu perfil não pode cancelar movimentações." : erro.status === 409 ? "O registro mudou ou já foi cancelado. Atualize a página." : erro.status === 422 ? erro.message : "Não foi possível cancelar a movimentação agora." }; throw erro; }
  revalidatePath("/movimentacoes");
  return { sucesso: true };
}
