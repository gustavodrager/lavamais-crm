"use client";

import { Button } from "@/components/ui/button";

export function ConfirmarExclusao() {
  return <Button type="submit" variant="destructive" onClick={(evento) => { if (!window.confirm("Excluir este rascunho de roteiro?")) evento.preventDefault(); }}>Excluir rascunho</Button>;
}
