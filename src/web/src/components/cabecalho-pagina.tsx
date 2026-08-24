import type { ReactNode } from "react";

export function CabecalhoPagina({ titulo, descricao, acao }: { titulo: string; descricao: string; acao?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div><h1 className="text-2xl font-bold tracking-tight text-[var(--marca-azul-profundo)] sm:text-3xl">{titulo}</h1><p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">{descricao}</p></div>
      {acao}
    </div>
  );
}
