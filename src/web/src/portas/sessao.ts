import type { SessaoApresentacao } from "@/contratos/apresentacao";

export interface PortaSessao {
  obterSessao(): Promise<SessaoApresentacao | null>;
}
