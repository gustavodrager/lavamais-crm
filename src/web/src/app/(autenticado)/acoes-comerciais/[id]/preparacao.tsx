"use client";

import { useState, useTransition } from "react";
import { MessageCircle } from "lucide-react";
import type { OpcaoModeloDeMensagem } from "@/contratos/apresentacao";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { prepararAcao } from "./acoes";

export function PreparacaoAcao({ acaoId, modelos, versaoModeloAtualId }: { acaoId: string; modelos: OpcaoModeloDeMensagem[]; versaoModeloAtualId: string | null }) {
  const [versaoModeloId, setVersaoModeloId] = useState(versaoModeloAtualId ?? "");
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [pendente, iniciarTransicao] = useTransition();
  const modelo = modelos.find((item) => item.versaoId === versaoModeloId);
  function preparar() { setMensagem(null); iniciarTransicao(async () => { const resultado = await prepararAcao({ acaoId, versaoModeloId }); if (!resultado.sucesso) setMensagem(resultado.mensagem); }); }
  return <Card className="mt-6"><CardHeader><CardTitle>Mensagem e preparação</CardTitle><CardDescription>Revise o público, escolha uma versão publicada e congele a audiência para execução.</CardDescription></CardHeader><CardContent className="space-y-5">
    {modelos.length === 0 ? <Alert><MessageCircle /><AlertTitle>Nenhum modelo publicado</AlertTitle><AlertDescription>Publique um modelo de mensagem antes de preparar esta ação.</AlertDescription></Alert> : <>
      <div className="space-y-2"><Label htmlFor="modelo-mensagem">Modelo de mensagem</Label><Select value={versaoModeloId} onValueChange={setVersaoModeloId}><SelectTrigger id="modelo-mensagem" className="w-full sm:max-w-md"><SelectValue placeholder="Selecione um modelo publicado" /></SelectTrigger><SelectContent>{modelos.map((item) => <SelectItem key={item.versaoId} value={item.versaoId}>{item.nome} · versão {item.numeroVersao}</SelectItem>)}</SelectContent></Select></div>
      {modelo && <div className="rounded-lg border bg-muted/30 p-4"><p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Prévia no WhatsApp</p><p className="whitespace-pre-wrap text-sm">{modelo.conteudoPreVisualizacao}</p></div>}
      <div className="rounded-lg border p-4 text-sm"><p>Confira a simulação do público acima antes de continuar.</p><p className="mt-1 text-muted-foreground">Ao preparar, o público será recalculado e audiência, destino e versão do modelo serão congelados. Os filtros não poderão mais ser alterados.</p></div>
      {mensagem && <Alert variant="destructive"><AlertTitle>Não foi possível preparar</AlertTitle><AlertDescription>{mensagem}</AlertDescription></Alert>}
      <Button type="button" onClick={preparar} disabled={pendente || !versaoModeloId}>{pendente ? "Preparando..." : "Preparar Ação Comercial"}</Button>
    </>}
  </CardContent></Card>;
}
