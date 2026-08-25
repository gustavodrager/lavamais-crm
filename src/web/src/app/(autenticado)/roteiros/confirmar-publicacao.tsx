"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { publicarRoteiro } from "./acoes";

export function ConfirmarPublicacao({ roteiroId, data, quantidade }: { roteiroId: string; data: string; quantidade: number }) {
  return <form action={publicarRoteiro} className="pt-2"><input type="hidden" name="roteiroId" value={roteiroId} /><input type="hidden" name="data" value={data} /><AlertDialog><AlertDialogTrigger asChild><Button type="button" className="w-full"><Send />Publicar para o motorista</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Publicar roteiro com {quantidade} paradas?</AlertDialogTitle><AlertDialogDescription>Depois da publicação, a sequência não poderá ser editada. O motorista verá a ordem imediatamente.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Continuar editando</AlertDialogCancel><AlertDialogAction type="submit">Publicar roteiro</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></form>;
}
