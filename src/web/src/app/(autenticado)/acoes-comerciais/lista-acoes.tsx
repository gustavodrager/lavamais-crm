"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import type { ResumoAcaoComercial, SituacaoAcaoComercial } from "@/contratos/apresentacao";
import { SituacaoAcao } from "@/components/situacao-acao";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { rotuloProximaAcao } from "@/lib/acoes-comerciais";
import { cn } from "@/lib/utils";

const filtros: Array<{ rotulo: string; valor: "Todas" | SituacaoAcaoComercial | "Falhas" }> = [
  { rotulo: "Todas", valor: "Todas" }, { rotulo: "Rascunhos", valor: "Rascunho" }, { rotulo: "Preparadas", valor: "Preparada" }, { rotulo: "Em andamento", valor: "EmProcessamento" }, { rotulo: "Com falhas", valor: "Falhas" }, { rotulo: "Concluídas", valor: "Concluida" },
];

export function ListaAcoes({ acoes }: { acoes: ResumoAcaoComercial[] }) {
  const [filtro, setFiltro] = useState<(typeof filtros)[number]["valor"]>("Todas");
  const [busca, setBusca] = useState("");
  const termo = busca.trim().toLocaleLowerCase("pt-BR");
  const visiveis = acoes.filter((acao) => (filtro === "Todas" || acao.situacao === filtro || (filtro === "Concluida" && acao.situacao === "ConcluidaComFalhas") || (filtro === "Falhas" && acao.situacao === "ConcluidaComFalhas")) && (!termo || `${acao.nome} ${acao.objetivo ?? ""}`.toLocaleLowerCase("pt-BR").includes(termo)));
  return <div className="space-y-4">
    <div className="relative max-w-xl"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input value={busca} onChange={(evento) => setBusca(evento.target.value)} className="h-11 pl-9" placeholder="Buscar ação por nome ou objetivo" aria-label="Buscar ações" /></div>
    <div className="flex gap-2 overflow-x-auto rounded-xl border bg-secondary/70 p-2 sm:flex-wrap sm:p-3" aria-label="Filtrar ações por situação">
      {filtros.map((item) => <Button key={item.valor} type="button" size="sm" className="min-h-11" variant={filtro === item.valor ? "default" : "ghost"} aria-pressed={filtro === item.valor} onClick={() => setFiltro(item.valor)}>{item.rotulo}</Button>)}
    </div>
    {visiveis.length === 0 ? <Card><p className="p-8 text-center text-sm text-muted-foreground">Nenhuma ação corresponde à busca ou ao filtro.</p></Card> : <><div className="grid gap-2 md:hidden">{visiveis.map((acao) => <Link key={acao.id} href={`/acoes-comerciais/${acao.id}`} aria-label={`${rotuloProximaAcao(acao.situacao)}: ${acao.nome}`} className={cn("rounded-xl border bg-card p-4 transition-colors active:bg-secondary/60", acao.situacao === "Rascunho" && "bg-secondary/25")}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-semibold text-[var(--marca-azul-profundo)]">{acao.nome}</p><p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{acao.objetivo ?? "Sem objetivo informado"}</p></div><SituacaoAcao situacao={acao.situacao} /></div><div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground"><span>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(acao.dataAtualizacao))}</span><span className="flex items-center gap-1 font-medium text-primary">{rotuloProximaAcao(acao.situacao)}<ArrowRight className="size-3.5" /></span></div></Link>)}</div><Card className="hidden md:flex"><CardContent className="w-full p-0"><Table><TableHeader><TableRow><TableHead>Ação</TableHead><TableHead>Atualização</TableHead><TableHead>Situação</TableHead><TableHead className="text-right">Destinatários</TableHead><TableHead><span className="sr-only">Próxima ação</span></TableHead></TableRow></TableHeader><TableBody>{visiveis.map((acao) => <TableRow key={acao.id} className={cn(acao.situacao === "Rascunho" && "bg-secondary/25")}><TableCell><Link className="font-semibold text-[var(--marca-azul-profundo)] hover:underline" href={`/acoes-comerciais/${acao.id}`}>{acao.nome}</Link><span className="mt-1 block max-w-md text-xs text-muted-foreground">{acao.objetivo ?? "Sem objetivo informado"}</span></TableCell><TableCell className="text-muted-foreground">{new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(acao.dataAtualizacao))}</TableCell><TableCell><SituacaoAcao situacao={acao.situacao} /></TableCell><TableCell className="text-right tabular-nums">{acao.totalDestinatarios ?? "—"}</TableCell><TableCell className="text-right"><Button asChild size="sm" variant="ghost"><Link href={`/acoes-comerciais/${acao.id}`}>{rotuloProximaAcao(acao.situacao)}<ArrowRight /></Link></Button></TableCell></TableRow>)}</TableBody></Table></CardContent></Card></>}
  </div>;
}
