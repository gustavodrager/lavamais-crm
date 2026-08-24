import "server-only";

import { cookies } from "next/headers";
import { z } from "zod";
import { descobrirOidc, obterConfiguracaoOidc } from "@/infraestrutura/configuracao-oidc";
import { comBloqueioDaSessao, excluirSessao, obterSessao, salvarSessao, type SessaoServidor } from "@/infraestrutura/repositorio-sessoes";
import type { PortaSessao } from "@/portas/sessao";
import { autenticacaoEstaDesabilitada, obterAccessTokenDesenvolvimento } from "@/infraestrutura/autenticacao-desenvolvimento";

export const NOME_COOKIE_SESSAO = process.env.LAVAMAIS_AMBIENTE_TESTE === "1" ? "lavamais-sessao-teste" : "__Host-lavamais-sessao";
const renovacoes = new Map<string, Promise<SessaoServidor | null>>();
const esquemaToken = z.object({ access_token: z.string().min(1), refresh_token: z.string().optional(), id_token: z.string().optional(), expires_in: z.number().positive() });

async function obterRegistro() {
  const id = (await cookies()).get(NOME_COOKIE_SESSAO)?.value;
  if (process.env.LAVAMAIS_AMBIENTE_TESTE === "1" && id === "sessao-controlada-e2e") return { id, sessao: { apresentacao: { usuario: { nome: "Teste Automatizado", iniciais: "TA" }, tenant: { nome: "Tenant de teste" }, papel: "Gerente" as const }, accessToken: "token-controlado-e2e", expiraEm: Date.now() + 3_600_000 } };
  return id ? { id, sessao: await obterSessao(id) } : null;
}

async function renovar(id: string, sessao: SessaoServidor) {
  if (!sessao.refreshToken) return null;
  const refreshToken = sessao.refreshToken;
  const existente = renovacoes.get(id); if (existente) return existente;
  const tarefa = (async () => {
    return comBloqueioDaSessao(id, async (cliente) => {
      const persistida = await obterSessao(id, cliente); if (!persistida) return null;
      if (persistida.expiraEm > Date.now() + 30_000) return persistida;
      const configuracao = obterConfiguracaoOidc(); const descoberta = await descobrirOidc();
      const corpo = new URLSearchParams({ grant_type: "refresh_token", refresh_token: persistida.refreshToken ?? refreshToken, client_id: configuracao.clientId });
      if (configuracao.clientSecret) corpo.set("client_secret", configuracao.clientSecret);
      const resposta = await fetch(descoberta.token_endpoint, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: corpo, cache: "no-store" });
      if (!resposta.ok) { await excluirSessao(id, cliente); return null; }
      const tokens = esquemaToken.parse(await resposta.json());
      const atualizada = { ...persistida, accessToken: tokens.access_token, refreshToken: tokens.refresh_token ?? persistida.refreshToken, idToken: tokens.id_token ?? persistida.idToken, expiraEm: Date.now() + tokens.expires_in * 1000 };
      await salvarSessao(id, atualizada, cliente); return atualizada;
    });
  })().finally(() => renovacoes.delete(id));
  renovacoes.set(id, tarefa); return tarefa;
}

export async function obterAccessToken() {
  if (autenticacaoEstaDesabilitada()) return obterAccessTokenDesenvolvimento();
  const registro = await obterRegistro(); if (!registro?.sessao) return null;
  if (registro.sessao.expiraEm > Date.now() + 30_000) return registro.sessao.accessToken;
  return (await renovar(registro.id, registro.sessao))?.accessToken ?? null;
}

export const sessaoOidc: PortaSessao = {
  async obterSessao() {
    if (autenticacaoEstaDesabilitada()) {
      return { usuario: { nome: "Ambiente local", iniciais: "AL" }, tenant: { nome: "Tenant derivado pela CRM API" }, papel: "Gerente", autenticacaoDesabilitada: true };
    }
    return (await obterRegistro())?.sessao?.apresentacao ?? null;
  },
};
