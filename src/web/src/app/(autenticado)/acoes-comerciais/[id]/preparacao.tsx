"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, MessageCircle } from "lucide-react";
import type { OpcaoModeloDeMensagem, SimulacaoDePublico } from "@/contratos/apresentacao";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { prepararAcao } from "./acoes";

export function PreparacaoAcao({ acaoId, modelos, versaoModeloId, aoSelecionarModelo, simulacao }: { acaoId: string; modelos: OpcaoModeloDeMensagem[]; versaoModeloId: string; aoSelecionarModelo: (id: string) => void; simulacao: SimulacaoDePublico | null }) {
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [pendente, iniciarTransicao] = useTransition();
  const modelo = modelos.find((item) => item.versaoId === versaoModeloId);
  const clienteExemplo = simulacao?.clientes.find((cliente) => cliente.elegivel);
  const previaPersonalizada = modelo?.conteudoPreVisualizacao.replaceAll("{{nomeCliente}}", clienteExemplo?.nome ?? "cliente").replaceAll("{{itemCatalogo}}", "o serviço selecionado");
  function preparar() { setMensagem(null); iniciarTransicao(async () => { const resultado = await prepararAcao({ acaoId, versaoModeloId }); if (!resultado.sucesso) setMensagem(resultado.mensagem); }); }
  const podePreparar = Boolean(modelo && simulacao && simulacao.quantidadeElegivel > 0);
  return <Card className="mt-6"><CardHeader><CardTitle>Mensagem e revisão final</CardTitle><CardDescription>Escolha uma mensagem publicada e confira o resumo antes de criar a lista definitiva de destinatários.</CardDescription></CardHeader><CardContent className="space-y-5">
    {modelos.length === 0 ? <Alert><MessageCircle /><AlertTitle>Nenhum modelo publicado</AlertTitle><AlertDescription>Publique um modelo de mensagem antes de preparar esta ação.</AlertDescription></Alert> : <>
      <div className="space-y-2"><Label htmlFor="modelo-mensagem">Modelo de mensagem</Label><Select value={versaoModeloId} onValueChange={aoSelecionarModelo}><SelectTrigger id="modelo-mensagem" className="w-full sm:max-w-md"><SelectValue placeholder="Selecione um modelo publicado" /></SelectTrigger><SelectContent>{modelos.map((item) => <SelectItem key={item.versaoId} value={item.versaoId}>{item.nome} · versão {item.numeroVersao}</SelectItem>)}</SelectContent></Select></div>
      {modelo && <div className="rounded-xl border bg-secondary/45 p-4"><p className="mb-2 text-xs font-semibold text-muted-foreground">Exemplo personalizado{clienteExemplo ? ` para ${clienteExemplo.nome}` : ""}</p><p className="whitespace-pre-wrap text-sm leading-6">{previaPersonalizada}</p></div>}
      <section aria-labelledby="titulo-revisao-final" className="rounded-xl border border-[color-mix(in_srgb,var(--marca-amarelo)_65%,var(--border))] bg-[color-mix(in_srgb,var(--marca-amarelo)_10%,white)] p-4 sm:p-5"><div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#a86600]" aria-hidden="true" /><div><h3 id="titulo-revisao-final" className="font-semibold text-[var(--marca-azul-profundo)]">Revisão antes de preparar</h3><dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3"><div><dt className="text-muted-foreground">Público elegível</dt><dd className="font-semibold tabular-nums">{simulacao ? `${simulacao.quantidadeElegivel} clientes` : "Simulação pendente"}</dd></div><div><dt className="text-muted-foreground">Excluídos</dt><dd className="font-semibold tabular-nums">{simulacao ? simulacao.quantidadeEncontrada - simulacao.quantidadeElegivel : "—"}</dd></div><div><dt className="text-muted-foreground">Mensagem</dt><dd className="font-semibold">{modelo ? `${modelo.nome}, versão ${modelo.numeroVersao}` : "Não selecionada"}</dd></div></dl><p className="mt-4 text-sm text-muted-foreground">Ao confirmar, criaremos a lista definitiva de clientes. Depois disso, público e mensagem não poderão ser alterados.</p></div></div></section>
      {mensagem && <Alert variant="destructive"><AlertTitle>Não foi possível preparar</AlertTitle><AlertDescription>{mensagem}</AlertDescription></Alert>}
      {!simulacao && <p className="text-sm text-muted-foreground">Simule o público acima para liberar a revisão final.</p>}
      {simulacao && simulacao.quantidadeElegivel === 0 && <Alert variant="destructive"><AlertTitle>Nenhum cliente elegível</AlertTitle><AlertDescription>Ajuste os filtros antes de preparar a ação.</AlertDescription></Alert>}
      <AlertDialog><AlertDialogTrigger asChild><Button type="button" disabled={pendente || !podePreparar}>{pendente ? "Preparando..." : "Revisar e confirmar preparação"}</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Criar a lista definitiva de destinatários?</AlertDialogTitle><AlertDialogDescription>Serão incluídos {simulacao?.quantidadeElegivel ?? 0} clientes usando {modelo?.nome ?? "o modelo selecionado"}. Público e mensagem não poderão mais ser alterados.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Voltar e revisar</AlertDialogCancel><AlertDialogAction onClick={preparar}>Confirmar preparação</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </>}
  </CardContent></Card>;
}
