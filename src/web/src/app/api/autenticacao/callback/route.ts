import { NextRequest, NextResponse } from "next/server";
import { concluirOidc } from "@/infraestrutura/oidc";
import { NOME_COOKIE_SESSAO } from "@/infraestrutura/sessao-oidc";
import { criarUrlDaAplicacao } from "@/infraestrutura/url-aplicacao";

export async function GET(requisicao: NextRequest) {
  const identificador = requisicao.cookies.get("__Host-lavamais-oidc")?.value;
  const code = requisicao.nextUrl.searchParams.get("code"); const state = requisicao.nextUrl.searchParams.get("state");
  if (!identificador || !code || !state || requisicao.nextUrl.searchParams.has("error")) return NextResponse.redirect(criarUrlDaAplicacao("/entrar?erro=callback", requisicao.url));
  try {
    const sessao = await concluirOidc(identificador, code, state); const resposta = NextResponse.redirect(criarUrlDaAplicacao(sessao.retorno, requisicao.url));
    resposta.cookies.delete("__Host-lavamais-oidc"); resposta.cookies.set(NOME_COOKIE_SESSAO, sessao.id, { httpOnly: true, secure: true, sameSite: "lax", path: "/" }); return resposta;
  } catch { return NextResponse.redirect(criarUrlDaAplicacao("/entrar?erro=callback", requisicao.url)); }
}
