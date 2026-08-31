"use client";

import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PapelDoCrm } from "@/lib/sessao-apresentacao";

export function SeletorVisaoPerfil({ papelAtual }: { papelAtual: PapelDoCrm }) {
  const roteador = useRouter();
  async function alterar(papel: string) {
    const resposta = await fetch("/api/sessao/visao-perfil", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ papel }),
    });
    if (resposta.ok) roteador.refresh();
  }

  return <Select value={papelAtual} onValueChange={alterar}>
    <SelectTrigger size="sm" aria-label="Alterar visão do perfil" className="hidden min-w-44 bg-background sm:flex">
      <Eye className="size-4" aria-hidden="true" />
      <SelectValue />
    </SelectTrigger>
    <SelectContent align="end">
      <SelectItem value="Administrador">Visão Administrador</SelectItem>
      <SelectItem value="Gerente">Visão Gerente</SelectItem>
      <SelectItem value="Operador">Visão Operador</SelectItem>
    </SelectContent>
  </Select>;
}
