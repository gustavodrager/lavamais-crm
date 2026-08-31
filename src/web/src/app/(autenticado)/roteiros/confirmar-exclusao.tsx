"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { excluirRoteiro } from "./acoes";

export function ConfirmarExclusao({ roteiroId, data, versao }: { roteiroId: string; data: string; versao: number }) {
  const formularioId = `excluir-roteiro-${roteiroId}`;
  return <form id={formularioId} action={excluirRoteiro}><input type="hidden" name="roteiroId" value={roteiroId} /><input type="hidden" name="data" value={data} /><input type="hidden" name="versao" value={versao} /><AlertDialog><AlertDialogTrigger asChild><Button type="button" variant="destructive">Excluir rascunho</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Excluir este rascunho de roteiro?</AlertDialogTitle><AlertDialogDescription>O roteiro e suas paradas pendentes serão removidos. Os cadastros dos clientes não serão afetados.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Manter rascunho</AlertDialogCancel><AlertDialogAction type="submit" form={formularioId} variant="destructive">Excluir rascunho</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></form>;
}
