import type { SessaoApresentacao } from "@/contratos/apresentacao";

export type PapelDoCrm = NonNullable<SessaoApresentacao["papel"]>;

export function papelDaVisao(sessao: SessaoApresentacao | null | undefined): PapelDoCrm | undefined {
  if (!sessao?.papel) return undefined;
  return sessao.papel === "Administrador" ? sessao.papelVisualizado ?? sessao.papel : sessao.papel;
}

export function estaVisualizandoOutroPerfil(sessao: SessaoApresentacao) {
  return sessao.papel === "Administrador" && sessao.papelVisualizado && sessao.papelVisualizado !== "Administrador";
}
