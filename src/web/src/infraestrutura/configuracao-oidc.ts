import "server-only";
import { z } from "zod";

const esquemaDescoberta = z.object({
  issuer: z.string().url(), jwks_uri: z.string().url(),
  authorization_endpoint: z.string().url(), token_endpoint: z.string().url(),
  userinfo_endpoint: z.string().url(), end_session_endpoint: z.string().url().optional(),
});

export type DescobertaOidc = z.infer<typeof esquemaDescoberta>;

export function obterConfiguracaoOidc() {
  const autoridade = process.env.LAVAMAIS_OIDC_AUTORIDADE;
  const clientId = process.env.LAVAMAIS_OIDC_CLIENT_ID;
  const urlAplicacao = process.env.LAVAMAIS_URL_APLICACAO;
  if (!autoridade || !clientId || !urlAplicacao) throw new Error("OIDC nao configurado: informe LAVAMAIS_OIDC_AUTORIDADE, LAVAMAIS_OIDC_CLIENT_ID e LAVAMAIS_URL_APLICACAO.");
  return { autoridade, clientId, clientSecret: process.env.LAVAMAIS_OIDC_CLIENT_SECRET, urlAplicacao };
}

export async function descobrirOidc() {
  const { autoridade } = obterConfiguracaoOidc();
  const resposta = await fetch(new URL(".well-known/openid-configuration", `${autoridade.replace(/\/$/, "")}/`), { next: { revalidate: 3600 }, signal: AbortSignal.timeout(10_000) });
  if (!resposta.ok) throw new Error("Nao foi possivel descobrir os endpoints do Identity Hub.");
  return esquemaDescoberta.parse(await resposta.json());
}
