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
async function autenticar(urlApi: string, rota: "primeiro-acesso" | "entrar", telefone: string, senha: string) {
  return await fetch(new URL(`/api/v1/autenticacao/${rota}`, urlApi), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ telefone, senha }), cache: "no-store" });
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
    let resposta = await autenticar(urlApi, primeiro ? "primeiro-acesso" : "entrar", telefone, senha);
    if (primeiro && !resposta.ok) resposta = await autenticar(urlApi, "entrar", telefone, senha);
    if (!resposta.ok) {
      const erro = resposta.status === 401 || resposta.status === 400 ? "credenciais" : resposta.status === 429 ? "tentativas" : "indisponivel";
      return NextResponse.redirect(criarUrlDaAplicacao(`/entrar?${new URLSearchParams({ erro, ...(retorno ? { retorno } : {}) })}`, requisicao.url), 303);
    }
    const sessao = esquema.parse(await resposta.json()); const id = randomUUID(); const iniciais = sessao.nome.split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
    await salvarSessao(id, { apresentacao: { usuario: { nome: sessao.nome, iniciais }, tenant: { nome: sessao.nomeTenant }, papel: sessao.papel }, accessToken: sessao.token, expiraEm: new Date(sessao.expiraEm).getTime() });
    const destinoPadrao = sessao.papel === "Operador" ? "/inicio" : "/inicio";
    const destino = NextResponse.redirect(criarUrlDaAplicacao(retorno ?? destinoPadrao, requisicao.url), 303);
    destino.cookies.set(NOME_COOKIE_SESSAO, id, { httpOnly: true, secure: true, sameSite: "lax", path: "/", expires: new Date(sessao.expiraEm), priority: "high" });
    destino.headers.set("Cache-Control", "no-store");
    return destino;
  } catch { return NextResponse.redirect(criarUrlDaAplicacao(`/entrar?${new URLSearchParams({ erro: "indisponivel", ...(retorno ? { retorno } : {}) })}`, requisicao.url), 303); }
}
