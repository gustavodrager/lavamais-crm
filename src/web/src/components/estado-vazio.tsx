import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function EstadoVazio({ icone: Icone, titulo, descricao }: { icone: LucideIcon; titulo: string; descricao: string }) {
  return <Card><CardContent className="flex min-h-64 flex-col items-center justify-center p-8 text-center"><span className="mb-4 grid size-12 place-items-center rounded-full bg-primary/10 text-primary"><Icone className="size-5" aria-hidden="true" /></span><h2 className="font-semibold">{titulo}</h2><p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{descricao}</p></CardContent></Card>;
}
