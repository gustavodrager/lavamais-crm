"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { ErroCrmApi } from "@/infraestrutura/crm-api-http";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";
import { obterPortaSessao } from "@/infraestrutura/obter-porta-sessao";

const esquema = z.object({
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
  permiteMarketingWhatsapp: z.boolean(),
  retorno: z.string().trim().max(500).optional(),
});

export type EntradaCriarCliente = z.input<typeof esquema>;
export type ResultadoCriarCliente = { sucesso: false; mensagem: string; campos?: Partial<Record<keyof EntradaCriarCliente, string>> };

export async function criarCliente(entrada: EntradaCriarCliente): Promise<ResultadoCriarCliente> {
  const sessao = await obterPortaSessao().obterSessao();
  if (!sessao) redirect("/entrar?retorno=/clientes/novo");
  const validacao = esquema.safeParse(entrada);
  if (!validacao.success) {
    const campos = validacao.error.flatten().fieldErrors;
    return { sucesso: false, mensagem: "Revise os dados do cliente.", campos: Object.fromEntries(Object.entries(campos).map(([campo, erros]) => [campo, erros?.[0]])) };
  }
  const dados = validacao.data;
  const retorno = normalizarRetorno(dados.retorno);
  if (retorno?.startsWith("/roteiros") && (!dados.logradouro || !dados.numero || !dados.cidade)) {
    return {
      sucesso: false,
      mensagem: "Complete o endereço para adicionar o cliente ao roteiro.",
      campos: {
        logradouro: dados.logradouro ? undefined : "Informe o logradouro.",
        numero: dados.numero ? undefined : "Informe o número.",
        cidade: dados.cidade ? undefined : "Informe a cidade.",
      },
    };
  }
  let criado: { id: string };
  try {
    const possuiEndereco = Boolean(dados.logradouro || dados.numero || dados.complemento || dados.bairro || dados.cidade || dados.estado || dados.cep);
    criado = await obterPortaCrmApi().criarCliente({
      nome: dados.nome,
      whatsapp: dados.whatsapp,
      nomeFantasia: dados.nomeFantasia || null,
      tipo: dados.tipo || null,
      email: dados.email || null,
      dataNascimento: dados.dataNascimento || null,
      permiteMarketingWhatsapp: dados.permiteMarketingWhatsapp,
      endereco: possuiEndereco ? {
        logradouro: dados.logradouro || null,
        numero: dados.numero || null,
        complemento: dados.complemento || null,
        bairro: dados.bairro || null,
        cidade: dados.cidade || null,
        estado: dados.estado || null,
        cep: dados.cep || null,
      } : null,
      etiquetaIds: [],
      codigoExterno: dados.codigoExterno || null,
      dataCadastroOrigem: null,
    });
  } catch (erro) {
    if (erro instanceof ErroCrmApi) return { sucesso: false, mensagem: erro.status === 409 || erro.status === 422 ? erro.message : erro.status === 403 ? "Seu perfil não possui permissão para cadastrar clientes." : "Não foi possível cadastrar o cliente agora." };
    throw erro;
  }
  if (retorno?.startsWith("/movimentacoes") || retorno?.startsWith("/roteiros")) {
    const url = new URL(retorno, "http://lavamais.local");
    url.searchParams.set("clienteId", criado.id);
    url.searchParams.set("busca", dados.nome);
    redirect(`${url.pathname}${url.search}`);
  }
  redirect(retorno ?? `/clientes/${criado.id}?sucesso=Cliente+cadastrado`);
}

function normalizarRetorno(valor: string | undefined) {
  return valor && valor.startsWith("/") && !valor.startsWith("//") ? valor : null;
}
