"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ConfirmarConclusao() {
  return <Button type="submit" className="w-full bg-green-700 hover:bg-green-800" onClick={(evento) => { if (!window.confirm("Confirmar que esta parada foi realizada?")) evento.preventDefault(); }}><CheckCircle2 />Concluir parada</Button>;
}
