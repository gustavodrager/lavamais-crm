"use client";

import { useId, useState, useTransition, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cancelarMovimentacao } from "./acoes";

type PropriedadesCancelamento = {
  id: string;
  versao: number;
  nomeCliente?: string;
  descricao?: string;
};

export function CancelarMovimentacao({ id, versao, nomeCliente, descricao }: PropriedadesCancelamento) {
  const [aberto, setAberto] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [pendente, iniciarTransicao] = useTransition();
  const idMotivo = useId();
  const router = useRouter();
  const contexto = nomeCliente ? ` de ${nomeCliente}` : "";

  function alterarAbertura(proximoEstado: boolean) {
    if (pendente) return;
    setAberto(proximoEstado);
    if (!proximoEstado) {
      setMensagem(null);
      setMotivo("");
    }
  }

  function confirmar(evento: MouseEvent<HTMLButtonElement>) {
    evento.preventDefault();
    setMensagem(null);
    iniciarTransicao(async () => {
      try {
        const resultado = await cancelarMovimentacao({ id, motivo, versao });
        if (resultado.sucesso) {
          setAberto(false);
          setMotivo("");
          router.refresh();
          return;
        }
        setMensagem(resultado.mensagem);
      } catch {
        setMensagem("Não foi possível cancelar o atendimento agora.");
      }
    });
  }

  return (
    <AlertDialog open={aberto} onOpenChange={alterarAbertura}>
      <AlertDialogTrigger asChild>
        <Button type="button" size="sm" variant="ghost" aria-label={`Cancelar atendimento${contexto}`}>
          Cancelar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancelar atendimento?</AlertDialogTitle>
          <AlertDialogDescription>
            {nomeCliente ? `O atendimento de ${nomeCliente} será marcado como cancelado e continuará no histórico.` : "O atendimento será marcado como cancelado e continuará no histórico."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {descricao ? <p className="line-clamp-2 rounded-md bg-muted p-3 text-sm">{descricao}</p> : null}
        <div className="space-y-2">
          <Label htmlFor={idMotivo}>Motivo do cancelamento</Label>
          <Textarea
            id={idMotivo}
            value={motivo}
            onChange={(evento) => setMotivo(evento.target.value)}
            placeholder="Explique por que este atendimento será cancelado"
            maxLength={300}
            autoFocus
          />
          <p className="text-xs text-muted-foreground">Mínimo de 3 caracteres.</p>
        </div>
        {mensagem ? <p role="alert" className="text-sm text-destructive">{mensagem}</p> : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pendente}>Manter atendimento</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pendente || motivo.trim().length < 3}
            onClick={confirmar}
          >
            {pendente ? "Cancelando..." : "Cancelar atendimento"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
