import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { salvarSessao } from "@/infraestrutura/repositorio-sessoes";
import { NOME_COOKIE_SESSAO } from "@/infraestrutura/sessao-local";
import { criarUrlDaAplicacao } from "@/infraestrutura/url-aplicacao";

const esquema = z.object({ token: z.string().min(1), expiraEm: z.string(), nome: z.string(), nomeTenant: z.string(), papel: z.enum(["Administrador", "Gerente", "Operador"]) });
function retornoSeguro(valor: FormDataEntryValue | string | null) {
  const caminho = typeof valor === "string" ? valor : valor?.toString();
  return caminho && caminho.startsWith("/") && !caminho.startsWith("//") ? caminho : null;
}

export async function GET(requisicao: NextRequest) {
  const retorno = retornoSeguro(new URL(requisicao.url).searchParams.get("retorno"));
  const destino = retorno ? `/entrar?${new URLSearchParams({ retorno }).toString()}` : "/entrar";
  return NextResponse.redirect(criarUrlDaAplicacao(destino, requisicao.url), 303);
}

export async function POST(requisicao: NextRequest) {
  const dados = await requisicao.formData(); const telefone = String(dados.get("telefone") ?? ""); const senha = String(dados.get("senha") ?? ""); const primeiro = dados.get("primeiroAcesso") === "1"; const retorno = retornoSeguro(dados.get("retorno")); const urlApi = process.env.LAVAMAIS_CRM_API_URL;
  if (!urlApi) return NextResponse.redirect(criarUrlDaAplicacao(`/entrar?${new URLSearchParams({ erro: "configuracao", ...(retorno ? { retorno } : {}) })}`, requisicao.url), 303);
  try {
    const resposta = await fetch(new URL(`/api/v1/autenticacao/${primeiro ? "primeiro-acesso" : "entrar"}`, urlApi), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ telefone, senha }), cache: "no-store" });
    if (!resposta.ok) return NextResponse.redirect(criarUrlDaAplicacao(`/entrar?${new URLSearchParams({ erro: "credenciais", ...(retorno ? { retorno } : {}) })}`, requisicao.url), 303);
    const sessao = esquema.parse(await resposta.json()); const id = randomUUID(); const iniciais = sessao.nome.split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
    await salvarSessao(id, { apresentacao: { usuario: { nome: sessao.nome, iniciais }, tenant: { nome: sessao.nomeTenant }, papel: sessao.papel }, accessToken: sessao.token, expiraEm: new Date(sessao.expiraEm).getTime() });
    const destinoPadrao = sessao.papel === "Operador" ? "/inicio" : "/inicio";
    const destino = NextResponse.redirect(criarUrlDaAplicacao(retorno ?? destinoPadrao, requisicao.url), 303); destino.cookies.set(NOME_COOKIE_SESSAO, id, { httpOnly: true, secure: true, sameSite: "lax", path: "/" }); return destino;
  } catch { return NextResponse.redirect(criarUrlDaAplicacao(`/entrar?${new URLSearchParams({ erro: "indisponivel", ...(retorno ? { retorno } : {}) })}`, requisicao.url), 303); }
}
