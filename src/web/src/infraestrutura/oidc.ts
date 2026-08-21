import "server-only";

import { createHash, createPublicKey, randomBytes, randomUUID, verify } from "node:crypto";
import type { JsonWebKey as ChaveWebJson } from "node:crypto";
import { z } from "zod";
import { descobrirOidc, obterConfiguracaoOidc, type DescobertaOidc } from "@/infraestrutura/configuracao-oidc";
import { consumirEstadoOidc, salvarEstadoOidc, salvarSessao } from "@/infraestrutura/repositorio-sessoes";

const esquemaTokens = z.object({ access_token: z.string().min(1), refresh_token: z.string().optional(), id_token: z.string().min(1), expires_in: z.number().positive() });
const esquemaUsuario = z.object({
  sub: z.string().min(1), tenant_id: z.string().min(1), tenant_slug: z.string().optional(),
  name: z.string().optional(), preferred_username: z.string().optional(), email: z.string().optional(),
});
const base64Url = (valor: Buffer) => valor.toString("base64url");
const esquemaCabecalhoJwt = z.object({ alg: z.literal("RS256"), kid: z.string().min(1) });
const esquemaClaimsId = z.object({ iss: z.string(), aud: z.union([z.string(), z.array(z.string())]), sub: z.string().min(1), exp: z.number(), nonce: z.string() });
const esquemaJwks = z.object({ keys: z.array(z.object({ kid: z.string(), kty: z.string() }).passthrough()) });

async function validarIdToken(token: string, nonce: string, descoberta: DescobertaOidc, clientId: string) {
  const partes = token.split("."); if (partes.length !== 3) throw new Error("Identity token malformado.");
  const cabecalho = esquemaCabecalhoJwt.parse(JSON.parse(Buffer.from(partes[0], "base64url").toString("utf8")));
  const claims = esquemaClaimsId.parse(JSON.parse(Buffer.from(partes[1], "base64url").toString("utf8")));
  const resposta = await fetch(descoberta.jwks_uri, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(10_000) });
  if (!resposta.ok) throw new Error("Nao foi possivel obter as chaves do Identity Hub.");
  const chave = esquemaJwks.parse(await resposta.json()).keys.find((item) => item.kid === cabecalho.kid);
  if (!chave || !verify("RSA-SHA256", Buffer.from(`${partes[0]}.${partes[1]}`), createPublicKey({ key: chave as ChaveWebJson, format: "jwk" }), Buffer.from(partes[2], "base64url"))) throw new Error("Assinatura do identity token invalida.");
  const audiencias = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (claims.iss !== descoberta.issuer || !audiencias.includes(clientId) || claims.exp * 1000 <= Date.now() || claims.nonce !== nonce) throw new Error("Claims do identity token invalidos.");
  return claims;
}

export async function iniciarOidc(retorno: string) {
  const configuracao = obterConfiguracaoOidc(); const descoberta = await descobrirOidc();
  const state = base64Url(randomBytes(32)); const nonce = base64Url(randomBytes(32)); const verificadorPkce = base64Url(randomBytes(48));
  const identificador = randomUUID(); await salvarEstadoOidc(identificador, { state, nonce, verificadorPkce, retorno: retorno.startsWith("/") && !retorno.startsWith("//") ? retorno : "/acoes-comerciais" });
  const url = new URL(descoberta.authorization_endpoint);
  url.search = new URLSearchParams({ response_type: "code", client_id: configuracao.clientId, redirect_uri: new URL("/api/autenticacao/callback", configuracao.urlAplicacao).toString(), scope: "openid profile email offline_access", state, nonce, code_challenge: base64Url(createHash("sha256").update(verificadorPkce).digest()), code_challenge_method: "S256" }).toString();
  return { url, identificador };
}

export async function concluirOidc(identificador: string, code: string, state: string) {
  const transacao = await consumirEstadoOidc(identificador);
  if (!transacao || transacao.state !== state) throw new Error("Estado OIDC invalido ou expirado.");
  const configuracao = obterConfiguracaoOidc(); const descoberta = await descobrirOidc();
  const corpo = new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: new URL("/api/autenticacao/callback", configuracao.urlAplicacao).toString(), client_id: configuracao.clientId, code_verifier: transacao.verificadorPkce });
  if (configuracao.clientSecret) corpo.set("client_secret", configuracao.clientSecret);
  const respostaToken = await fetch(descoberta.token_endpoint, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: corpo, cache: "no-store" });
  if (!respostaToken.ok) throw new Error("O Identity Hub recusou a troca do codigo OIDC.");
  const tokens = esquemaTokens.parse(await respostaToken.json());
  const identidade = await validarIdToken(tokens.id_token, transacao.nonce, descoberta, configuracao.clientId);
  const respostaUsuario = await fetch(descoberta.userinfo_endpoint, { headers: { Authorization: `Bearer ${tokens.access_token}` }, cache: "no-store" });
  if (!respostaUsuario.ok) throw new Error("Nao foi possivel obter o usuario no Identity Hub.");
  const usuario = esquemaUsuario.parse(await respostaUsuario.json());
  if (usuario.sub !== identidade.sub) throw new Error("Identity token e UserInfo pertencem a usuarios diferentes.");
  const nome = usuario.name ?? usuario.preferred_username ?? usuario.email ?? "Usuario";
  const id = randomUUID(); await salvarSessao(id, { apresentacao: { usuario: { nome, iniciais: nome.split(/\s+/).slice(0, 2).map((parte) => parte[0]).join("").toUpperCase() }, tenant: { nome: usuario.tenant_slug ?? usuario.tenant_id } }, accessToken: tokens.access_token, refreshToken: tokens.refresh_token, idToken: tokens.id_token, expiraEm: Date.now() + tokens.expires_in * 1000 });
  return { id, retorno: transacao.retorno };
}
