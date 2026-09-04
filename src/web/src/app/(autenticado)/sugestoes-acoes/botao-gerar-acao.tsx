"use client";

import { useState, useTransition } from "react";
import { ArrowRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { criarAcaoDaSugestao } from "./acoes";

export function BotaoGerarAcao({ codigo, desabilitado }: { codigo: string; desabilitado: boolean }) {
  const [pendente, iniciarTransicao] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  return <div className="space-y-2">
    <Button disabled={desabilitado || pendente} onClick={() => iniciarTransicao(async () => { setErro(null); const resultado = await criarAcaoDaSugestao(codigo); if (!resultado.sucesso) setErro(resultado.mensagem); })}>
      {pendente ? "Gerando..." : "Gerar ação"}<ArrowRight aria-hidden="true" />
    </Button>
    {erro && <Alert variant="destructive"><AlertDescription>{erro}</AlertDescription></Alert>}
  </div>;
}
