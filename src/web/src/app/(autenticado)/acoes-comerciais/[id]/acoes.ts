"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { SimulacaoDePublico } from "@/contratos/apresentacao";
import { ErroCrmApi } from "@/infraestrutura/crm-api-http";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";
import { obterPortaSessao } from "@/infraestrutura/obter-porta-sessao";

const esquema = z.object({ acaoId: z.string().uuid(), tipoCliente: z.string().trim().max(80), cidades: z.string().trim().max(500), bairros: z.string().trim().max(500), cadastradoApartirDe: z.string().date().or(z.literal("")), confirmarBaseCompleta: z.boolean() }).superRefine((dados, contexto) => {
  if (!dados.tipoCliente && !dados.cidades && !dados.bairros && !dados.cadastradoApartirDe && !dados.confirmarBaseCompleta) contexto.addIssue({ code: "custom", path: ["confirmarBaseCompleta"], message: "Confirme o uso de toda a base ou informe ao menos um filtro." });
});
export type EntradaSimularPublico = z.input<typeof esquema>;
export type ResultadoSimularPublico = { sucesso: true; simulacao: SimulacaoDePublico } | { sucesso: false; mensagem: string };
export type ResultadoPrepararAcao = { sucesso: false; mensagem: string };
export type ResultadoIniciarAcao = { sucesso: false; mensagem: string };
export type ResultadoRegistrarResultado = { sucesso: true } | { sucesso: false; mensagem: string };
const lista = (valor: string) => { const itens = valor.split(",").map((item) => item.trim()).filter(Boolean); return itens.length ? itens : null; };

export async function salvarESimularPublico(entrada: EntradaSimularPublico): Promise<ResultadoSimularPublico> {
  const sessao = await obterPortaSessao().obterSessao();
  if (!sessao) redirect(`/entrar?retorno=/acoes-comerciais/${entrada.acaoId}`);
  const validacao = esquema.safeParse(entrada);
  if (!validacao.success) return { sucesso: false, mensagem: validacao.error.issues[0]?.message ?? "Revise os filtros informados." };
  const dados = validacao.data;
  try {
    const porta = obterPortaCrmApi();
    await porta.atualizarCriterios(dados.acaoId, { versaoSchema: 1, modo: "Filtros", tipoCliente: dados.tipoCliente || null, cidades: lista(dados.cidades), bairros: lista(dados.bairros), etiquetaIds: null, cadastradoApartirDe: dados.cadastradoApartirDe ? `${dados.cadastradoApartirDe}T00:00:00.000Z` : null, dataNascimentoDe: null, dataNascimentoAte: null, clienteIds: null });
    return { sucesso: true, simulacao: await porta.simularPublico(dados.acaoId) };
  } catch (erro) {
    if (erro instanceof ErroCrmApi) return { sucesso: false, mensagem: erro.status === 403 ? "Seu perfil não possui permissão para alterar esta ação." : erro.status === 409 ? "O rascunho foi alterado recentemente. Atualize a página e tente novamente." : erro.status === 422 ? erro.message : "Não foi possível simular o público agora. Tente novamente." };
    throw erro;
  }
}

export async function prepararAcao(entrada: { acaoId: string; versaoModeloId: string }): Promise<ResultadoPrepararAcao> {
  const validacao = z.object({ acaoId: z.string().uuid(), versaoModeloId: z.string().uuid() }).safeParse(entrada);
  if (!validacao.success) return { sucesso: false, mensagem: "Selecione um modelo de mensagem publicado." };
  const sessao = await obterPortaSessao().obterSessao();
  if (!sessao) redirect(`/entrar?retorno=/acoes-comerciais/${validacao.data.acaoId}`);
  try {
    const porta = obterPortaCrmApi();
    await porta.atualizarModelo(validacao.data.acaoId, validacao.data.versaoModeloId);
    const acaoAtualizada = await porta.obter(validacao.data.acaoId);
    if (!acaoAtualizada) return { sucesso: false, mensagem: "A Ação Comercial não foi encontrada." };
    await porta.preparar(validacao.data.acaoId, acaoAtualizada.versao);
  } catch (erro) {
    if (erro instanceof ErroCrmApi) return { sucesso: false, mensagem: erro.status === 403 ? "Seu perfil não possui permissão para preparar esta ação." : erro.status === 409 ? "O rascunho foi alterado recentemente. Atualize a página e revise os dados." : erro.status === 422 ? erro.message : "Não foi possível preparar a ação agora. Tente novamente." };
    throw erro;
  }
  redirect(`/acoes-comerciais/${validacao.data.acaoId}`);
}

export async function iniciarAcao(entrada: { acaoId: string; versao: number }): Promise<ResultadoIniciarAcao> {
  const validacao = z.object({ acaoId: z.string().uuid(), versao: z.number().int().nonnegative() }).safeParse(entrada);
  if (!validacao.success) return { sucesso: false, mensagem: "Os dados da ação estão desatualizados. Atualize a página." };
  const sessao = await obterPortaSessao().obterSessao();
  if (!sessao) redirect(`/entrar?retorno=/acoes-comerciais/${validacao.data.acaoId}`);
  try { await obterPortaCrmApi().iniciar(validacao.data.acaoId, validacao.data.versao); }
  catch (erro) {
    if (erro instanceof ErroCrmApi) return { sucesso: false, mensagem: erro.status === 403 ? "Seu perfil não possui permissão para iniciar esta ação." : erro.status === 409 ? "A ação foi alterada recentemente. Atualize a página e revise o estado atual." : erro.status === 422 ? erro.message : "Não foi possível iniciar a ação agora. Tente novamente." };
    throw erro;
  }
  redirect(`/acoes-comerciais/${validacao.data.acaoId}`);
}

export async function registrarResultado(entrada: { acaoId: string; destinatarioId: string; resultado: string; valorConvertido: string; versao: number }): Promise<ResultadoRegistrarResultado> {
  const validacao = z.object({ acaoId: z.string().uuid(), destinatarioId: z.string().uuid(), resultado: z.enum(["SemRetorno", "Respondeu", "Interessado", "Convertido", "NaoTemInteresse"]), valorConvertido: z.string().trim().max(30), versao: z.number().int().nonnegative() }).safeParse(entrada);
  if (!validacao.success) return { sucesso: false, mensagem: "Selecione um resultado comercial válido." };
  const dados = validacao.data;
  if (dados.resultado !== "Convertido" && dados.valorConvertido) return { sucesso: false, mensagem: "O valor só pode ser informado para uma conversão." };
  const valorNormalizado = dados.valorConvertido.replaceAll(".", "").replace(",", ".");
  const valor = valorNormalizado ? Number(valorNormalizado) : null;
  if (valor !== null && (!Number.isFinite(valor) || valor < 0)) return { sucesso: false, mensagem: "Informe um valor convertido válido e não negativo." };
  const sessao = await obterPortaSessao().obterSessao();
  if (!sessao) redirect(`/entrar?retorno=/acoes-comerciais/${dados.acaoId}`);
  try { await obterPortaCrmApi().registrarResultado(dados.acaoId, dados.destinatarioId, dados.resultado, valor, dados.versao); }
  catch (erro) {
    if (erro instanceof ErroCrmApi) return { sucesso: false, mensagem: erro.status === 403 ? "Seu perfil não possui permissão para registrar resultados." : erro.status === 409 ? "Este destinatário foi alterado por outra pessoa. Atualize a página." : erro.status === 422 ? erro.message : "Não foi possível registrar o resultado agora." };
    throw erro;
  }
  revalidatePath(`/acoes-comerciais/${dados.acaoId}`);
  return { sucesso: true };
}
