"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CircleCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { chaveRascunhoAtendimento } from "./formulario-movimentacao";

type PropriedadesSucesso = {
  clienteId: string;
  atendimentoId?: string;
  nomeCliente?: string;
  valorTotal?: number;
};

export function SucessoAtendimento({ clienteId, atendimentoId, nomeCliente, valorTotal }: PropriedadesSucesso) {
  useEffect(() => {
    window.sessionStorage.removeItem(chaveRascunhoAtendimento(clienteId));
    window.setTimeout(() => document.getElementById("busca")?.focus(), 0);
  }, [clienteId]);

  function focarBusca() {
    document.getElementById("busca")?.focus();
  }

  return (
    <Alert className="mb-4 border-emerald-600/30 bg-emerald-50/70 text-emerald-950 dark:bg-emerald-950/20 dark:text-emerald-100">
      <CircleCheck aria-hidden="true" />
      <AlertTitle>Atendimento registrado</AlertTitle>
      <AlertDescription className="text-emerald-900/80 dark:text-emerald-100/80">
        {nomeCliente ? (
          <p>
            {nomeCliente}
            {valorTotal !== undefined ? ` · ${moeda.format(valorTotal)}` : ""}
          </p>
        ) : (
          <p>O atendimento já aparece no histórico do cliente.</p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={focarBusca}>Atender próximo cliente</Button>
          {atendimentoId ? <Button asChild size="sm"><Link href={`/clientes/${clienteId}/atendimentos/${atendimentoId}`}>Ver atendimento</Link></Button> : null}
          <Button asChild size="sm" variant="outline">
            <Link href={`/clientes/${clienteId}`}>Abrir histórico do cliente</Link>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
