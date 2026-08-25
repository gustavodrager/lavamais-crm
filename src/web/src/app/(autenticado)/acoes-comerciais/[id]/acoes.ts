"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { CriteriosDeSegmentacao, ResumoCliente, SimulacaoDePublico } from "@/contratos/apresentacao";
import { bairrosAtendidosPorCidade, cidadesAtendidas } from "@/conteudo/area-atendimento-lavamais";
import { ErroCrmApi } from "@/infraestrutura/crm-api-http";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";
import { obterPortaSessao } from "@/infraestrutura/obter-porta-sessao";

const esquemaAcaoId = z.string().uuid();
const esquemaListaManual = z.object({ acaoId: esquemaAcaoId, clienteIds: z.array(z.string().uuid()).min(1).max(10) });
const esquemaListaPorRegiao = z.object({ acaoId: esquemaAcaoId, cidade: z.string().trim().min(1).max(80), bairros: z.array(z.string().trim().min(1).max(80)).max(20).default([]) });
export type ResultadoSimularPublico = { sucesso: true; simulacao: SimulacaoDePublico } | { sucesso: false; mensagem: string };
export type ResultadoAlterarExclusao = { sucesso: true; simulacao: SimulacaoDePublico } | { sucesso: false; mensagem: string };
export type ResultadoPrepararAcao = { sucesso: false; mensagem: string };
export type ResultadoCancelarAcao = { sucesso: true } | { sucesso: false; mensagem: string };
export type ResultadoEnviarMensagem = { sucesso: true } | { sucesso: false; mensagem: string };
export type ResultadoRegistrarResultado = { sucesso: true } | { sucesso: false; mensagem: string };
const criteriosSemFiltros = { versaoSchema: 2 as const, modo: "Filtros" as const, tipoCliente: null, cidades: null, bairros: null, etiquetaIds: null, cadastradoApartirDe: null, dataNascimentoDe: null, dataNascimentoAte: null, clienteIds: null, clienteIdsExcluidos: null };

async function montarListaComFiltros(porta: ReturnType<typeof obterPortaCrmApi>, acaoId: string, criterios: CriteriosDeSegmentacao): Promise<SimulacaoDePublico> {
  await porta.atualizarCriterios(acaoId, criterios);
  const candidatos = await porta.simularPublico(acaoId, 1, 100);
  const clienteIds = candidatos.clientes.filter((cliente) => cliente.elegivel).slice(0, 10).map((cliente) => cliente.clienteId);
  const totalPaginas = Math.ceil(candidatos.quantidadeEncontrada / 100);
  for (let pagina = 2; pagina <= totalPaginas && clienteIds.length < 10; pagina += 1) {
    const complemento = await porta.simularPublico(acaoId, pagina, 100);
    clienteIds.push(...complemento.clientes.filter((cliente) => cliente.elegivel).slice(0, 10 - clienteIds.length).map((cliente) => cliente.clienteId));
  }
  if (clienteIds.length === 0) return { ...candidatos, pagina: 1, tamanhoPagina: 10, clientes: [] };
  await porta.atualizarCriterios(acaoId, { ...criteriosSemFiltros, modo: "Manual", clienteIds });
  return porta.simularPublico(acaoId, 1, 10);
}

export async function montarListaRapida(acaoId: string): Promise<ResultadoSimularPublico> {
  const validacao = esquemaAcaoId.safeParse(acaoId);
  if (!validacao.success) return { sucesso: false, mensagem: "A Ação Comercial informada é inválida." };
  const sessao = await obterPortaSessao().obterSessao();
  if (!sessao) redirect(`/entrar?retorno=/acoes-comerciais/${acaoId}`);
  try {
    return { sucesso: true, simulacao: await montarListaComFiltros(obterPortaCrmApi(), acaoId, criteriosSemFiltros) };
  } catch (erro) {
    if (erro instanceof ErroCrmApi) return { sucesso: false, mensagem: erro.status === 403 ? "Seu perfil não possui permissão para escolher clientes." : erro.status === 409 ? "O rascunho foi alterado recentemente. Atualize a página." : erro.status === 422 ? erro.message : "Não foi possível montar a lista agora. Tente novamente." };
    throw erro;
  }
}

export async function montarListaPorRegiao(entrada: z.input<typeof esquemaListaPorRegiao>): Promise<ResultadoSimularPublico> {
  const validacao = esquemaListaPorRegiao.safeParse(entrada);
  if (!validacao.success) return { sucesso: false, mensagem: "Selecione uma cidade e, se quiser, bairros válidos." };
  const cidade = cidadesAtendidas.find((item) => item === validacao.data.cidade);
  if (!cidade) return { sucesso: false, mensagem: "Escolha uma cidade atendida pela LavaMais." };
  const bairrosPermitidos = bairrosAtendidosPorCidade[cidade] as readonly string[];
  if (validacao.data.bairros.some((bairro) => !bairrosPermitidos.includes(bairro))) return { sucesso: false, mensagem: "Escolha apenas bairros da cidade selecionada." };
  const sessao = await obterPortaSessao().obterSessao();
  if (!sessao) redirect(`/entrar?retorno=/acoes-comerciais/${validacao.data.acaoId}`);
  try {
    const criterios: CriteriosDeSegmentacao = { ...criteriosSemFiltros, cidades: [cidade], bairros: validacao.data.bairros.length ? validacao.data.bairros : null };
    return { sucesso: true, simulacao: await montarListaComFiltros(obterPortaCrmApi(), validacao.data.acaoId, criterios) };
  } catch (erro) {
    if (erro instanceof ErroCrmApi) return { sucesso: false, mensagem: erro.status === 403 ? "Seu perfil não possui permissão para escolher clientes." : erro.status === 409 ? "O rascunho foi alterado recentemente. Atualize a página." : erro.status === 422 ? erro.message : "Não foi possível buscar clientes da região agora. Tente novamente." };
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

export async function atualizarInformacoesAcao(entrada: { acaoId: string; nome: string; objetivo: string; itemDeCatalogoId: string | null }): Promise<{ sucesso: true } | { sucesso: false; mensagem: string }> {
  const validacao = z.object({ acaoId: z.string().uuid(), nome: z.string().trim().min(3).max(160), objetivo: z.string().trim().min(10).max(500), itemDeCatalogoId: z.string().uuid().nullable() }).safeParse(entrada);
  if (!validacao.success) return { sucesso: false, mensagem: "Informe nome, objetivo e item válidos." };
  const sessao = await obterPortaSessao().obterSessao();
  if (!sessao) redirect(`/entrar?retorno=/acoes-comerciais/${validacao.data.acaoId}`);
  try {
    const porta = obterPortaCrmApi(); const acao = await porta.obter(validacao.data.acaoId);
    if (!acao || acao.situacao !== "Rascunho") return { sucesso: false, mensagem: "Somente rascunhos podem ter as informações corrigidas." };
    await porta.atualizarAcao(validacao.data.acaoId, { nome: validacao.data.nome, objetivo: validacao.data.objetivo, itemDeCatalogoId: validacao.data.itemDeCatalogoId, versaoModeloId: acao.versaoModeloId, criterios: acao.criterios });
  } catch (erro) { if (erro instanceof ErroCrmApi) return { sucesso: false, mensagem: erro.status === 409 ? "O rascunho foi alterado. Atualize e tente novamente." : erro.status === 403 ? "Seu perfil não pode editar esta ação." : erro.status === 422 ? erro.message : "Não foi possível salvar as informações." }; throw erro; }
  revalidatePath(`/acoes-comerciais/${validacao.data.acaoId}`);
  return { sucesso: true };
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

export async function cancelarAcao(entrada: { acaoId: string; motivo: string; versao: number }): Promise<ResultadoCancelarAcao> {
  const validacao = z.object({ acaoId: z.string().uuid(), motivo: z.string().trim().min(3).max(300), versao: z.number().int().nonnegative() }).safeParse(entrada);
  if (!validacao.success) return { sucesso: false, mensagem: "Informe um motivo para cancelar a ação." };
  const sessao = await obterPortaSessao().obterSessao();
  if (!sessao) redirect(`/entrar?retorno=/acoes-comerciais/${validacao.data.acaoId}`);
  if (sessao?.papel === "Operador") return { sucesso: false, mensagem: "Somente gerentes podem cancelar uma ação." };
  try {
    await obterPortaCrmApi().cancelarAcao(validacao.data.acaoId, validacao.data.motivo, validacao.data.versao);
  } catch (erro) {
    if (erro instanceof ErroCrmApi) return { sucesso: false, mensagem: erro.status === 409 ? "A ação mudou enquanto você revisava. Atualize a página." : erro.status === 403 ? "Seu perfil não possui permissão para cancelar ações." : erro.status === 422 ? erro.message : "Não foi possível cancelar a ação agora." };
    throw erro;
  }
  revalidatePath(`/acoes-comerciais/${validacao.data.acaoId}`);
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
