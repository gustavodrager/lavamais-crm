import "server-only";

import { cookies } from "next/headers";
import { autenticacaoEstaDesabilitada, obterAccessTokenDesenvolvimento } from "@/infraestrutura/autenticacao-desenvolvimento";
import { obterSessao } from "@/infraestrutura/repositorio-sessoes";
import type { PortaSessao } from "@/portas/sessao";

export const NOME_COOKIE_SESSAO = process.env.LAVAMAIS_AMBIENTE_TESTE === "1" ? "lavamais-sessao-teste" : "__Host-lavamais-sessao";

async function obterRegistro() {
  const id = (await cookies()).get(NOME_COOKIE_SESSAO)?.value;
  if (process.env.LAVAMAIS_AMBIENTE_TESTE === "1" && id?.startsWith("sessao-controlada")) {
    const administrador = id === "sessao-controlada-admin-e2e" || id === "sessao-controlada-admin-operador-e2e";
    return {
      apresentacao: {
        usuario: { nome: "Teste Automatizado", iniciais: "TA" },
        tenant: { nome: "Tenant de teste" },
        papel: administrador ? "Administrador" as const : id === "sessao-controlada-operador-e2e" ? "Operador" as const : "Gerente" as const,
        papelVisualizado: id === "sessao-controlada-admin-operador-e2e" ? "Operador" as const : undefined,
      },
      accessToken: "token-controlado-e2e",
      expiraEm: Date.now() + 3_600_000,
    };
  }

  return id ? obterSessao(id) : undefined;
}

export async function obterAccessToken() {
  if (autenticacaoEstaDesabilitada()) return obterAccessTokenDesenvolvimento();
  const sessao = await obterRegistro();
  return sessao && sessao.expiraEm > Date.now() ? sessao.accessToken : null;
}

export const sessaoLocal: PortaSessao = {
  async obterSessao() {
    if (autenticacaoEstaDesabilitada()) {
      return {
        usuario: { nome: "Ambiente local", iniciais: "AL" },
        tenant: { nome: "Tenant derivado pela CRM API" },
        papel: "Gerente",
        autenticacaoDesabilitada: true,
      };
    }

    const sessao = await obterRegistro();
    return sessao && sessao.expiraEm > Date.now() ? sessao.apresentacao : null;
  },
};
