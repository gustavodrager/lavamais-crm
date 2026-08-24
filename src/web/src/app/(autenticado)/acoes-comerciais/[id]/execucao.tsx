"use client";

import { useState, useTransition } from "react";
import { MessageSquareText, Send } from "lucide-react";
import type { DestinatarioDaAcao, SituacaoAcaoComercial } from "@/contratos/apresentacao";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { enviarMensagemIndividual } from "./acoes";
import { ResultadoDestinatario } from "./resultado-destinatario";

const rotulosEnvio = { Pendente: "Pendente", AguardandoSolicitacao: "Aguardando solicitação", Solicitado: "Solicitado", Enviado: "Enviado", Entregue: "Entregue", Lido: "Lido", Falhou: "Falhou" };

export function ExecucaoAcao({ acaoId, situacao, destinatarios, envioHabilitado = true }: { acaoId: string; situacao: SituacaoAcaoComercial; destinatarios: DestinatarioDaAcao[]; envioHabilitado?: boolean }) {
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [enviando, iniciarTransicao] = useTransition();
  const selecionado = destinatarios.find((item) => item.id === selecionadoId) ?? null;

  function enviar(destinatario: DestinatarioDaAcao) {
    setMensagem(null); setSucesso(null);
    iniciarTransicao(async () => {
      const resultado = await enviarMensagemIndividual({ acaoId, destinatarioId: destinatario.id, versao: destinatario.versao });
      if (resultado.sucesso) setSucesso(`Mensagem de ${destinatario.nomeCliente} encaminhada para processamento.`);
      else setMensagem(resultado.mensagem);
    });
  }

  return <Card className="mt-6"><CardHeader><CardTitle>Destinatários e mensagens</CardTitle><CardDescription>Selecione um cliente e confira a mensagem congelada para a futura etapa de envio.</CardDescription></CardHeader><CardContent className="space-y-5">
    {!envioHabilitado && <Alert><AlertTitle>Envio ainda não habilitado</AlertTitle><AlertDescription>A audiência e as mensagens já podem ser revisadas. O envio será liberado quando a Central de Notificação estiver integrada.</AlertDescription></Alert>}
    {mensagem && <Alert variant="destructive"><AlertTitle>Não foi possível enviar</AlertTitle><AlertDescription>{mensagem}</AlertDescription></Alert>}
    {sucesso && <Alert><AlertTitle>Mensagem solicitada</AlertTitle><AlertDescription>{sucesso}</AlertDescription></Alert>}
    {destinatarios.length === 0 ? <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">A ação ainda não possui destinatários congelados.</p> : <>
      <div className="overflow-x-auto rounded-md border"><Table><TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead>Destino</TableHead><TableHead>Envio</TableHead><TableHead>Resultado</TableHead><TableHead><span className="sr-only">Ações</span></TableHead></TableRow></TableHeader><TableBody>{destinatarios.map((destinatario) => {
        const resultadoDisponivel = destinatario.situacaoEnvio !== "Pendente" && destinatario.situacaoEnvio !== "AguardandoSolicitacao";
        return <TableRow key={destinatario.id} data-state={selecionadoId === destinatario.id ? "selected" : undefined}><TableCell className="font-medium">{destinatario.nomeCliente}</TableCell><TableCell>{destinatario.destino}</TableCell><TableCell><Badge variant={destinatario.situacaoEnvio === "Falhou" ? "destructive" : destinatario.situacaoEnvio === "Pendente" ? "secondary" : "outline"}>{rotulosEnvio[destinatario.situacaoEnvio]}</Badge>{destinatario.codigoFalha && <span className="mt-1 block max-w-56 text-xs text-destructive">Código: {destinatario.codigoFalha}</span>}</TableCell><TableCell>{resultadoDisponivel ? <ResultadoDestinatario acaoId={acaoId} destinatario={destinatario} /> : <span className="text-sm text-muted-foreground">Disponível após o envio</span>}</TableCell><TableCell className="text-right"><Button type="button" size="sm" variant="outline" onClick={() => { setSelecionadoId(destinatario.id); setMensagem(null); setSucesso(null); }}><MessageSquareText />Conferir mensagem</Button></TableCell></TableRow>;
      })}</TableBody></Table></div>
      {selecionado ? <section aria-labelledby="titulo-previa-mensagem" className="space-y-4 rounded-lg border bg-muted/20 p-4 sm:p-5"><div><h3 id="titulo-previa-mensagem" className="font-heading text-base font-medium">Mensagem para {selecionado.nomeCliente}</h3><p className="text-sm text-muted-foreground">Destino congelado: {selecionado.destino}</p></div><div className="rounded-lg border bg-background p-4"><p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Prévia final no WhatsApp</p><p className="whitespace-pre-wrap text-sm">{selecionado.conteudoPreVisualizacao}</p></div>{selecionado.situacaoEnvio === "Pendente" && envioHabilitado ? <AlertDialog><AlertDialogTrigger asChild><Button type="button" disabled={enviando}><Send />{enviando ? "Enviando..." : "Enviar esta mensagem"}</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Enviar mensagem para {selecionado.nomeCliente}?</AlertDialogTitle><AlertDialogDescription>Será solicitada somente esta mensagem para {selecionado.destino}. O conteúdo usa o modelo aprovado e não poderá ser alterado após a confirmação.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Voltar e revisar</AlertDialogCancel><AlertDialogAction onClick={() => enviar(selecionado)}><Send />Confirmar envio</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog> : selecionado.situacaoEnvio === "Pendente" ? <p className="text-sm text-muted-foreground">Envio indisponível nesta etapa da homologação.</p> : <p className="text-sm text-muted-foreground">Esta mensagem já saiu do estado pendente e não pode ser solicitada novamente.</p>}</section> : <div className="rounded-lg border border-dashed p-6 text-center"><MessageSquareText className="mx-auto mb-2 size-5 text-muted-foreground" /><p className="text-sm text-muted-foreground">Selecione “Conferir mensagem” em um cliente para revisar o conteúdo antes do envio.</p></div>}
    </>}
    {situacao === "Preparada" && <p className="text-xs text-muted-foreground">A ação permanece preparada até a primeira confirmação individual.</p>}
  </CardContent></Card>;
}
