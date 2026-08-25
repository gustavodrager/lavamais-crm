import "server-only";

import { sessaoLocal } from "@/infraestrutura/sessao-local";
import type { PortaSessao } from "@/portas/sessao";

export function obterPortaSessao(): PortaSessao {
  return sessaoLocal;
}
