import { Badge } from "@/components/ui/badge";
import type { SituacaoAcaoComercial } from "@/contratos/apresentacao";

const rotulos: Record<SituacaoAcaoComercial, string> = { Rascunho: "Rascunho", AguardandoAprovacao: "Aguardando aprovação", Preparada: "Aprovada", EmProcessamento: "Em execução", Concluida: "Concluída", ConcluidaComFalhas: "Concluída com falhas", Cancelada: "Cancelada", Rejeitada: "Rejeitada" };

export function SituacaoAcao({ situacao }: { situacao: SituacaoAcaoComercial }) {
  const variante = situacao === "ConcluidaComFalhas" ? "destructive" : situacao === "EmProcessamento" ? "default" : "secondary";
  return <Badge variant={variante}>{rotulos[situacao]}</Badge>;
}
