"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Check, ListChecks, Search, UserPlus, Users, X } from "lucide-react";
import type { CriteriosDeSegmentacao, ResumoCliente, SimulacaoDePublico } from "@/contratos/apresentacao";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { alterarExclusaoDoPublico, buscarClientesParaLista, montarListaRapida, salvarListaManual } from "./acoes";

type ModoEscolha = "rapida" | "manual" | null;

export function DefinicaoPublico({ acaoId, criterios, simulacao, aoSimular, aoAlterarFiltros, aoContinuar }: { acaoId: string; criterios: CriteriosDeSegmentacao; simulacao: SimulacaoDePublico | null; aoSimular: (simulacao: SimulacaoDePublico) => void; aoAlterarFiltros: () => void; aoContinuar?: () => void }) {
  const [modo, setModo] = useState<ModoEscolha>(criterios.modo === "Manual" && criterios.clienteIds?.length ? "rapida" : null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState<ResumoCliente[]>([]);
  const [selecionados, setSelecionados] = useState<ResumoCliente[]>([]);
  const [mostrarFormasEscolha, setMostrarFormasEscolha] = useState(!simulacao?.clientes.some((cliente) => cliente.elegivel));
  const [pendente, iniciarTransicao] = useTransition();
  const clientesDaFila = simulacao?.clientes.filter((cliente) => cliente.elegivel) ?? [];
  const temListaPronta = clientesDaFila.length > 0;
  const mostrarEscolha = mostrarFormasEscolha || !temListaPronta;

  function montarRapida() {
    setModo("rapida"); setMensagem(null);
    iniciarTransicao(async () => {
      const resultado = await montarListaRapida(acaoId);
      if (resultado.sucesso) { aoSimular(resultado.simulacao); setMostrarFormasEscolha(false); } else setMensagem(resultado.mensagem);
    });
  }
  function buscar() {
    setMensagem(null);
    iniciarTransicao(async () => {
      const resultado = await buscarClientesParaLista({ acaoId, busca });
      if (resultado.sucesso) setResultados(resultado.clientes); else setMensagem(resultado.mensagem);
    });
  }
  function alternarCliente(cliente: ResumoCliente) {
    setSelecionados((atuais) => atuais.some((item) => item.id === cliente.id) ? atuais.filter((item) => item.id !== cliente.id) : atuais.length < 10 ? [...atuais, cliente] : atuais);
  }
  function confirmarListaManual() {
    setMensagem(null);
    iniciarTransicao(async () => {
      const resultado = await salvarListaManual({ acaoId, clienteIds: selecionados.map((cliente) => cliente.id) });
      if (resultado.sucesso) { aoSimular(resultado.simulacao); setMostrarFormasEscolha(false); } else setMensagem(resultado.mensagem);
    });
  }
  function retirar(clienteId: string) {
    setMensagem(null);
    iniciarTransicao(async () => {
      const resultado = await alterarExclusaoDoPublico({ acaoId, clienteId, excluir: true });
      if (resultado.sucesso) { aoSimular(resultado.simulacao); setMostrarFormasEscolha(!resultado.simulacao.clientes.some((cliente) => cliente.elegivel)); } else setMensagem(resultado.mensagem);
    });
  }

  return <Card className="mt-6 overflow-hidden"><CardHeader><CardTitle>Escolha até 10 clientes</CardTitle><CardDescription>Monte uma lista curta. Depois, cada mensagem será conferida e enviada separadamente.</CardDescription></CardHeader><CardContent className="space-y-6">
    {mostrarEscolha ? <section aria-labelledby="titulo-forma-escolha" className="space-y-3"><div><h3 id="titulo-forma-escolha" className="font-semibold text-[var(--marca-azul-profundo)]">Como deseja começar?</h3><p className="text-sm text-muted-foreground">Escolha a opção mais simples para o atendimento de agora.</p></div><div className="grid gap-3 sm:grid-cols-2">
      <button type="button" disabled={pendente} onClick={montarRapida} className={cn("min-h-32 rounded-xl border bg-card p-4 text-left transition-colors hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50", modo === "rapida" && "border-primary bg-primary/5 ring-2 ring-primary/15")}><span className="flex items-start justify-between gap-3"><span className="rounded-lg bg-primary/10 p-2 text-primary"><ListChecks className="size-5" /></span><Badge>Recomendado</Badge></span><span className="mt-4 block font-semibold">Trazer 10 clientes</span><span className="mt-1 block text-sm text-muted-foreground">O sistema monta uma lista com clientes disponíveis para receber a mensagem.</span></button>
      <button type="button" disabled={pendente} onClick={() => { setModo("manual"); setMensagem(null); setMostrarFormasEscolha(true); aoAlterarFiltros(); }} className={cn("min-h-32 rounded-xl border bg-card p-4 text-left transition-colors hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50", modo === "manual" && "border-primary bg-primary/5 ring-2 ring-primary/15")}><span className="inline-block rounded-lg bg-secondary p-2 text-[var(--marca-azul-profundo)]"><UserPlus className="size-5" /></span><span className="mt-4 block font-semibold">Escolher pelo nome</span><span className="mt-1 block text-sm text-muted-foreground">Busque pessoas conhecidas e monte uma lista com até 10 clientes.</span></button>
    </div></section> : null}

    {modo === "manual" && mostrarEscolha ? <section aria-labelledby="titulo-busca-clientes" className="space-y-4 rounded-xl bg-secondary/45 p-4"><div className="flex items-center justify-between gap-3"><div><h3 id="titulo-busca-clientes" className="font-semibold">Escolha pelo nome</h3><p className="text-sm text-muted-foreground">{selecionados.length} de 10 clientes escolhidos</p></div><Badge variant="outline">Máximo 10</Badge></div><form role="search" onSubmit={(evento) => { evento.preventDefault(); buscar(); }} className="flex flex-col gap-2 sm:flex-row"><Input value={busca} onChange={(evento) => setBusca(evento.target.value)} placeholder="Nome ou WhatsApp" aria-label="Buscar cliente por nome ou WhatsApp" className="bg-card" /><Button type="submit" variant="outline" disabled={pendente || busca.trim().length < 2}><Search />Buscar</Button></form>
      {resultados.length > 0 && <div className="space-y-2" aria-label="Resultados da busca">{resultados.map((cliente) => { const marcado = selecionados.some((item) => item.id === cliente.id); return <button key={cliente.id} type="button" onClick={() => alternarCliente(cliente)} disabled={!marcado && selecionados.length >= 10} className={cn("flex min-h-14 w-full items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2 text-left", marcado && "border-primary bg-primary/5")}><span><span className="block text-sm font-medium">{cliente.nome}</span><span className="block text-xs text-muted-foreground">{cliente.whatsapp}</span></span><span className={cn("grid size-8 shrink-0 place-items-center rounded-full border", marcado && "border-primary bg-primary text-primary-foreground")}>{marcado ? <Check className="size-4" /> : <UserPlus className="size-4" />}<span className="sr-only">{marcado ? "Retirar" : "Adicionar"} {cliente.nome}</span></span></button>; })}</div>}
      {resultados.length === 0 && busca.length >= 2 && !pendente ? <p className="text-sm text-muted-foreground">Faça a busca para encontrar clientes que permitem mensagens.</p> : null}<Button type="button" onClick={confirmarListaManual} disabled={pendente || selecionados.length === 0} className="w-full sm:w-auto">Confirmar {selecionados.length || ""} {selecionados.length === 1 ? "cliente" : "clientes"}</Button>
    </section> : null}

    {mensagem && <Alert variant="destructive"><AlertTitle>Não foi possível montar a lista</AlertTitle><AlertDescription>{mensagem}</AlertDescription></Alert>}
    {pendente && <Alert><Users /><AlertTitle>Montando sua lista...</AlertTitle><AlertDescription>Estamos verificando quais clientes podem receber a mensagem.</AlertDescription></Alert>}
    {simulacao && !pendente && <section aria-live="polite" className="space-y-4">{clientesDaFila.length === 0 ? <Alert><Users /><AlertTitle>Nenhum cliente disponível agora</AlertTitle><AlertDescription>Tente escolher clientes pelo nome ou revise as permissões de WhatsApp nos cadastros.</AlertDescription></Alert> : <><div className="rounded-xl border border-primary/25 bg-primary/5 p-4 sm:p-5"><div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-[var(--marca-azul-profundo)]">Sua lista está pronta</p><Button type="button" size="sm" variant="ghost" onClick={() => setMostrarFormasEscolha(true)}>Alterar escolha</Button></div><div className="mt-2 flex items-end gap-2"><strong className="text-3xl tabular-nums text-[var(--marca-azul-profundo)]">{clientesDaFila.length}</strong><span className="pb-1 text-sm">{clientesDaFila.length === 1 ? "cliente escolhido" : "clientes escolhidos"}</span></div><p className="mt-2 text-sm text-muted-foreground">Nenhuma mensagem foi enviada. Você abrirá e confirmará uma cliente por vez.</p></div><div className="space-y-2" aria-label="Clientes escolhidos">{clientesDaFila.map((cliente, indice) => <article key={cliente.clienteId} className="flex items-center justify-between gap-3 rounded-xl border bg-card p-3 sm:p-4"><div className="flex min-w-0 items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{indice + 1}</span><div className="min-w-0"><h3 className="truncate text-sm font-semibold">{cliente.nome}</h3><p className="truncate text-xs text-muted-foreground">{cliente.whatsapp ?? "WhatsApp não informado"}</p></div></div><Button type="button" size="sm" variant="ghost" disabled={pendente} onClick={() => retirar(cliente.clienteId)} aria-label={`Retirar ${cliente.nome} da lista`}><X />Retirar</Button></article>)}</div><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-muted-foreground">A lista definitiva será criada somente depois da escolha da mensagem.</p><Button type="button" onClick={aoContinuar} className="w-full sm:w-auto">Escolher a mensagem<ArrowRight /></Button></div></>}</section>}
  </CardContent></Card>;
}
