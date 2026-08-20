"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AtualizacaoAutomatica() {
  const roteador = useRouter(); const [atualizando, iniciarTransicao] = useTransition();
  function atualizar() { iniciarTransicao(() => roteador.refresh()); }
  useEffect(() => { const intervalo = window.setInterval(() => roteador.refresh(), 15_000); return () => window.clearInterval(intervalo); }, [roteador]);
  return <div className="mb-4 flex items-center justify-end gap-3 text-xs text-muted-foreground"><span aria-live="polite">{atualizando ? "Atualizando indicadores..." : "Atualização automática a cada 15 segundos"}</span><Button type="button" size="sm" variant="outline" onClick={atualizar} disabled={atualizando}><RefreshCw className={atualizando ? "animate-spin" : ""} />Atualizar agora</Button></div>;
}
