"use client";

import { Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { removerParada } from "./acoes";

export function ConfirmarRemocao({ roteiroId, paradaId, data, versao, nomeCliente }: { roteiroId: string; paradaId: string; data: string; versao: number; nomeCliente: string }) {
  const formularioId = `remover-parada-${paradaId}`;
  return <form id={formularioId} action={removerParada}>
    <input type="hidden" name="roteiroId" value={roteiroId} />
    <input type="hidden" name="paradaId" value={paradaId} />
    <input type="hidden" name="data" value={data} />
    <input type="hidden" name="versao" value={versao} />
    <AlertDialog>
      <AlertDialogTrigger asChild><Button type="button" size="icon" variant="ghost" className="text-destructive" aria-label={`Remover parada de ${nomeCliente}`}><Trash2 /></Button></AlertDialogTrigger>
      <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remover {nomeCliente} do roteiro?</AlertDialogTitle><AlertDialogDescription>A parada pendente será retirada da sequência. O cadastro da cliente não será excluído.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Manter parada</AlertDialogCancel><AlertDialogAction type="submit" form={formularioId} variant="destructive">Remover parada</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
    </AlertDialog>
  </form>;
}
