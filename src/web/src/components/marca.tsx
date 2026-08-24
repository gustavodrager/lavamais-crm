import { cn } from "@/lib/utils";

export function Marca({ compacta = false }: { compacta?: boolean }) {
  return (
    <div className="flex items-center gap-3" aria-label="LavaMais CRM">
      <span aria-hidden="true" className="h-9 w-1.5 rounded-full bg-[var(--marca-amarelo)]" />
      <span className={cn("leading-tight", compacta && "sr-only")}>
        <strong className="block text-base font-bold tracking-tight">LavaMais</strong>
        <span className="block text-xs text-current/70">CRM Comercial</span>
      </span>
    </div>
  );
}
