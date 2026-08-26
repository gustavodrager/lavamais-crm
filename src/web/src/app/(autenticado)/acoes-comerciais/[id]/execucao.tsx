"use client";

import { useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCheck, LockKeyhole, MessageCircle, Send, UserRound } from "lucide-react";
import type { DestinatarioDaAcao, SituacaoAcaoComercial } from "@/contratos/apresentacao";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { enviarMensagemIndividual } from "./acoes";
import { ResultadoDestinatario } from "./resultado-destinatario";

const rotulosEnvio = { Pendente: "Pendente", AguardandoSolicitacao: "Na fila", Solicitado: "Solicitada", Enviado: "Enviada", Entregue: "Entregue", Lido: "Lida", Falhou: "Falhou" };
const resultadoDisponivel = () => true;

export function ExecucaoAcao({ acaoId, situacao, destinatarios, envioHabilitado = true }: { acaoId: string; situacao: SituacaoAcaoComercial; destinatarios: DestinatarioDaAcao[]; envioHabilitado?: boolean }) {
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [enviadosLocalmente, setEnviadosLocalmente] = useState<string[]>([]);
  const [enviando, iniciarTransicao] = useTransition();
  const selecionado = destinatarios.find((item) => item.id === selecionadoId) ?? null;
  const foiEnviado = (item: DestinatarioDaAcao) => item.situacaoEnvio !== "Pendente" || enviadosLocalmente.includes(item.id);
  const processados = destinatarios.filter(foiEnviado).length;

  function selecionar(id: string) { setSelecionadoId(id); setMensagem(null); setSucesso(null); }
  function selecionarProximo() {
    const indiceAtual = selecionado ? destinatarios.findIndex((item) => item.id === selecionado.id) : -1;
    const ordenados = [...destinatarios.slice(indiceAtual + 1), ...destinatarios.slice(0, indiceAtual + 1)];
    const proximo = ordenados.find((item) => !foiEnviado(item) && item.id !== selecionado?.id);
    if (proximo) selecionar(proximo.id);
  }
  function enviar(destinatario: DestinatarioDaAcao) {
    setMensagem(null); setSucesso(null);
    iniciarTransicao(async () => {
      const resultado = await enviarMensagemIndividual({ acaoId, destinatarioId: destinatario.id, versao: destinatario.versao });
      if (resultado.sucesso) { setEnviadosLocalmente((atuais) => [...atuais, destinatario.id]); setSucesso(`Mensagem de ${destinatario.nomeCliente} encaminhada para processamento.`); }
      else setMensagem(resultado.mensagem);
    });
  }

  return <Card className="mt-6 overflow-hidden"><CardHeader><CardTitle>Enviar mensagens</CardTitle><CardDescription>Escolha uma cliente, confira a conversa e envie somente aquela mensagem.</CardDescription></CardHeader><CardContent className="space-y-5">
    {!envioHabilitado && <Alert><AlertTitle>Envio ainda não habilitado</AlertTitle><AlertDescription>A lista e as mensagens podem ser revisadas. O envio será liberado quando a Central de Notificação estiver integrada.</AlertDescription></Alert>}
    {mensagem && <Alert variant="destructive"><AlertTitle>Não foi possível enviar</AlertTitle><AlertDescription>{mensagem}</AlertDescription></Alert>}
    {destinatarios.length === 0 ? <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">A ação ainda não possui clientes.</p> : <>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-secondary/60 px-4 py-3 text-sm"><span><strong className="tabular-nums text-[var(--marca-azul-profundo)]">{processados} de {destinatarios.length}</strong> mensagens iniciadas.</span><span className="text-muted-foreground">Uma cliente por vez.</span></div>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(17rem,0.8fr)_minmax(0,1.35fr)]">
        <section aria-labelledby="titulo-fila-clientes" className={cn("space-y-3", selecionado && "hidden lg:block")}><div><h3 id="titulo-fila-clientes" className="font-semibold text-[var(--marca-azul-profundo)]">Escolha uma cliente</h3><p className="text-sm text-muted-foreground">A mensagem só será aberta; nada será enviado automaticamente.</p></div><div className="space-y-2">{destinatarios.map((destinatario, indice) => { const enviado = foiEnviado(destinatario); return <button key={destinatario.id} type="button" onClick={() => selecionar(destinatario.id)} className={cn("flex min-h-16 w-full items-center gap-3 rounded-xl border bg-card p-3 text-left transition-colors hover:border-primary", selecionadoId === destinatario.id && "border-primary bg-primary/5 ring-2 ring-primary/15")}><span className={cn("grid size-10 shrink-0 place-items-center rounded-full bg-secondary font-semibold text-[var(--marca-azul-profundo)]", enviado && "bg-emerald-100 text-emerald-700")}>{enviado ? <Check className="size-5" /> : indice + 1}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{destinatario.nomeCliente}</span><span className="block truncate text-xs text-muted-foreground">{destinatario.destino}</span></span><Badge variant={destinatario.situacaoEnvio === "Falhou" ? "destructive" : enviado ? "outline" : "secondary"} className="shrink-0 whitespace-nowrap text-center">{enviadosLocalmente.includes(destinatario.id) ? "Na fila" : rotulosEnvio[destinatario.situacaoEnvio]}</Badge></button>; })}</div></section>
        <div className="lg:sticky lg:top-24">{selecionado ? <section aria-labelledby="titulo-conversa" className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <header className="flex items-center gap-3 bg-[#075e54] px-3 py-3 text-white sm:px-4"><Button type="button" variant="ghost" size="icon" className="text-white hover:bg-white/15 hover:text-white lg:hidden" onClick={() => setSelecionadoId(null)} aria-label="Voltar para clientes"><ArrowLeft /></Button><span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/20"><UserRound className="size-5" /></span><div className="min-w-0"><h3 id="titulo-conversa" className="truncate font-semibold">{selecionado.nomeCliente}</h3><p className="truncate text-xs text-white/80">{selecionado.destino}</p></div></header>
          <div className="min-h-28 bg-[#efeae2] p-4" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(80,80,80,.06) 1px, transparent 0)", backgroundSize: "18px 18px" }}><div className="ml-auto max-w-[88%] rounded-xl rounded-tr-sm bg-[#d9fdd3] px-3 py-2.5 shadow-sm sm:max-w-[75%]"><p className="whitespace-pre-wrap text-sm leading-6 text-[#111b21]">{selecionado.conteudoPreVisualizacao}</p><div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-[#667781]"><span>prévia</span><CheckCheck className="size-3.5" /></div></div></div>
          <div className="border-t bg-[#f0f2f5] p-3"><div className="mb-2 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-muted-foreground"><LockKeyhole className="size-4 shrink-0" /><span>Mensagem aprovada e pronta para {selecionado.nomeCliente}</span></div>
            {sucesso && enviadosLocalmente.includes(selecionado.id) ? <div className="space-y-3"><Alert className="bg-white"><CheckCheck /><AlertTitle>Mensagem solicitada</AlertTitle><AlertDescription>{sucesso}</AlertDescription></Alert><Button type="button" className="w-full" onClick={selecionarProximo}>Preparar mensagem da próxima cliente<ArrowRight /></Button></div> : selecionado.situacaoEnvio === "Pendente" && envioHabilitado ? <AlertDialog><AlertDialogTrigger asChild><Button type="button" className="w-full bg-[#128c7e] text-white hover:bg-[#0f796d]" disabled={enviando}><Send />{enviando ? "Enviando..." : `Enviar mensagem para ${selecionado.nomeCliente}`}</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Enviar mensagem para {selecionado.nomeCliente}?</AlertDialogTitle><AlertDialogDescription>Será solicitada somente esta mensagem para {selecionado.destino}. O texto usa o modelo aprovado e não pode ser editado.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Voltar e revisar</AlertDialogCancel><AlertDialogAction onClick={() => enviar(selecionado)}><Send />Confirmar envio</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog> : selecionado.situacaoEnvio === "Pendente" ? <p className="text-center text-sm text-muted-foreground">Envio indisponível nesta etapa da homologação.</p> : <div className="space-y-3"><p className="text-center text-sm text-muted-foreground">Esta mensagem já saiu do estado pendente.</p><Button type="button" variant="outline" className="w-full" onClick={selecionarProximo}>Próxima cliente<ArrowRight /></Button></div>}
          </div>
          {resultadoDisponivel() && <div className="border-t p-4">{selecionado.codigoFalha && <p className="mb-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"><strong>Falha técnica:</strong> {selecionado.codigoFalha}</p>}<ResultadoDestinatario acaoId={acaoId} destinatario={selecionado} /></div>}
        </section> : <div className="grid min-h-80 place-items-center rounded-2xl border border-dashed bg-secondary/25 p-8 text-center"><div><MessageCircle className="mx-auto mb-3 size-8 text-primary" /><p className="font-semibold text-[var(--marca-azul-profundo)]">Escolha uma cliente da lista</p><p className="mt-1 max-w-xs text-sm text-muted-foreground">A conversa personalizada será aberta aqui para sua conferência.</p></div></div>}</div>
      </div>
    </>}
    {situacao === "Preparada" && <p className="text-xs text-muted-foreground">A ação permanece preparada até a primeira confirmação individual.</p>}
  </CardContent></Card>;
}
