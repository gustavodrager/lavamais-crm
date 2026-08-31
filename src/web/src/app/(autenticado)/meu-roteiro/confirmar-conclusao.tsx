"use client";

import { CheckCircle2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { atualizarParada } from "../roteiros/acoes";

export function ConfirmarConclusao({ paradaId, data, versao, nomeCliente }: { paradaId: string; data: string; versao: number; nomeCliente: string }) {
  const formularioId = `concluir-parada-${paradaId}`;
  return <form id={formularioId} action={atualizarParada}>
    <input type="hidden" name="paradaId" value={paradaId} />
    <input type="hidden" name="data" value={data} />
    <input type="hidden" name="versao" value={versao} />
    <input type="hidden" name="acao" value="concluir" />
    <AlertDialog>
      <AlertDialogTrigger asChild><Button type="button" className="w-full bg-green-700 hover:bg-green-800"><CheckCircle2 />Concluir parada</Button></AlertDialogTrigger>
      <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Concluir a parada de {nomeCliente}?</AlertDialogTitle><AlertDialogDescription>Confirme somente após realizar a coleta ou entrega. A parada ficará registrada como concluída.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Voltar</AlertDialogCancel><AlertDialogAction type="submit" form={formularioId} className="bg-green-700 hover:bg-green-800">Confirmar conclusão</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
    </AlertDialog>
  </form>;
}
