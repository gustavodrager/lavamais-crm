import "server-only";

import type { PortaSessao } from "@/portas/sessao";

export const sessaoDemonstracao: PortaSessao = {
  async obterSessao() {
    return {
      usuario: { nome: "Marina Costa", iniciais: "MC" },
      tenant: { nome: "LavaMais Praia Grande" },
      papel: "Gerente",
    };
  },
};
