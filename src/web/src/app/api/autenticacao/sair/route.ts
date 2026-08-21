import { NextRequest, NextResponse } from "next/server";
import { excluirSessao } from "@/infraestrutura/repositorio-sessoes";
import { NOME_COOKIE_SESSAO } from "@/infraestrutura/sessao-oidc";
import { criarUrlDaAplicacao } from "@/infraestrutura/url-aplicacao";

export async function POST(requisicao: NextRequest) {
  const id = requisicao.cookies.get(NOME_COOKIE_SESSAO)?.value; if (id) await excluirSessao(id);
  const resposta = NextResponse.redirect(criarUrlDaAplicacao("/entrar", requisicao.url), 303); resposta.cookies.delete(NOME_COOKIE_SESSAO); return resposta;
}
