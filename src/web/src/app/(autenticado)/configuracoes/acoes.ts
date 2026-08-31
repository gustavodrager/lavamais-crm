"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ErroCrmApi } from "@/infraestrutura/crm-api-http";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";
import { obterPortaSessao } from "@/infraestrutura/obter-porta-sessao";

export type ResultadoConfiguracao = { sucesso: true } | { sucesso: false; mensagem: string };
const textoOpcional = (valor: string) => valor.trim() || null;
async function validarSessao() { if (!await obterPortaSessao().obterSessao()) redirect("/entrar?retorno=/configuracoes"); }
function falha(erro: unknown): ResultadoConfiguracao {
  if (erro instanceof ErroCrmApi) return { sucesso: false, mensagem: erro.status === 403 ? "Seu perfil não possui permissão para alterar esta configuração." : erro.status === 409 || erro.status === 422 ? erro.message : "Não foi possível salvar a configuração agora." };
  throw erro;
}

export async function criarServico(entrada: { nome: string; categoria: string; valorReferencia: string; codigoExterno: string }): Promise<ResultadoConfiguracao> {
  await validarSessao(); const validacao = z.object({ nome: z.string().trim().min(2).max(160), categoria: z.string().trim().max(100), valorReferencia: z.string().trim().max(30), codigoExterno: z.string().trim().max(100) }).safeParse(entrada);
  if (!validacao.success) return { sucesso: false, mensagem: "Revise os dados do serviço." };
  const numero = validacao.data.valorReferencia ? Number(validacao.data.valorReferencia.replaceAll(".", "").replace(",", ".")) : null;
  if (numero !== null && (!Number.isFinite(numero) || numero < 0)) return { sucesso: false, mensagem: "Informe um valor de referência válido." };
  try { await obterPortaCrmApi().criarServico({ nome: validacao.data.nome, categoria: textoOpcional(validacao.data.categoria), valorReferencia: numero, codigoExterno: textoOpcional(validacao.data.codigoExterno) }); revalidatePath("/configuracoes"); return { sucesso: true }; } catch (erro) { return falha(erro); }
}

export async function carregarCatalogoInicial(): Promise<ResultadoConfiguracao & { resumo?: string }> {
  const sessao = await obterPortaSessao().obterSessao();
  if (!sessao) redirect("/entrar?retorno=/configuracoes");
  if (sessao.papel !== "Administrador") return { sucesso: false, mensagem: "Somente administradores podem carregar o catálogo inicial." };
  try {
    const resultado = await obterPortaCrmApi().carregarCatalogoInicialDeLavanderia();
    revalidatePath("/configuracoes"); revalidatePath("/movimentacoes");
    return { sucesso: true, resumo: `${resultado.artigosCriados} artigos, ${resultado.servicosCriados} serviços e ${resultado.ofertasCriadas} ofertas criados.` };
  } catch (erro) { return falha(erro); }
}

export async function criarEtiqueta(entrada: { nome: string }): Promise<ResultadoConfiguracao> {
  await validarSessao(); const validacao = z.object({ nome: z.string().trim().min(2).max(80) }).safeParse(entrada); if (!validacao.success) return { sucesso: false, mensagem: "Informe um nome válido para a etiqueta." };
  try { await obterPortaCrmApi().criarEtiqueta(validacao.data.nome); revalidatePath("/configuracoes"); return { sucesso: true }; } catch (erro) { return falha(erro); }
}
