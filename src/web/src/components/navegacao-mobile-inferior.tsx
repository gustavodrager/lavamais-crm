"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ellipsis, House, Megaphone, Users } from "lucide-react";
import { useState } from "react";
import { Marca } from "@/components/marca";
import { Navegacao } from "@/components/navegacao";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const atalhos = [
  { href: "/inicio", rotulo: "Início", icone: House },
  { href: "/acoes-comerciais", rotulo: "Ações", icone: Megaphone },
  { href: "/clientes", rotulo: "Clientes", icone: Users },
];

export function NavegacaoMobileInferior() {
  const caminho = usePathname();
  const [aberto, setAberto] = useState(false);
  return <nav aria-label="Navegação rápida" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
    {atalhos.map(({ href, rotulo, icone: Icone }) => { const ativo = caminho === href || caminho.startsWith(`${href}/`); return <Link key={href} href={href} aria-current={ativo ? "page" : undefined} className={cn("flex min-h-16 flex-col items-center justify-center gap-1 text-xs text-muted-foreground", ativo && "font-semibold text-primary")}><Icone className="size-5" aria-hidden="true" />{rotulo}</Link>; })}
    <Sheet open={aberto} onOpenChange={setAberto}><SheetTrigger className="flex min-h-16 flex-col items-center justify-center gap-1 text-xs text-muted-foreground"><Ellipsis className="size-5" aria-hidden="true" />Mais</SheetTrigger><SheetContent side="bottom" className="rounded-t-2xl p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"><SheetHeader className="sr-only"><SheetTitle>Mais opções</SheetTitle><SheetDescription>Acesse todas as áreas do CRM.</SheetDescription></SheetHeader><Marca /><div className="mt-5"><Navegacao aoNavegar={() => setAberto(false)} /></div></SheetContent></Sheet>
  </nav>;
}
