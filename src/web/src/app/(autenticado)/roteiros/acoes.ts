"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";
import { ErroCrmApi } from "@/infraestrutura/crm-api-http";

const uuid = z.string().uuid();
const versao = z.coerce.number().int().nonnegative();
const erroOperacional = (erro: unknown) => erro instanceof ErroCrmApi ? erro.message : "Não foi possível concluir a operação do roteiro.";
const voltarComErro = (rota: string, data: string, erro: unknown): never => redirect(`${rota}?${new URLSearchParams({ data, erro: erroOperacional(erro) })}`);

export async function criarRoteiro(dados: FormData) {
  const x = z.object({ data: z.string().date(), nomeMotorista: z.string().trim().min(1).max(120) }).parse(Object.fromEntries(dados));
  try { await obterPortaCrmApi().criarRoteiro(x.data, x.nomeMotorista); } catch (erro) { voltarComErro("/roteiros", x.data, erro); }
  revalidatePath("/roteiros"); redirect(`/roteiros?data=${x.data}`);
}

export async function adicionarParada(dados: FormData) {
  const x = z.object({ roteiroId: uuid, data: z.string().date(), clienteId: uuid, tipo: z.enum(["Coleta", "Entrega"]), periodo: z.string().trim().min(1).max(80), observacao: z.string().trim().max(500), versao }).parse(Object.fromEntries(dados));
  try { await obterPortaCrmApi().adicionarParada(x.roteiroId, { clienteId: x.clienteId, tipo: x.tipo, periodo: x.periodo, observacao: x.observacao || null, versao: x.versao }); } catch (erro) { voltarComErro("/roteiros", x.data, erro); }
  revalidatePath("/roteiros"); redirect(`/roteiros?data=${x.data}`);
}

export async function atualizarMotorista(dados: FormData) {
  const x = z.object({ roteiroId: uuid, data: z.string().date(), nomeMotorista: z.string().trim().min(1).max(120), versao }).parse(Object.fromEntries(dados));
  try { await obterPortaCrmApi().atualizarMotorista(x.roteiroId, x.nomeMotorista, x.versao); } catch (erro) { voltarComErro("/roteiros", x.data, erro); }
  revalidatePath("/roteiros"); revalidatePath("/meu-roteiro"); redirect(`/roteiros?data=${x.data}`);
}

export async function excluirRoteiro(dados: FormData) {
  const x = z.object({ roteiroId: uuid, data: z.string().date(), versao }).parse(Object.fromEntries(dados));
  try { await obterPortaCrmApi().excluirRoteiro(x.roteiroId, x.versao); } catch (erro) { voltarComErro("/roteiros", x.data, erro); }
  revalidatePath("/roteiros"); redirect(`/roteiros?data=${x.data}`);
}

export async function editarParada(dados: FormData) {
  const x = z.object({ roteiroId: uuid, paradaId: uuid, data: z.string().date(), tipo: z.enum(["Coleta", "Entrega"]), periodo: z.string().trim().min(1).max(80), observacao: z.string().trim().max(500), versao }).parse(Object.fromEntries(dados));
  try { await obterPortaCrmApi().atualizarParada(x.roteiroId, x.paradaId, { tipo: x.tipo, periodo: x.periodo, observacao: x.observacao || null, versao: x.versao }); } catch (erro) { voltarComErro("/roteiros", x.data, erro); }
  revalidatePath("/roteiros"); redirect(`/roteiros?data=${x.data}`);
}

export async function removerParada(dados: FormData) {
  const x = z.object({ roteiroId: uuid, paradaId: uuid, data: z.string().date(), versao }).parse(Object.fromEntries(dados));
  try { await obterPortaCrmApi().removerParada(x.roteiroId, x.paradaId, x.versao); } catch (erro) { voltarComErro("/roteiros", x.data, erro); }
  revalidatePath("/roteiros"); redirect(`/roteiros?data=${x.data}`);
}

export async function moverParada(dados: FormData) {
  const x = z.object({ roteiroId: uuid, data: z.string().date(), paradaId: uuid, direcao: z.enum(["cima", "baixo"]), ordem: z.string(), versao }).parse(Object.fromEntries(dados));
  const ids = x.ordem.split(",").filter(Boolean); const i = ids.indexOf(x.paradaId); const destino = x.direcao === "cima" ? i - 1 : i + 1;
  if (i >= 0 && destino >= 0 && destino < ids.length) [ids[i], ids[destino]] = [ids[destino], ids[i]];
  try { await obterPortaCrmApi().reordenarParadas(x.roteiroId, ids, x.versao); } catch (erro) { voltarComErro("/roteiros", x.data, erro); }
  revalidatePath("/roteiros"); redirect(`/roteiros?data=${x.data}`);
}

export async function publicarRoteiro(dados: FormData) {
  const x = z.object({ roteiroId: uuid, data: z.string().date(), versao }).parse(Object.fromEntries(dados));
  try { await obterPortaCrmApi().publicarRoteiro(x.roteiroId, x.versao); } catch (erro) { voltarComErro("/roteiros", x.data, erro); }
  revalidatePath("/roteiros"); revalidatePath("/meu-roteiro"); redirect(`/roteiros?data=${x.data}&publicado=1`);
}

export async function atualizarParada(dados: FormData) {
  const x = z.object({ paradaId: uuid, acao: z.enum(["iniciar", "concluir", "adiar"]), data: z.string().date(), versao }).parse(Object.fromEntries(dados));
  try {
    const api = obterPortaCrmApi();
    if (x.acao === "iniciar") await api.iniciarParada(x.paradaId, x.versao);
    else if (x.acao === "concluir") await api.concluirParada(x.paradaId, x.versao);
    else await api.adiarParada(x.paradaId, x.versao);
  } catch (erro) { voltarComErro("/meu-roteiro", x.data, erro); }
  revalidatePath("/meu-roteiro"); revalidatePath("/roteiros"); redirect(`/meu-roteiro?data=${x.data}`);
}

export async function naoRealizarParada(dados: FormData) {
  const x = z.object({ paradaId: uuid, data: z.string().date(), motivo: z.string().trim().min(3).max(300), versao }).parse(Object.fromEntries(dados));
  try { await obterPortaCrmApi().naoRealizarParada(x.paradaId, x.motivo, x.versao); } catch (erro) { voltarComErro("/meu-roteiro", x.data, erro); }
  revalidatePath("/meu-roteiro"); revalidatePath("/roteiros"); redirect(`/meu-roteiro?data=${x.data}`);
}
