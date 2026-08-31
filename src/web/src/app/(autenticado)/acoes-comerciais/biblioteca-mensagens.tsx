"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { Check, MessageSquareText, Plus, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { OpcaoModeloDeMensagem } from "@/contratos/apresentacao";
import { modelosPadraoLavaMais, type ModeloPadraoLavaMais } from "@/conteudo/modelos-padrao-lavamais";
import { cn } from "@/lib/utils";
import { aprovarEDisponibilizarMensagem, type ResultadoPublicacaoMensagem } from "./acoes-mensagens";

export function BibliotecaMensagens({ modelos, podeGerenciar }: { modelos: OpcaoModeloDeMensagem[]; podeGerenciar: boolean }) {
  const [formularioAberto, setFormularioAberto] = useState(false);
  return <div className="space-y-6">
    <section aria-labelledby="titulo-mensagens-aprovadas">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 id="titulo-mensagens-aprovadas" className="text-lg font-semibold text-[var(--marca-azul-profundo)]">Mensagens aprovadas</h2>
          <p className="mt-1 text-sm text-muted-foreground">{modelos.length} {modelos.length === 1 ? "mensagem disponível" : "mensagens disponíveis"} para as ações comerciais.</p>
        </div>
        {podeGerenciar ? <Button type="button" variant={formularioAberto ? "outline" : "default"} onClick={() => setFormularioAberto((aberto) => !aberto)}>
          {formularioAberto ? <X aria-hidden="true" /> : <Plus aria-hidden="true" />}{formularioAberto ? "Fechar" : "Nova mensagem"}
        </Button> : null}
      </div>
      {modelos.length === 0 ? <div className="rounded-xl border border-dashed bg-card px-6 py-12 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary"><MessageSquareText aria-hidden="true" className="size-5" /></span>
        <h3 className="mt-4 font-semibold text-[var(--marca-azul-profundo)]">Nenhuma mensagem aprovada</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{podeGerenciar ? "Disponibilize a primeira mensagem para usá-la na preparação de uma ação." : "Ainda não há mensagens disponíveis para preparar uma ação."}</p>
      </div> : <div className="grid gap-3 lg:grid-cols-2">{modelos.map((modelo) => <CartaoMensagem key={modelo.versaoId} modelo={modelo} />)}</div>}
    </section>
    {podeGerenciar && formularioAberto ? <FormularioNovaMensagem modelosPublicados={modelos} /> : null}
  </div>;
}

function CartaoMensagem({ modelo }: { modelo: OpcaoModeloDeMensagem }) {
  return <Card className="h-full">
    <CardHeader>
      <h3 className="font-heading text-base leading-snug font-medium">{modelo.nome}</h3>
      <CardDescription>WhatsApp · versão {modelo.numeroVersao}</CardDescription>
      <CardAction><Badge variant="secondary"><Check aria-hidden="true" />Aprovada</Badge></CardAction>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <p className="text-xs font-medium uppercase text-muted-foreground">Prévia</p>
        <p className="mt-2 border-l-2 border-primary/30 pl-3 text-sm leading-6">{prepararPrevia(modelo.conteudoPreVisualizacao)}</p>
      </div>
      {modelo.variaveis.length > 0 ? <div className="flex flex-wrap gap-2">{modelo.variaveis.map((variavel) => <Badge key={variavel} variant="outline">{rotuloVariavel(variavel)}</Badge>)}</div> : null}
    </CardContent>
  </Card>;
}

function FormularioNovaMensagem({ modelosPublicados }: { modelosPublicados: OpcaoModeloDeMensagem[] }) {
  const nomeRef = useRef<HTMLInputElement>(null);
  const [selecionado, setSelecionado] = useState<ModeloPadraoLavaMais | null>(null);
  const [nome, setNome] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);
  const [resultado, setResultado] = useState<ResultadoPublicacaoMensagem | null>(null);
  const [pendente, iniciar] = useTransition();
  const nomesPublicados = new Set(modelosPublicados.map((modelo) => modelo.nome.toLocaleLowerCase("pt-BR")));
  const formularioValido = selecionado !== null && nome.trim().length >= 2 && conteudo.trim().length >= 5;

  function escolher(modelo: ModeloPadraoLavaMais) {
    setSelecionado(modelo);
    setNome(modelo.nome);
    setConteudo(modelo.conteudoPreVisualizacao);
    setResultado(null);
    requestAnimationFrame(() => nomeRef.current?.focus());
  }

  function solicitarConfirmacao(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (formularioValido) setConfirmacaoAberta(true);
  }

  function publicar() {
    if (!selecionado) return;
    iniciar(async () => {
      const retorno = await aprovarEDisponibilizarMensagem({ modeloPadraoId: selecionado.id, nome, conteudoPreVisualizacao: conteudo });
      setResultado(retorno);
      if (retorno.sucesso) {
        setSelecionado(null);
        setNome("");
        setConteudo("");
      }
    });
  }

  return <section aria-labelledby="titulo-nova-mensagem" className="rounded-xl border bg-card p-4 sm:p-5">
    <div>
      <h2 id="titulo-nova-mensagem" className="text-lg font-semibold text-[var(--marca-azul-profundo)]">Aprovar nova mensagem</h2>
      <p className="mt-1 text-sm text-muted-foreground">Escolha uma sugestão, revise o texto final e disponibilize para a equipe.</p>
    </div>
    {resultado ? <Alert variant={resultado.sucesso ? "default" : "destructive"} className="mt-4">
      <AlertTitle>{resultado.sucesso ? "Mensagem disponível" : "Não foi possível publicar"}</AlertTitle>
      <AlertDescription>{resultado.mensagem}</AlertDescription>
    </Alert> : null}
    <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{modelosPadraoLavaMais.map((modelo) => {
      const ativo = selecionado?.id === modelo.id;
      const jaPublicado = nomesPublicados.has(modelo.nome.toLocaleLowerCase("pt-BR"));
      return <button key={modelo.id} type="button" disabled={jaPublicado} aria-pressed={ativo} onClick={() => escolher(modelo)} className={cn(
        "min-h-20 rounded-lg border bg-background px-3 py-3 text-left transition-colors hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-55",
        ativo && "border-primary bg-primary/5 ring-2 ring-primary/15",
      )}>
        <span className="flex items-start justify-between gap-2"><span className="text-sm font-medium">{modelo.nome}</span>{ativo ? <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" /> : null}</span>
        <span className="mt-1 block text-xs leading-5 text-muted-foreground">{jaPublicado ? "Já disponível" : modelo.objetivo}</span>
      </button>;
    })}</div>
    {selecionado ? <form onSubmit={solicitarConfirmacao} className="mt-5 space-y-4 border-t pt-5">
      <div className="space-y-2"><Label htmlFor="nova-mensagem-nome">Nome da mensagem</Label><Input ref={nomeRef} id="nova-mensagem-nome" value={nome} onChange={(evento) => setNome(evento.target.value)} required maxLength={160} /></div>
      <div className="space-y-2"><Label htmlFor="nova-mensagem-conteudo">Texto aprovado</Label><Textarea id="nova-mensagem-conteudo" value={conteudo} onChange={(evento) => setConteudo(evento.target.value)} className="min-h-36" required maxLength={2000} /></div>
      <p className="text-xs leading-5 text-muted-foreground">Campos automáticos: nome do cliente e item da ação.</p>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" onClick={() => { setSelecionado(null); setResultado(null); }}>Cancelar</Button>
        <Button type="submit" disabled={pendente || !formularioValido}>{pendente ? "Publicando..." : "Revisar e publicar"}</Button>
      </div>
    </form> : null}
    <AlertDialog open={confirmacaoAberta} onOpenChange={setConfirmacaoAberta}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Aprovar e disponibilizar esta mensagem?</AlertDialogTitle>
          <AlertDialogDescription>“{nome}” ficará disponível para Gerentes escolherem nas ações comerciais. O texto desta versão não poderá ser alterado depois da publicação.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>Voltar e revisar</AlertDialogCancel><AlertDialogAction onClick={publicar}>Aprovar e publicar</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </section>;
}

function prepararPrevia(conteudo: string) {
  return conteudo.replaceAll("{{nomeCliente}}", "[nome do cliente]").replaceAll("{{itemCatalogo}}", "[item da ação]");
}

function rotuloVariavel(variavel: string) {
  if (variavel === "nomeCliente") return "Nome do cliente";
  if (variavel === "itemCatalogo") return "Item da ação";
  return variavel;
}
