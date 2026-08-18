import { NextResponse } from "next/server";
import { NOME_COOKIE_SESSAO } from "@/infraestrutura/sessao-oidc";

export async function GET(requisicao: Request) {
  if (process.env.LAVAMAIS_AMBIENTE_TESTE !== "1") return new Response(null, { status: 404 });
  const resposta = NextResponse.redirect(new URL("/acoes-comerciais", requisicao.url)); resposta.cookies.set(NOME_COOKIE_SESSAO, "sessao-controlada-e2e", { httpOnly: true, secure: false, sameSite: "lax", path: "/" }); return resposta;
}
