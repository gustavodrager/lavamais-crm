"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { ErroCrmApi } from "@/infraestrutura/crm-api-http";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";
import { obterPortaSessao } from "@/infraestrutura/obter-porta-sessao";

export type EstadoAtualizacaoCliente = { mensagem?: string };

const esquema = z.object({
  clienteId: z.string().uuid(),
  nome: z.string().trim().min(2, "Informe o nome do cliente.").max(200),
  whatsapp: z.string().trim().min(8, "Informe o WhatsApp com DDD.").max(30),
  nomeFantasia: z.string().trim().max(200),
  tipo: z.string().trim().max(80),
  email: z.union([z.string().trim().email("Informe um e-mail válido."), z.literal("")]),
  dataNascimento: z.string().trim().max(10),
  logradouro: z.string().trim().max(200),
  numero: z.string().trim().max(30),
  complemento: z.string().trim().max(100),
  bairro: z.string().trim().max(120),
  cidade: z.string().trim().max(120),
  estado: z.string().trim().max(2),
  cep: z.string().trim().max(12),
  codigoExterno: z.string().trim().max(100),
  retorno: z.string().trim().max(600).optional(),
});

export async function atualizarCliente(_estado: EstadoAtualizacaoCliente, formulario: FormData): Promise<EstadoAtualizacaoCliente> {
  const sessao = await obterPortaSessao().obterSessao();
  if (!sessao) redirect("/entrar?retorno=/clientes");
  const validacao = esquema.safeParse(Object.fromEntries(formulario));
  if (!validacao.success) return { mensagem: validacao.error.issues[0]?.message ?? "Revise os dados do cliente." };

  const dados = validacao.data;
  if (dados.retorno?.startsWith("/roteiros") && (!dados.logradouro || !dados.numero || !dados.cidade)) {
    return { mensagem: "Complete logradouro, número e cidade para continuar no roteiro." };
  }
  const api = obterPortaCrmApi();
  try {
    const atual = await api.obterCliente(dados.clienteId);
    if (!atual) return { mensagem: "O cliente não foi encontrado." };
    const possuiEndereco = Boolean(dados.logradouro || dados.numero || dados.complemento || dados.bairro || dados.cidade || dados.estado || dados.cep);
    await api.atualizarCliente(dados.clienteId, {
      nome: dados.nome,
      whatsapp: dados.whatsapp,
      nomeFantasia: dados.nomeFantasia || null,
      tipo: dados.tipo || null,
      email: dados.email || null,
      dataNascimento: dados.dataNascimento || null,
      permiteMarketingWhatsapp: formulario.get("permiteMarketingWhatsapp") === "on",
      endereco: possuiEndereco ? {
        logradouro: dados.logradouro || null,
        numero: dados.numero || null,
        complemento: dados.complemento || null,
        bairro: dados.bairro || null,
        cidade: dados.cidade || null,
        estado: dados.estado || null,
        cep: dados.cep || null,
      } : null,
      etiquetaIds: atual.etiquetaIds,
      codigoExterno: dados.codigoExterno || null,
      dataCadastroOrigem: atual.dataCadastroOrigem,
    });
  } catch (erro) {
    if (erro instanceof ErroCrmApi) {
      return { mensagem: erro.status === 409 || erro.status === 422 ? erro.message : erro.status === 403 ? "Seu perfil não possui permissão para editar clientes." : "Não foi possível salvar o cliente agora." };
    }
    throw erro;
  }

  const retorno = normalizarRetorno(dados.retorno);
  redirect(retorno ?? `/clientes/${dados.clienteId}?sucesso=Cadastro+atualizado`);
}

function normalizarRetorno(valor: string | undefined) {
  return valor && valor.startsWith("/") && !valor.startsWith("//") ? valor : null;
}
