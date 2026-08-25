"use client";

import { useState, useTransition } from "react";
import { ArrowLeft, Check, CheckCircle2 } from "lucide-react";
import type { OpcaoModeloDeMensagem, SimulacaoDePublico } from "@/contratos/apresentacao";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { prepararAcao } from "./acoes";

export function PreparacaoAcao({ acaoId, modelos, versaoModeloId, aoSelecionarModelo, simulacao, nomeItemCatalogo, aoVoltar }: { acaoId: string; modelos: OpcaoModeloDeMensagem[]; versaoModeloId: string; aoSelecionarModelo: (id: string) => void; simulacao: SimulacaoDePublico | null; nomeItemCatalogo?: string | null; aoVoltar?: () => void }) {
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [pendente, iniciarTransicao] = useTransition();
  const modelo = modelos.find((item) => item.versaoId === versaoModeloId);
  const clienteExemplo = simulacao?.clientes.find((cliente) => cliente.elegivel);
  const previaPersonalizada = modelo?.conteudoPreVisualizacao.replaceAll("{{nomeCliente}}", clienteExemplo?.nome ?? "cliente").replaceAll("{{itemCatalogo}}", nomeItemCatalogo ?? "o item selecionado");
  function preparar() { setMensagem(null); iniciarTransicao(async () => { const resultado = await prepararAcao({ acaoId, versaoModeloId }); if (!resultado.sucesso) setMensagem(resultado.mensagem); }); }
  const podePreparar = Boolean(modelo && simulacao && simulacao.quantidadeElegivel > 0);
  const rotuloClientes = simulacao?.quantidadeElegivel === 1 ? "1 cliente" : `${simulacao?.quantidadeElegivel ?? 0} clientes`;
  return <Card className="mt-6"><CardHeader><CardTitle>2. Escolha a mensagem</CardTitle><CardDescription>Selecione uma opção e confira como um cliente verá o texto.</CardDescription></CardHeader><CardContent className="space-y-5">
    <>
      <fieldset className="space-y-3"><legend className="font-semibold text-[var(--marca-azul-profundo)]">Qual mensagem deseja usar?</legend><p className="text-sm text-muted-foreground">Escolha somente um modelo aprovado pela equipe administradora.</p>{modelos.length === 0 ? <Alert><AlertTitle>Nenhum modelo aprovado disponível</AlertTitle><AlertDescription>Peça ao administrador para publicar um modelo antes de preparar esta ação.</AlertDescription></Alert> : <div role="radiogroup" aria-label="Mensagens disponíveis" className="grid gap-3 sm:grid-cols-2">{modelos.map((item) => { const selecionado = item.versaoId === versaoModeloId; return <button key={item.versaoId} type="button" role="radio" aria-checked={selecionado} onClick={() => aoSelecionarModelo(item.versaoId)} className={cn("flex min-h-24 items-start gap-3 rounded-xl border bg-card p-4 text-left transition-colors hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50", selecionado && "border-primary bg-primary/5 ring-2 ring-primary/15")}><span className={cn("mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border", selecionado && "border-primary bg-primary text-primary-foreground")}>{selecionado && <Check className="size-4" />}</span><span><span className="block font-semibold">{item.nome}</span><span className="mt-1 block text-xs text-muted-foreground">Versão {item.numeroVersao} · modelo aprovado</span></span></button>; })}</div>}</fieldset>
      {modelo && <div className="rounded-xl border bg-secondary/45 p-4"><p className="mb-2 text-xs font-semibold text-muted-foreground">Exemplo personalizado{clienteExemplo ? ` para ${clienteExemplo.nome}` : ""}</p><p className="whitespace-pre-wrap text-sm leading-6">{previaPersonalizada}</p></div>}
      <section aria-labelledby="titulo-revisao-final" className="rounded-xl border border-[color-mix(in_srgb,var(--marca-amarelo)_65%,var(--border))] bg-[color-mix(in_srgb,var(--marca-amarelo)_10%,white)] p-4 sm:p-5"><div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#a86600]" aria-hidden="true" /><div><h3 id="titulo-revisao-final" className="font-semibold text-[var(--marca-azul-profundo)]">Revisão antes de começar</h3><dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-muted-foreground">Clientes escolhidos</dt><dd className="font-semibold tabular-nums">{simulacao ? `${simulacao.quantidadeElegivel} clientes` : "Lista pendente"}</dd></div><div><dt className="text-muted-foreground">Mensagem</dt><dd className="font-semibold">{modelo ? `${modelo.nome}, versão ${modelo.numeroVersao}` : "Não selecionada"}</dd></div></dl><p className="mt-4 text-sm text-muted-foreground">Ao confirmar, criaremos a fila definitiva. Depois, você abrirá e enviará uma mensagem por vez.</p></div></div></section>
      {mensagem && <Alert variant="destructive"><AlertTitle>Não foi possível preparar</AlertTitle><AlertDescription>{mensagem}</AlertDescription></Alert>}
      {!simulacao && <p className="text-sm text-muted-foreground">Escolha os clientes antes de revisar a mensagem.</p>}
      {simulacao && simulacao.quantidadeElegivel === 0 && <Alert variant="destructive"><AlertTitle>Nenhum cliente disponível</AlertTitle><AlertDescription>Volte e monte outra lista de clientes.</AlertDescription></Alert>}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between"><Button type="button" variant="ghost" onClick={aoVoltar}><ArrowLeft />Voltar para os clientes</Button><AlertDialog><AlertDialogTrigger asChild><Button type="button" disabled={pendente || !podePreparar}>{pendente ? "Preparando..." : "Confirmar clientes e mensagem"}</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Está tudo certo para continuar?</AlertDialogTitle><AlertDialogDescription>Esta ação ficará pronta com {rotuloClientes} e a mensagem “{modelo?.nome ?? "selecionada"}”. Depois desta confirmação, essas escolhas não poderão ser alteradas.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Conferir novamente</AlertDialogCancel><AlertDialogAction onClick={preparar}>Sim, começar os atendimentos</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div>
    </>
  </CardContent></Card>;
}
