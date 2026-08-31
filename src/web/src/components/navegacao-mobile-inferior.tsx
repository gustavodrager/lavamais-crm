"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ellipsis, House, Megaphone, MessageCircle, ReceiptText, Route, Users } from "lucide-react";
import { useState } from "react";
import { Marca } from "@/components/marca";
import { Navegacao } from "@/components/navegacao";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { SessaoApresentacao } from "@/contratos/apresentacao";

const atalhosGerenciais = [
  { href: "/inicio", rotulo: "Início", icone: House },
  { href: "/clientes", rotulo: "Clientes", icone: Users },
  { href: "/movimentacoes", rotulo: "Atender", icone: ReceiptText },
  { href: "/acoes-comerciais", rotulo: "Ações", icone: Megaphone },
];

const atalhosOperador = [
  { href: "/inicio", rotulo: "Início", icone: House },
  { href: "/clientes", rotulo: "Clientes", icone: Users },
  { href: "/movimentacoes", rotulo: "Atender", icone: ReceiptText },
  { href: "/acoes-comerciais", rotulo: "Mensagens", icone: MessageCircle },
  { href: "/meu-roteiro", rotulo: "Roteiro", icone: Route },
];

export function NavegacaoMobileInferior({ papel }: { papel?: SessaoApresentacao["papel"] }) {
  const caminho = usePathname() ?? "";
  const [aberto, setAberto] = useState(false);
  const operador = papel === "Operador";
  const atalhos = operador ? atalhosOperador : atalhosGerenciais;
  return <nav aria-label="Navegação rápida" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden print:hidden">
    {atalhos.map(({ href, rotulo, icone: Icone }) => { const ativo = caminho === href || caminho.startsWith(`${href}/`) || (href === "/meu-roteiro" && (caminho === "/roteiros" || caminho.startsWith("/roteiros/"))); return <Link key={href} href={href} aria-current={ativo ? "page" : undefined} className={cn("flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 px-1 text-[11px] text-muted-foreground", ativo && "font-semibold text-primary")}><Icone className="size-5" aria-hidden="true" /><span className="max-w-full truncate">{rotulo}</span></Link>; })}
    {!operador && <Sheet open={aberto} onOpenChange={setAberto}><SheetTrigger className="flex min-h-16 flex-col items-center justify-center gap-1 text-xs text-muted-foreground"><Ellipsis className="size-5" aria-hidden="true" />Mais</SheetTrigger><SheetContent side="bottom" className="rounded-t-2xl p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"><SheetHeader className="sr-only"><SheetTitle>Mais opções</SheetTitle><SheetDescription>Acesse todas as áreas do CRM.</SheetDescription></SheetHeader><Marca /><div className="mt-5"><Navegacao papel={papel} aoNavegar={() => setAberto(false)} /></div></SheetContent></Sheet>}
  </nav>;
}
