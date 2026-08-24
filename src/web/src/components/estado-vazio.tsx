import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

export function EstadoVazio({ icone: Icone, titulo, descricao, acao }: { icone: LucideIcon; titulo: string; descricao: string; acao?: ReactNode }) {
  return <Card><CardContent className="flex min-h-64 flex-col items-center justify-center p-8 text-center"><span className="mb-4 grid size-12 place-items-center rounded-full bg-primary/10 text-primary"><Icone className="size-5" aria-hidden="true" /></span><h2 className="font-semibold text-[var(--marca-azul-profundo)]">{titulo}</h2><p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{descricao}</p>{acao ? <div className="mt-5">{acao}</div> : null}</CardContent></Card>;
}
