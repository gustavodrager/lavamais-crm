import { Droplets } from "lucide-react";
import { cn } from "@/lib/utils";

export function Marca({ compacta = false }: { compacta?: boolean }) {
  return (
    <div className="flex items-center gap-3" aria-label="LavaMais CRM">
      <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Droplets className="size-5" aria-hidden="true" />
      </span>
      <span className={cn("leading-tight", compacta && "sr-only")}>
        <strong className="block text-sm font-semibold tracking-tight">LavaMais</strong>
        <span className="block text-xs text-muted-foreground">CRM Comercial</span>
      </span>
    </div>
  );
}
