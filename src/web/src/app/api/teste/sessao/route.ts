import { NextResponse } from "next/server";
import { NOME_COOKIE_SESSAO } from "@/infraestrutura/sessao-local";

export async function GET(requisicao: Request) {
  if (process.env.LAVAMAIS_AMBIENTE_TESTE !== "1") return new Response(null, { status: 404 });
  const perfil = new URL(requisicao.url).searchParams.get("perfil");
  const idSessao = perfil === "operador" ? "sessao-controlada-operador-e2e" : perfil === "administrador" ? "sessao-controlada-admin-e2e" : "sessao-controlada-e2e";
  const resposta = NextResponse.redirect(new URL("/acoes-comerciais", requisicao.url)); resposta.cookies.set(NOME_COOKIE_SESSAO, idSessao, { httpOnly: true, secure: false, sameSite: "lax", path: "/" }); return resposta;
}
