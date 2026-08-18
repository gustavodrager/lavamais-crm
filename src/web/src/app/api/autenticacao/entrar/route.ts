import { NextRequest, NextResponse } from "next/server";
import { iniciarOidc } from "@/infraestrutura/oidc";

export async function GET(requisicao: NextRequest) {
  try {
    const { url, identificador } = await iniciarOidc(requisicao.nextUrl.searchParams.get("retorno") ?? "/acoes-comerciais");
    const resposta = NextResponse.redirect(url);
    resposta.cookies.set("__Host-lavamais-oidc", identificador, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 600 });
    return resposta;
  } catch { return NextResponse.redirect(new URL("/entrar?erro=configuracao", requisicao.url)); }
}
