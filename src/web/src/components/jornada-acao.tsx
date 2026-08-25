import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const etapas = ["Informações", "Clientes", "Mensagem", "Revisão", "Envio"];

export function JornadaAcao({ etapaAtual }: { etapaAtual: number }) {
  return (
    <nav aria-label="Etapas da Ação Comercial" className="mb-6 overflow-hidden rounded-xl border bg-card p-4 shadow-sm">
      <div className="sm:hidden"><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Etapa {etapaAtual} de {etapas.length}</p><p className="mt-1 font-semibold text-[var(--marca-azul-profundo)]">{etapas[etapaAtual - 1]}</p><div className="mt-3 grid grid-cols-5 gap-2" aria-hidden="true">{etapas.map((etapa, indice) => <span key={etapa} className={cn("h-1.5 rounded-full", indice + 1 <= etapaAtual ? "bg-primary" : "bg-muted")} />)}</div></div>
      <ol className="hidden gap-3 sm:grid sm:grid-cols-5">
        {etapas.map((etapa, indice) => {
          const numero = indice + 1;
          const concluida = numero < etapaAtual;
          const atual = numero === etapaAtual;
          return (
            <li key={etapa} aria-current={atual ? "step" : undefined} className="relative flex items-center gap-2 sm:flex-col sm:items-start">
              <span className={cn("grid size-7 shrink-0 place-items-center rounded-full border text-xs font-bold", concluida && "border-primary bg-primary text-primary-foreground", atual && "border-primary bg-primary/10 text-primary", !concluida && !atual && "border-border bg-background text-muted-foreground")}>
                {concluida ? <Check className="size-4" aria-hidden="true" /> : atual ? numero : <Circle className="size-3" aria-hidden="true" />}
              </span>
              <span className={cn("text-sm", atual ? "font-semibold text-[var(--marca-azul-profundo)]" : "text-muted-foreground")}>{etapa}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
