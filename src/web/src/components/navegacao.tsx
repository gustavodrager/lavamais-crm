"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Lightbulb, Megaphone, Users, Upload, Settings, ReceiptText, Route } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SessaoApresentacao } from "@/contratos/apresentacao";

const todosPapeis: Array<NonNullable<SessaoApresentacao["papel"]>> = ["Administrador", "Gerente", "Operador"];
const gestores: Array<NonNullable<SessaoApresentacao["papel"]>> = ["Administrador", "Gerente"];
const administradores: Array<NonNullable<SessaoApresentacao["papel"]>> = ["Administrador"];
export const itensNavegacao = [
  { href: "/inicio", rotulo: "Início", icone: House, papeis: todosPapeis },
  { href: "/clientes", rotulo: "Clientes", icone: Users, papeis: todosPapeis },
  { href: "/movimentacoes", rotulo: "Atendimentos", icone: ReceiptText, papeis: todosPapeis },
  { href: "/sugestoes-acoes", rotulo: "Sugestões de Ações", icone: Lightbulb, papeis: administradores },
  { href: "/acoes-comerciais", rotulo: "Ações Comerciais", rotuloOperador: "Mensagens", icone: Megaphone, papeis: todosPapeis },
  { href: "/roteiros", hrefOperador: "/meu-roteiro", rotulo: "Roteiros", rotuloOperador: "Roteiro", icone: Route, papeis: todosPapeis },
  { href: "/importacao", rotulo: "Importação", icone: Upload, papeis: administradores },
  { href: "/configuracoes", rotulo: "Configurações", icone: Settings, papeis: gestores },
];

export function Navegacao({ aoNavegar, tema = "claro", papel }: { aoNavegar?: () => void; tema?: "claro" | "escuro"; papel?: SessaoApresentacao["papel"] }) {
  const caminho = usePathname();
  const itensVisiveis = itensNavegacao.filter((item) => item.papeis.includes(papel ?? "Gerente"));
  return (
    <nav aria-label="Navegação principal" className="space-y-1">
      {itensVisiveis.map((item) => {
        const { icone: Icone } = item;
        const hrefOperador = "hrefOperador" in item ? item.hrefOperador : undefined;
        const rotuloOperador = "rotuloOperador" in item ? item.rotuloOperador : undefined;
        const href = papel === "Operador" ? hrefOperador ?? item.href : item.href;
        const rotulo = papel === "Operador" ? rotuloOperador ?? item.rotulo : item.rotulo;
        const ativo = caminho === href || caminho.startsWith(`${href}/`) || (item.href === "/roteiros" && (caminho === "/roteiros" || caminho.startsWith("/roteiros/")));
        return (
          <Link key={href} href={href} onClick={aoNavegar} aria-current={ativo ? "page" : undefined}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2",
              tema === "escuro" ? "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-sidebar-ring" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring",
              ativo && (tema === "escuro" ? "bg-sidebar-primary text-sidebar-primary-foreground" : "bg-primary/10 text-primary"),
            )}>
            <Icone className="size-4" aria-hidden="true" />{rotulo}
          </Link>
        );
      })}
    </nav>
  );
}
