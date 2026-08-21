import "server-only";

import { sessaoOidc } from "@/infraestrutura/sessao-oidc";
import type { PortaSessao } from "@/portas/sessao";

export function obterPortaSessao(): PortaSessao {
  return sessaoOidc;
}
