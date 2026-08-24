import type { ReactNode } from "react";
import { Marca } from "@/components/marca";
import { Navegacao } from "@/components/navegacao";
import { MenuMobile } from "@/components/menu-mobile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { obterPortaSessao } from "@/infraestrutura/obter-porta-sessao";
import { redirect } from "next/navigation";

export async function LayoutAutenticado({ children }: { children: ReactNode }) {
  const sessao = await obterPortaSessao().obterSessao();
  if (!sessao) redirect("/entrar");
  return (
    <div className="min-h-screen md:grid md:grid-cols-[16rem_1fr]">
      <aside className="fixed inset-y-0 hidden w-64 border-r border-sidebar-border bg-sidebar p-5 text-sidebar-foreground md:flex md:flex-col">
        <Marca />
        <div className="mt-8 flex-1"><Navegacao tema="escuro" /></div>
        <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/70 p-3">
          <p className="truncate text-sm font-medium">{sessao.tenant.nome}</p>
          <p className="mt-1 text-xs text-sidebar-foreground/70">Ambiente empresarial ativo</p>
        </div>
      </aside>
      <div className="md:col-start-2">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-card/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-2"><MenuMobile /><span className="text-sm text-muted-foreground md:hidden">LavaMais CRM</span></div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block"><p className="text-sm font-medium">{sessao.usuario.nome}</p><p className="text-xs text-muted-foreground">{sessao.papel ?? "Usuário autenticado"}</p></div>
            <Badge variant="secondary" className="grid size-9 place-items-center rounded-full p-0">{sessao.usuario.iniciais}</Badge>
            {!sessao.autenticacaoDesabilitada && <form action="/api/autenticacao/sair" method="post"><Button type="submit" variant="ghost" size="sm">Sair</Button></form>}
          </div>
        </header>
        <main id="conteudo-principal" className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
