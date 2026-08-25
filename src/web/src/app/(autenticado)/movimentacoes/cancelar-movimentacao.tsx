"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cancelarMovimentacao } from "./acoes";

export function CancelarMovimentacao({ id, versao }: { id: string; versao: number }) {
  const [aberto, setAberto] = useState(false); const [motivo, setMotivo] = useState(""); const [mensagem, setMensagem] = useState<string | null>(null); const [pendente, iniciarTransicao] = useTransition();
  function confirmar() { setMensagem(null); iniciarTransicao(async () => { const resultado = await cancelarMovimentacao({ id, motivo, versao }); if (resultado.sucesso) setAberto(false); else setMensagem(resultado.mensagem); }); }
  return <div className="space-y-1 text-right"><Button type="button" size="sm" variant="ghost" onClick={() => setAberto((atual) => !atual)}>{aberto ? "Fechar" : "Cancelar"}</Button>{aberto && <div className="flex items-center gap-2"><Input aria-label="Motivo do cancelamento" value={motivo} onChange={(evento) => setMotivo(evento.target.value)} placeholder="Motivo" maxLength={300} /><Button type="button" size="sm" variant="destructive" disabled={pendente || motivo.trim().length < 3} onClick={confirmar}>{pendente ? "..." : "Confirmar"}</Button></div>}{mensagem && <p role="alert" className="text-xs text-destructive">{mensagem}</p>}</div>;
}
