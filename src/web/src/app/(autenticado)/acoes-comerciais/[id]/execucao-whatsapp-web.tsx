"use client";

import { useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCheck, ClipboardCheck, ExternalLink, LockKeyhole, MessageCircle, ShieldCheck, UserRound } from "lucide-react";
import type { DestinatarioDaAcao, SituacaoAcaoComercial } from "@/contratos/apresentacao";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { criarLinkWhatsapp } from "@/lib/whatsapp-web";
import { confirmarEnvioWhatsapp, registrarAberturaWhatsapp } from "./acoes";
import { ResultadoDestinatario } from "./resultado-destinatario";

const rotulosEnvio = { Pendente: "Pendente", Enviado: "Enviada" } as const;

export function ExecucaoAcaoWhatsappWeb({ acaoId, situacao, destinatarios, modoOperador = false }: {
  acaoId: string;
  situacao: SituacaoAcaoComercial;
  destinatarios: DestinatarioDaAcao[];
  modoOperador?: boolean;
}) {
  const [selecionadoId, setSelecionadoId] = useState<string | null>(() => modoOperador
    ? destinatarios.find((item) => item.situacaoEnvio === "Pendente")?.id
      ?? destinatarios.find((item) => item.resultadoComercial === "NaoInformado")?.id
      ?? destinatarios[0]?.id
      ?? null
    : null);
  const [abertoId, setAbertoId] = useState<string | null>(null);
  const [linkAlternativo, setLinkAlternativo] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [resultadosLocais, setResultadosLocais] = useState<string[]>([]);
  const [confirmando, iniciarConfirmacao] = useTransition();
  const [, iniciarRegistroDaAbertura] = useTransition();
  const selecionado = destinatarios.find((item) => item.id === selecionadoId) ?? null;
  const temResultado = (item: DestinatarioDaAcao) => item.resultadoComercial !== "NaoInformado" || resultadosLocais.includes(item.id);
  const destinatariosOrdenados = destinatarios.toSorted((a, b) => prioridadeDaTarefa(a, temResultado) - prioridadeDaTarefa(b, temResultado));
  const pendentes = destinatarios.filter((item) => item.situacaoEnvio === "Pendente");
  const semResultado = destinatarios.filter((item) => item.situacaoEnvio === "Enviado" && !temResultado(item));

  function selecionar(id: string) {
    setSelecionadoId(id);
    setAbertoId(null);
    setLinkAlternativo(null);
    setMensagem(null);
    setSucesso(null);
  }

  function selecionarProximaTarefa() {
    const indiceAtual = selecionado ? destinatariosOrdenados.findIndex((item) => item.id === selecionado.id) : -1;
    const ordenados = [...destinatariosOrdenados.slice(indiceAtual + 1), ...destinatariosOrdenados.slice(0, indiceAtual + 1)];
    const proximo = ordenados.find((item) => item.situacaoEnvio === "Pendente" && item.id !== selecionado?.id)
      ?? ordenados.find((item) => !temResultado(item) && item.id !== selecionado?.id);
    if (proximo) selecionar(proximo.id);
  }

  function registrarAbertura(destinatario: DestinatarioDaAcao) {
    setAbertoId(destinatario.id);
    setLinkAlternativo(null);
    iniciarRegistroDaAbertura(async () => {
      const resultado = await registrarAberturaWhatsapp({ acaoId, destinatarioId: destinatario.id, versao: destinatario.versao });
      if (!resultado.sucesso) setMensagem(resultado.mensagem);
    });
  }

  function abrirWhatsapp(destinatario: DestinatarioDaAcao) {
    setMensagem(null);
    setSucesso(null);
    let url: string;
    try {
      url = criarLinkWhatsapp(destinatario.destino, destinatario.conteudoPreVisualizacao);
    } catch {
      setMensagem("O WhatsApp deste cliente é inválido. Revise o cadastro antes de continuar.");
      return;
    }

    const janela = window.open("", "lavamais-whatsapp-web", "popup=yes,width=560,height=780,resizable=yes,scrollbars=yes");
    if (!janela) {
      setLinkAlternativo(url);
      setMensagem("O navegador bloqueou a janela auxiliar. Use o botão abaixo para abrir o WhatsApp em uma nova aba.");
      return;
    }

    janela.opener = null;
    janela.location.href = url;
    janela.focus();
    registrarAbertura(destinatario);
  }

  function confirmarEnvio(destinatario: DestinatarioDaAcao) {
    setMensagem(null);
    setSucesso(null);
    iniciarConfirmacao(async () => {
      const resultado = await confirmarEnvioWhatsapp({ acaoId, destinatarioId: destinatario.id, versao: destinatario.versao });
      if (resultado.sucesso) {
        setAbertoId(null);
        setSucesso(`Envio para ${destinatario.nomeCliente} confirmado manualmente.`);
      } else setMensagem(resultado.mensagem);
    });
  }

  const titulo = modoOperador ? "Fila de atendimento" : "Enviar mensagens";
  const descricao = modoOperador
    ? "Abra a conversa no WhatsApp, envie uma cliente por vez e confirme o que foi feito."
    : "Escolha uma cliente, confira a mensagem e abra a conversa no WhatsApp.";

  return <Card className="mt-6 overflow-hidden">
    <CardHeader><CardTitle>{titulo}</CardTitle><CardDescription>{descricao}</CardDescription></CardHeader>
    <CardContent className="space-y-5">
      <Alert><ShieldCheck /><AlertTitle>WhatsApp Web em janela separada</AlertTitle><AlertDescription>O WhatsApp não permite ser incorporado dentro do CRM. A conversa será aberta em uma janela auxiliar oficial. Se a sessão tiver expirado, o próprio WhatsApp mostrará o QR Code. O CRM não acessa nem armazena essa sessão.</AlertDescription></Alert>
      {mensagem && <Alert variant="destructive"><AlertTitle>Atenção</AlertTitle><AlertDescription>{mensagem}</AlertDescription></Alert>}
      {linkAlternativo && selecionado && <Button asChild variant="outline" className="w-full"><a href={linkAlternativo} target="_blank" rel="noopener noreferrer" onClick={() => registrarAbertura(selecionado)}><ExternalLink />Abrir WhatsApp em nova aba</a></Button>}
      {sucesso && <Alert><CheckCheck /><AlertTitle>Envio confirmado</AlertTitle><AlertDescription>{sucesso}</AlertDescription></Alert>}
      {destinatarios.length === 0 ? <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">A ação ainda não possui clientes.</p> : <>
        <div className="grid gap-3 sm:grid-cols-3">
          <IndicadorOperacional rotulo="Envios confirmados" valor={`${destinatarios.length - pendentes.length} de ${destinatarios.length}`} />
          <IndicadorOperacional rotulo="Para enviar" valor={pendentes.length.toString()} />
          <IndicadorOperacional rotulo="Resultado pendente" valor={semResultado.length.toString()} />
        </div>
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(17rem,0.8fr)_minmax(0,1.35fr)]">
          <section aria-labelledby="titulo-fila-clientes" className={cn("space-y-3", selecionado && "hidden lg:block")}>
            <div><h3 id="titulo-fila-clientes" className="font-semibold text-[var(--marca-azul-profundo)]">{modoOperador ? "Clientes da fila" : "Escolha uma cliente"}</h3><p className="text-sm text-muted-foreground">Comece pelos pendentes. O texto já está travado pelo modelo aprovado.</p></div>
            <div className="space-y-2">{destinatariosOrdenados.map((destinatario, indice) => {
              const enviado = destinatario.situacaoEnvio === "Enviado";
              return <button key={destinatario.id} type="button" onClick={() => selecionar(destinatario.id)} className={cn("flex min-h-16 w-full items-center gap-3 rounded-xl border bg-card p-3 text-left transition-colors hover:border-primary", selecionadoId === destinatario.id && "border-primary bg-primary/5 ring-2 ring-primary/15")}>
                <span className={cn("grid size-10 shrink-0 place-items-center rounded-full bg-secondary font-semibold text-[var(--marca-azul-profundo)]", enviado && "bg-emerald-100 text-emerald-700")}>{enviado ? <Check className="size-5" /> : indice + 1}</span>
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{destinatario.nomeCliente}</span><span className="block truncate text-xs text-muted-foreground">{destinatario.destino}</span></span>
                <Badge variant={enviado ? "outline" : "secondary"} className="shrink-0 whitespace-nowrap text-center">{rotulosEnvio[destinatario.situacaoEnvio]}</Badge>
              </button>;
            })}</div>
          </section>
          <div className="lg:sticky lg:top-24">{selecionado ? <section aria-labelledby="titulo-conversa" className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <header className="flex items-center gap-3 bg-[#075e54] px-3 py-3 text-white sm:px-4"><Button type="button" variant="ghost" size="icon" className="text-white hover:bg-white/15 hover:text-white lg:hidden" onClick={() => setSelecionadoId(null)} aria-label="Voltar para clientes"><ArrowLeft /></Button><span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/20"><UserRound className="size-5" /></span><div className="min-w-0"><h3 id="titulo-conversa" className="truncate font-semibold">{selecionado.nomeCliente}</h3><p className="truncate text-xs text-white/80">{selecionado.destino}</p></div></header>
            <div className="min-h-28 bg-[#efeae2] p-4" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(80,80,80,.06) 1px, transparent 0)", backgroundSize: "18px 18px" }}><div className="ml-auto max-w-[88%] rounded-xl rounded-tr-sm bg-[#d9fdd3] px-3 py-2.5 shadow-sm sm:max-w-[75%]"><p className="whitespace-pre-wrap text-sm leading-6 text-[#111b21]">{selecionado.conteudoPreVisualizacao}</p><div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-[#667781]"><span>prévia</span><CheckCheck className="size-3.5" /></div></div></div>
            <div className="space-y-3 border-t bg-[#f0f2f5] p-3"><div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-muted-foreground"><LockKeyhole className="size-4 shrink-0" /><span>Mensagem aprovada e pronta para {selecionado.nomeCliente}</span></div>
              {selecionado.situacaoEnvio === "Pendente" && abertoId !== selecionado.id ? <Button type="button" className="w-full bg-[#128c7e] text-white hover:bg-[#0f796d]" onClick={() => abrirWhatsapp(selecionado)}><ExternalLink />Abrir WhatsApp para {selecionado.nomeCliente}</Button> : null}
              {selecionado.situacaoEnvio === "Pendente" && abertoId === selecionado.id ? <Alert><MessageCircle /><AlertTitle>Conversa aberta</AlertTitle><AlertDescription>Envie a mensagem no WhatsApp. Depois volte ao CRM e confirme somente se o envio realmente foi feito.</AlertDescription><div className="mt-3 flex flex-col gap-2 sm:flex-row"><Button type="button" variant="outline" onClick={() => setAbertoId(null)}>Não enviei</Button><AlertDialog><AlertDialogTrigger asChild><Button type="button" disabled={confirmando}>{confirmando ? "Confirmando..." : "Confirmar que enviei"}</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Você enviou a mensagem para {selecionado.nomeCliente}?</AlertDialogTitle><AlertDialogDescription>O CRM não consegue verificar o clique no WhatsApp. Confirme apenas se a mensagem foi enviada para {selecionado.destino}. Esta confirmação ficará registrada na auditoria.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Voltar e conferir</AlertDialogCancel><AlertDialogAction onClick={() => confirmarEnvio(selecionado)}>Sim, eu enviei</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div></Alert> : null}
              {selecionado.situacaoEnvio === "Enviado" ? <div className="space-y-3"><p className="text-center text-sm text-muted-foreground">{selecionado.dataEnvioConfirmado ? `Envio confirmado manualmente em ${formatarDataHora(selecionado.dataEnvioConfirmado)}.` : "Envio anterior preservado no histórico, sem confirmação manual deste fluxo."}</p>{(pendentes.length > 0 || semResultado.some((item) => item.id !== selecionado.id)) && <Button type="button" variant="outline" className="w-full" onClick={selecionarProximaTarefa}>{pendentes.length > 0 ? "Próxima cliente" : "Revisar próximo resultado"}<ArrowRight /></Button>}</div> : null}
            </div>
            {selecionado.situacaoEnvio === "Enviado" && <div className="border-t p-4"><ResultadoDestinatario key={selecionado.id} acaoId={acaoId} destinatario={selecionado} aoSalvar={(id) => setResultadosLocais((atuais) => atuais.includes(id) ? atuais : [...atuais, id])} /></div>}
          </section> : <div className="grid min-h-80 place-items-center rounded-2xl border border-dashed bg-secondary/25 p-8 text-center"><div><MessageCircle className="mx-auto mb-3 size-8 text-primary" /><p className="font-semibold text-[var(--marca-azul-profundo)]">Escolha uma cliente da lista</p><p className="mt-1 max-w-xs text-sm text-muted-foreground">A mensagem personalizada será aberta aqui para sua conferência.</p></div></div>}</div>
        </div>
      </>}
      {situacao === "Preparada" && <p className="text-xs text-muted-foreground">A ação permanece preparada até a primeira confirmação individual.</p>}
    </CardContent>
  </Card>;
}

function IndicadorOperacional({ rotulo, valor }: { rotulo: string; valor: string }) {
  return <div className="flex min-h-20 items-center gap-3 rounded-xl border bg-secondary/40 px-4 py-3"><ClipboardCheck className="size-5 shrink-0 text-primary" /><span><strong className="block text-lg tabular-nums text-[var(--marca-azul-profundo)]">{valor}</strong><span className="block text-xs text-muted-foreground">{rotulo}</span></span></div>;
}

function prioridadeDaTarefa(item: DestinatarioDaAcao, temResultado: (item: DestinatarioDaAcao) => boolean) {
  if (item.situacaoEnvio === "Pendente") return 0;
  if (!temResultado(item)) return 1;
  return 2;
}

function formatarDataHora(valor: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(valor));
}
