"use client";

import { useState, useTransition } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cancelarAcao } from "./acoes";

export function CancelarAcao({ acaoId, versao }: { acaoId: string; versao: number }) {
  const [motivo, setMotivo] = useState("");
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [pendente, iniciarTransicao] = useTransition();
  function confirmar() {
    setMensagem(null);
    iniciarTransicao(async () => {
      const resultado = await cancelarAcao({ acaoId, motivo, versao });
      if (!resultado.sucesso) setMensagem(resultado.mensagem);
    });
  }
  return <div className="space-y-2"><AlertDialog><AlertDialogTrigger asChild><Button variant="outline" size="sm">Cancelar ação</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Cancelar esta ação?</AlertDialogTitle><AlertDialogDescription>Ela deixará de aparecer como trabalho pendente. O cancelamento não envia mensagens.</AlertDialogDescription></AlertDialogHeader><div className="space-y-2"><Label htmlFor={`motivo-cancelamento-${acaoId}`}>Motivo</Label><Input id={`motivo-cancelamento-${acaoId}`} value={motivo} onChange={(evento) => setMotivo(evento.target.value)} placeholder="Ex.: prioridade alterada" maxLength={300} /></div><AlertDialogFooter><AlertDialogCancel>Voltar</AlertDialogCancel><AlertDialogAction onClick={confirmar} disabled={pendente || motivo.trim().length < 3}>{pendente ? "Cancelando..." : "Confirmar cancelamento"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>{mensagem && <p role="alert" className="text-xs text-destructive">{mensagem}</p>}</div>;
}
