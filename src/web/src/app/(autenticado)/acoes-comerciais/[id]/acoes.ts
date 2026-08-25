"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ResumoCliente, SimulacaoDePublico } from "@/contratos/apresentacao";
import { ErroCrmApi } from "@/infraestrutura/crm-api-http";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";
import { obterPortaSessao } from "@/infraestrutura/obter-porta-sessao";

const esquemaAcaoId = z.string().uuid();
const esquemaListaManual = z.object({ acaoId: esquemaAcaoId, clienteIds: z.array(z.string().uuid()).min(1).max(10) });
export type ResultadoSimularPublico = { sucesso: true; simulacao: SimulacaoDePublico } | { sucesso: false; mensagem: string };
export type ResultadoAlterarExclusao = { sucesso: true; simulacao: SimulacaoDePublico } | { sucesso: false; mensagem: string };
export type ResultadoPrepararAcao = { sucesso: false; mensagem: string };
export type ResultadoEnviarMensagem = { sucesso: true } | { sucesso: false; mensagem: string };
export type ResultadoRegistrarResultado = { sucesso: true } | { sucesso: false; mensagem: string };
const criteriosSemFiltros = { versaoSchema: 2 as const, modo: "Filtros" as const, tipoCliente: null, cidades: null, bairros: null, etiquetaIds: null, cadastradoApartirDe: null, dataNascimentoDe: null, dataNascimentoAte: null, clienteIds: null, clienteIdsExcluidos: null };

export async function montarListaRapida(acaoId: string): Promise<ResultadoSimularPublico> {
  const validacao = esquemaAcaoId.safeParse(acaoId);
  if (!validacao.success) return { sucesso: false, mensagem: "A Ação Comercial informada é inválida." };
  const sessao = await obterPortaSessao().obterSessao();
  if (!sessao) redirect(`/entrar?retorno=/acoes-comerciais/${acaoId}`);
  try {
    const porta = obterPortaCrmApi();
    await porta.atualizarCriterios(acaoId, criteriosSemFiltros);
    const candidatos = await porta.simularPublico(acaoId, 1, 100);
    const clienteIds = candidatos.clientes.filter((cliente) => cliente.elegivel).slice(0, 10).map((cliente) => cliente.clienteId);
    const totalPaginas = Math.ceil(candidatos.quantidadeEncontrada / 100);
    for (let pagina = 2; pagina <= totalPaginas && clienteIds.length < 10; pagina += 1) {
      const complemento = await porta.simularPublico(acaoId, pagina, 100);
      clienteIds.push(...complemento.clientes.filter((cliente) => cliente.elegivel).slice(0, 10 - clienteIds.length).map((cliente) => cliente.clienteId));
    }
    if (clienteIds.length === 0) return { sucesso: true, simulacao: { ...candidatos, pagina: 1, tamanhoPagina: 10, clientes: [] } };
    await porta.atualizarCriterios(acaoId, { ...criteriosSemFiltros, modo: "Manual", clienteIds });
    return { sucesso: true, simulacao: await porta.simularPublico(acaoId, 1, 10) };
  } catch (erro) {
    if (erro instanceof ErroCrmApi) return { sucesso: false, mensagem: erro.status === 403 ? "Seu perfil não possui permissão para escolher clientes." : erro.status === 409 ? "O rascunho foi alterado recentemente. Atualize a página." : erro.status === 422 ? erro.message : "Não foi possível montar a lista agora. Tente novamente." };
    throw erro;
  }
}

export async function buscarClientesParaLista(entrada: { acaoId: string; busca: string }): Promise<{ sucesso: true; clientes: ResumoCliente[] } | { sucesso: false; mensagem: string }> {
  const validacao = z.object({ acaoId: esquemaAcaoId, busca: z.string().trim().min(2).max(120) }).safeParse(entrada);
  if (!validacao.success) return { sucesso: false, mensagem: "Digite pelo menos 2 caracteres para buscar." };
  const sessao = await obterPortaSessao().obterSessao();
  if (!sessao) redirect(`/entrar?retorno=/acoes-comerciais/${entrada.acaoId}`);
  try {
    const resultado = await obterPortaCrmApi().listarClientes(validacao.data.busca, 1, 10);
    return { sucesso: true, clientes: resultado.itens.filter((cliente) => cliente.permiteWhatsapp) };
  } catch (erro) {
    if (erro instanceof ErroCrmApi) return { sucesso: false, mensagem: "Não foi possível buscar clientes agora." };
    throw erro;
  }
}

export async function salvarListaManual(entrada: z.input<typeof esquemaListaManual>): Promise<ResultadoSimularPublico> {
  const validacao = esquemaListaManual.safeParse(entrada);
  if (!validacao.success) return { sucesso: false, mensagem: "Escolha de 1 a 10 clientes para continuar." };
  const sessao = await obterPortaSessao().obterSessao();
  if (!sessao) redirect(`/entrar?retorno=/acoes-comerciais/${entrada.acaoId}`);
  try {
    const porta = obterPortaCrmApi();
    await porta.atualizarCriterios(validacao.data.acaoId, { ...criteriosSemFiltros, modo: "Manual", clienteIds: [...new Set(validacao.data.clienteIds)] });
    return { sucesso: true, simulacao: await porta.simularPublico(validacao.data.acaoId, 1, 10) };
  } catch (erro) {
    if (erro instanceof ErroCrmApi) return { sucesso: false, mensagem: erro.status === 422 ? erro.message : "Não foi possível salvar os clientes escolhidos." };
    throw erro;
  }
}

export async function alterarExclusaoDoPublico(entrada: { acaoId: string; clienteId: string; excluir: boolean }): Promise<ResultadoAlterarExclusao> {
  const validacao = z.object({ acaoId: z.string().uuid(), clienteId: z.string().uuid(), excluir: z.boolean() }).safeParse(entrada);
  if (!validacao.success) return { sucesso: false, mensagem: "O cliente selecionado é inválido. Atualize a página." };
  const sessao = await obterPortaSessao().obterSessao();
  if (!sessao) redirect(`/entrar?retorno=/acoes-comerciais/${validacao.data.acaoId}`);
  try {
    const porta = obterPortaCrmApi();
    const acao = await porta.obter(validacao.data.acaoId);
    if (!acao || acao.situacao !== "Rascunho") return { sucesso: false, mensagem: "Somente rascunhos permitem alterar o público." };
    const exclusoes = new Set(acao.criterios.clienteIdsExcluidos ?? []);
    if (validacao.data.excluir) exclusoes.add(validacao.data.clienteId); else exclusoes.delete(validacao.data.clienteId);
    await porta.atualizarCriterios(validacao.data.acaoId, { ...acao.criterios, versaoSchema: 2, clienteIdsExcluidos: exclusoes.size ? [...exclusoes] : null });
    return { sucesso: true, simulacao: await porta.simularPublico(validacao.data.acaoId) };
  } catch (erro) {
    if (erro instanceof ErroCrmApi) return { sucesso: false, mensagem: erro.status === 403 ? "Seu perfil não possui permissão para alterar esta ação." : erro.status === 409 ? "O rascunho foi alterado recentemente. Atualize a página." : erro.status === 422 ? erro.message : "Não foi possível alterar o público agora." };
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

export async function enviarMensagemIndividual(entrada: { acaoId: string; destinatarioId: string; versao: number }): Promise<ResultadoEnviarMensagem> {
  const validacao = z.object({ acaoId: z.string().uuid(), destinatarioId: z.string().uuid(), versao: z.number().int().nonnegative() }).safeParse(entrada);
  if (!validacao.success) return { sucesso: false, mensagem: "Os dados do destinatário estão desatualizados. Atualize a página." };
  const sessao = await obterPortaSessao().obterSessao();
  if (!sessao) redirect(`/entrar?retorno=/acoes-comerciais/${validacao.data.acaoId}`);
  try { await obterPortaCrmApi().enviarDestinatario(validacao.data.acaoId, validacao.data.destinatarioId, validacao.data.versao); }
  catch (erro) {
    if (erro instanceof ErroCrmApi) return { sucesso: false, mensagem: erro.status === 403 ? "Seu perfil não possui permissão para enviar esta mensagem." : erro.status === 404 ? "O destinatário não foi encontrado nesta ação." : erro.status === 409 ? "Esta mensagem já foi solicitada ou o destinatário foi alterado. Atualize a página." : erro.status === 422 ? erro.message : "Não foi possível solicitar esta mensagem agora." };
    throw erro;
  }
  revalidatePath(`/acoes-comerciais/${validacao.data.acaoId}`);
  return { sucesso: true };
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
