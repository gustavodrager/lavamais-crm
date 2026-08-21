"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Megaphone, Users, Upload, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export const itensNavegacao = [
  { href: "/acoes-comerciais", rotulo: "Ações Comerciais", icone: Megaphone },
  { href: "/clientes", rotulo: "Clientes", icone: Users },
  { href: "/importacao", rotulo: "Importação", icone: Upload },
  { href: "/configuracoes", rotulo: "Configurações", icone: Settings },
];

export function Navegacao({ aoNavegar }: { aoNavegar?: () => void }) {
  const caminho = usePathname();
  return (
    <nav aria-label="Navegação principal" className="space-y-1">
      {itensNavegacao.map(({ href, rotulo, icone: Icone }) => {
        const ativo = caminho === href || caminho.startsWith(`${href}/`);
        return (
          <Link key={href} href={href} onClick={aoNavegar} aria-current={ativo ? "page" : undefined}
            className={cn("flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", ativo && "bg-primary/10 text-primary")}>
            <Icone className="size-4" aria-hidden="true" />{rotulo}
          </Link>
        );
      })}
    </nav>
  );
}
