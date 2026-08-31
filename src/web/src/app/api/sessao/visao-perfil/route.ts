import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { obterSessao, salvarSessao } from "@/infraestrutura/repositorio-sessoes";
import { NOME_COOKIE_SESSAO } from "@/infraestrutura/sessao-local";

const esquema = z.object({ papel: z.enum(["Administrador", "Gerente", "Operador"]) });

export async function POST(requisicao: NextRequest) {
  const id = requisicao.cookies.get(NOME_COOKIE_SESSAO)?.value;
  if (!id) return NextResponse.json({ mensagem: "Sessao nao encontrada." }, { status: 401 });

  const sessao = await obterSessao(id);
  if (!sessao || sessao.expiraEm <= Date.now()) return NextResponse.json({ mensagem: "Sessao expirada." }, { status: 401 });
  if (sessao.apresentacao.papel !== "Administrador") return NextResponse.json({ mensagem: "Somente administradores podem alternar a visao." }, { status: 403 });

  const validacao = esquema.safeParse(await requisicao.json().catch(() => null));
  if (!validacao.success) return NextResponse.json({ mensagem: "Perfil invalido." }, { status: 400 });

  await salvarSessao(id, {
    ...sessao,
    apresentacao: {
      ...sessao.apresentacao,
      papelVisualizado: validacao.data.papel === "Administrador" ? undefined : validacao.data.papel,
    },
  });

  return new NextResponse(null, { status: 204 });
}
