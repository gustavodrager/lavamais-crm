"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { publicarRoteiro } from "./acoes";

export function ConfirmarPublicacao({ roteiroId, data, versao, quantidade }: { roteiroId: string; data: string; versao: number; quantidade: number }) {
  const idFormulario = `publicar-roteiro-${roteiroId}`;
  return <form id={idFormulario} action={publicarRoteiro} className="pt-2"><input type="hidden" name="roteiroId" value={roteiroId} /><input type="hidden" name="data" value={data} /><input type="hidden" name="versao" value={versao} /><AlertDialog><AlertDialogTrigger asChild><Button type="button" className="w-full"><Send />Publicar para o motorista</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Publicar roteiro com {quantidade} paradas?</AlertDialogTitle><AlertDialogDescription>O roteiro poderá receber novas paradas pendentes durante o dia, mas as paradas já executadas não serão alteradas.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Continuar editando</AlertDialogCancel><AlertDialogAction type="submit" form={idFormulario}>Publicar roteiro</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></form>;
}
