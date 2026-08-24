"use client";

import { useState, useTransition } from "react";
import { ArrowRight, MessageSquareText, Send } from "lucide-react";
import type { DestinatarioDaAcao, SituacaoAcaoComercial } from "@/contratos/apresentacao";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { enviarMensagemIndividual } from "./acoes";
import { ResultadoDestinatario } from "./resultado-destinatario";

const rotulosEnvio = { Pendente: "Pendente", AguardandoSolicitacao: "Aguardando solicitação", Solicitado: "Solicitado", Enviado: "Enviado", Entregue: "Entregue", Lido: "Lido", Falhou: "Falhou" };
const resultadoDisponivel = (destinatario: DestinatarioDaAcao) => destinatario.situacaoEnvio !== "Pendente" && destinatario.situacaoEnvio !== "AguardandoSolicitacao";

function EstadoEnvio({ destinatario }: { destinatario: DestinatarioDaAcao }) {
  return <><Badge variant={destinatario.situacaoEnvio === "Falhou" ? "destructive" : destinatario.situacaoEnvio === "Pendente" ? "secondary" : "outline"}>{rotulosEnvio[destinatario.situacaoEnvio]}</Badge>{destinatario.codigoFalha ? <span className="mt-1 block max-w-56 text-xs text-destructive">Código: {destinatario.codigoFalha}</span> : null}</>;
}

export function ExecucaoAcao({ acaoId, situacao, destinatarios, envioHabilitado = true }: { acaoId: string; situacao: SituacaoAcaoComercial; destinatarios: DestinatarioDaAcao[]; envioHabilitado?: boolean }) {
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [enviando, iniciarTransicao] = useTransition();
  const selecionado = destinatarios.find((item) => item.id === selecionadoId) ?? null;
  const processados = destinatarios.filter((item) => item.situacaoEnvio !== "Pendente").length;

  function selecionar(id: string) { setSelecionadoId(id); setMensagem(null); setSucesso(null); }
  function selecionarProximo() {
    const indiceAtual = selecionado ? destinatarios.findIndex((item) => item.id === selecionado.id) : -1;
    const ordenados = [...destinatarios.slice(indiceAtual + 1), ...destinatarios.slice(0, indiceAtual + 1)];
    const proximo = ordenados.find((item) => item.situacaoEnvio === "Pendente" && item.id !== selecionado?.id);
    if (proximo) selecionar(proximo.id);
  }
  function enviar(destinatario: DestinatarioDaAcao) {
    setMensagem(null); setSucesso(null);
    iniciarTransicao(async () => {
      const resultado = await enviarMensagemIndividual({ acaoId, destinatarioId: destinatario.id, versao: destinatario.versao });
      if (resultado.sucesso) setSucesso(`Mensagem de ${destinatario.nomeCliente} encaminhada para processamento.`); else setMensagem(resultado.mensagem);
    });
  }

  return <Card className="mt-6"><CardHeader><CardTitle>Destinatários e mensagens</CardTitle><CardDescription>Revise uma pessoa por vez. A mensagem exibida já está personalizada e não pode ser editada.</CardDescription></CardHeader><CardContent className="space-y-5">
    {!envioHabilitado ? <Alert><AlertTitle>Envio ainda não habilitado</AlertTitle><AlertDescription>A audiência e as mensagens podem ser revisadas. O envio será liberado quando a Central de Notificação estiver integrada.</AlertDescription></Alert> : null}
    {mensagem ? <Alert variant="destructive"><AlertTitle>Não foi possível enviar</AlertTitle><AlertDescription>{mensagem}</AlertDescription></Alert> : null}
    {sucesso ? <Alert><AlertTitle>Mensagem solicitada</AlertTitle><AlertDescription>{sucesso}</AlertDescription></Alert> : null}
    {destinatarios.length === 0 ? <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">A ação ainda não possui destinatários definitivos.</p> : <>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-secondary/60 px-4 py-3 text-sm"><span><strong className="tabular-nums text-[var(--marca-azul-profundo)]">{processados} de {destinatarios.length}</strong> mensagens saíram do estado pendente.</span><span className="text-muted-foreground">Selecione um cliente para conferir.</span></div>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(19rem,0.85fr)]">
        <div>
          <div className="hidden overflow-x-auto rounded-xl border md:block"><Table><TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead>Destino</TableHead><TableHead>Envio</TableHead><TableHead>Resultado</TableHead><TableHead><span className="sr-only">Ações</span></TableHead></TableRow></TableHeader><TableBody>{destinatarios.map((destinatario) => <TableRow key={destinatario.id} data-state={selecionadoId === destinatario.id ? "selected" : undefined}><TableCell className="font-medium">{destinatario.nomeCliente}</TableCell><TableCell>{destinatario.destino}</TableCell><TableCell><EstadoEnvio destinatario={destinatario} /></TableCell><TableCell>{resultadoDisponivel(destinatario) ? <ResultadoDestinatario acaoId={acaoId} destinatario={destinatario} /> : <span className="text-sm text-muted-foreground">Disponível após o envio</span>}</TableCell><TableCell className="text-right"><Button type="button" size="sm" variant="outline" onClick={() => selecionar(destinatario.id)}><MessageSquareText />Conferir mensagem</Button></TableCell></TableRow>)}</TableBody></Table></div>
          <div className="space-y-3 md:hidden">{destinatarios.map((destinatario) => <article key={destinatario.id} className={cn("rounded-xl border bg-card p-4", selecionadoId === destinatario.id && "border-primary ring-2 ring-primary/15")}><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-[var(--marca-azul-profundo)]">{destinatario.nomeCliente}</h3><p className="mt-1 text-sm text-muted-foreground">{destinatario.destino}</p></div><EstadoEnvio destinatario={destinatario} /></div><div className="mt-4">{resultadoDisponivel(destinatario) ? <ResultadoDestinatario acaoId={acaoId} destinatario={destinatario} /> : <p className="text-sm text-muted-foreground">Resultado disponível após o envio.</p>}</div><Button type="button" className="mt-4 w-full" variant="outline" onClick={() => selecionar(destinatario.id)}><MessageSquareText />Conferir mensagem</Button></article>)}</div>
        </div>
        <div className="lg:sticky lg:top-24">
          {selecionado ? <section aria-labelledby="titulo-previa-mensagem" className="space-y-4 rounded-xl border bg-secondary/25 p-4 sm:p-5"><div><Badge variant="outline">Em revisão</Badge><h3 id="titulo-previa-mensagem" className="mt-3 font-heading text-lg font-semibold text-[var(--marca-azul-profundo)]">Mensagem para {selecionado.nomeCliente}</h3><p className="text-sm text-muted-foreground">Destino definitivo: {selecionado.destino}</p></div><div className="rounded-xl border bg-card p-4"><p className="mb-2 text-xs font-semibold text-muted-foreground">Prévia final no WhatsApp</p><p className="whitespace-pre-wrap text-sm leading-6">{selecionado.conteudoPreVisualizacao}</p></div>{selecionado.situacaoEnvio === "Pendente" && envioHabilitado ? <AlertDialog><AlertDialogTrigger asChild><Button type="button" className="w-full" disabled={enviando}><Send />{enviando ? "Enviando..." : "Enviar esta mensagem"}</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Enviar mensagem para {selecionado.nomeCliente}?</AlertDialogTitle><AlertDialogDescription>Será solicitada somente esta mensagem para {selecionado.destino}. O conteúdo usa o modelo aprovado e não poderá ser alterado após a confirmação.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Voltar e revisar</AlertDialogCancel><AlertDialogAction onClick={() => enviar(selecionado)}><Send />Confirmar envio</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog> : selecionado.situacaoEnvio === "Pendente" ? <p className="text-sm text-muted-foreground">Envio indisponível nesta etapa da homologação.</p> : <p className="text-sm text-muted-foreground">Esta mensagem já saiu do estado pendente e não pode ser solicitada novamente.</p>}<Button type="button" variant="ghost" className="w-full" onClick={selecionarProximo}>Próximo cliente pendente<ArrowRight /></Button></section> : <div className="rounded-xl border border-dashed bg-card p-8 text-center"><MessageSquareText className="mx-auto mb-3 size-6 text-primary" /><p className="text-sm text-muted-foreground">Escolha “Conferir mensagem” para abrir a prévia individual.</p></div>}
        </div>
      </div>
    </>}
    {situacao === "Preparada" ? <p className="text-xs text-muted-foreground">A ação permanece preparada até a primeira confirmação individual.</p> : null}
  </CardContent></Card>;
}
