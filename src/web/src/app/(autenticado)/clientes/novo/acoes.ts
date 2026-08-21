"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { ErroCrmApi } from "@/infraestrutura/crm-api-http";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";
import { obterPortaSessao } from "@/infraestrutura/obter-porta-sessao";

const esquema = z.object({
  nome: z.string().trim().min(2, "Informe o nome do cliente.").max(200),
  whatsapp: z.string().trim().min(8, "Informe o WhatsApp com DDD.").max(30),
  tipo: z.string().trim().max(80),
  bairro: z.string().trim().max(120),
  cidade: z.string().trim().max(120),
  codigoExterno: z.string().trim().max(100),
  permiteMarketingWhatsapp: z.boolean(),
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
  try {
    await obterPortaCrmApi().criarCliente({ nome: dados.nome, whatsapp: dados.whatsapp, tipo: dados.tipo || null, permiteMarketingWhatsapp: dados.permiteMarketingWhatsapp, endereco: { bairro: dados.bairro || null, cidade: dados.cidade || null }, codigoExterno: dados.codigoExterno || null });
  } catch (erro) {
    if (erro instanceof ErroCrmApi) return { sucesso: false, mensagem: erro.status === 409 || erro.status === 422 ? erro.message : erro.status === 403 ? "Seu perfil não possui permissão para cadastrar clientes." : "Não foi possível cadastrar o cliente agora." };
    throw erro;
  }
  redirect("/clientes");
}
