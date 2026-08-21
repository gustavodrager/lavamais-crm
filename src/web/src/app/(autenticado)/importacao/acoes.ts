"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import type { PreVisualizacaoImportacao, ResultadoImportacao } from "@/contratos/apresentacao";
import { ErroCrmApi } from "@/infraestrutura/crm-api-http";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";
import { obterPortaSessao } from "@/infraestrutura/obter-porta-sessao";

export type ResultadoPreVisualizar = { sucesso: true; preVisualizacao: PreVisualizacaoImportacao } | { sucesso: false; mensagem: string };
export type ResultadoConfirmar = { sucesso: true; resultado: ResultadoImportacao } | { sucesso: false; mensagem: string };

export async function preVisualizarClientes(dados: FormData): Promise<ResultadoPreVisualizar> {
  const sessao = await obterPortaSessao().obterSessao(); if (!sessao) redirect("/entrar?retorno=/importacao");
  const arquivo = dados.get("arquivo");
  if (!(arquivo instanceof File) || arquivo.size === 0) return { sucesso: false, mensagem: "Selecione um arquivo CSV com dados." };
  if (!arquivo.name.toLowerCase().endsWith(".csv")) return { sucesso: false, mensagem: "Converta a planilha para CSV antes de enviar." };
  if (arquivo.size > 10 * 1024 * 1024) return { sucesso: false, mensagem: "O arquivo deve possuir no máximo 10 MB." };
  try { return { sucesso: true, preVisualizacao: await obterPortaCrmApi().preVisualizarImportacao(arquivo) }; }
  catch (erro) { if (erro instanceof ErroCrmApi) return { sucesso: false, mensagem: erro.status === 403 ? "Somente administradores podem importar clientes." : erro.status === 422 ? erro.message : "Não foi possível analisar o arquivo agora." }; throw erro; }
}

export async function confirmarClientes(referenciaArquivo: string): Promise<ResultadoConfirmar> {
  const sessao = await obterPortaSessao().obterSessao(); if (!sessao) redirect("/entrar?retorno=/importacao");
  const validacao = z.string().uuid().safeParse(referenciaArquivo); if (!validacao.success) return { sucesso: false, mensagem: "A pré-visualização expirou. Envie o arquivo novamente." };
  try { return { sucesso: true, resultado: await obterPortaCrmApi().confirmarImportacao(validacao.data) }; }
  catch (erro) { if (erro instanceof ErroCrmApi) return { sucesso: false, mensagem: erro.status === 403 ? "Somente administradores podem confirmar a importação." : erro.status === 404 ? "A pré-visualização não está mais disponível." : erro.status === 409 || erro.status === 422 ? erro.message : "Não foi possível concluir a importação agora." }; throw erro; }
}
