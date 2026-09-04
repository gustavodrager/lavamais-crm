"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { aprovarAcao, rejeitarAcao } from "./acoes";

export function AprovacaoAcao({ acaoId, versao }: { acaoId: string; versao: number }) {
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciarTransicao] = useTransition();
  const executar = (acao: "aprovar" | "rejeitar") => iniciarTransicao(async () => { setErro(null); const resultado = acao === "aprovar" ? await aprovarAcao({ acaoId, versao }) : await rejeitarAcao({ acaoId, versao, motivo }); if (!resultado.sucesso) setErro(resultado.mensagem); });
  return <Card><CardHeader><CardTitle>Aprovação do gerente</CardTitle><CardDescription>Revise a seleção e libere a ação para o atendimento individual no WhatsApp.</CardDescription></CardHeader><CardContent className="space-y-4">
    <Alert><CheckCircle2 aria-hidden="true" /><AlertTitle>Ação aguardando sua decisão</AlertTitle><AlertDescription>Ao aprovar, o CRM valida os consentimentos e cria a fila definitiva. Nenhuma mensagem é enviada automaticamente.</AlertDescription></Alert>
    <div className="flex flex-col gap-3 sm:flex-row"><Button disabled={pendente} onClick={() => executar("aprovar")}><CheckCircle2 />{pendente ? "Processando..." : "Aprovar e liberar"}</Button><Input value={motivo} onChange={(evento) => setMotivo(evento.target.value)} placeholder="Motivo para rejeitar" maxLength={300} /><Button variant="destructive" disabled={pendente || motivo.trim().length < 3} onClick={() => executar("rejeitar")}><XCircle />Rejeitar</Button></div>
    {erro && <Alert variant="destructive"><AlertTitle>Não foi possível concluir</AlertTitle><AlertDescription>{erro}</AlertDescription></Alert>}
  </CardContent></Card>;
}
