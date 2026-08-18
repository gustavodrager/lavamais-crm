import { NextRequest, NextResponse } from "next/server";
import { sessoes } from "@/infraestrutura/repositorio-sessoes";
import { NOME_COOKIE_SESSAO } from "@/infraestrutura/sessao-oidc";

export async function POST(requisicao: NextRequest) {
  const id = requisicao.cookies.get(NOME_COOKIE_SESSAO)?.value; if (id) sessoes.delete(id);
  const resposta = NextResponse.redirect(new URL("/entrar", requisicao.url), 303); resposta.cookies.delete(NOME_COOKIE_SESSAO); return resposta;
}
