"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { ResumoAcaoComercial, SituacaoAcaoComercial } from "@/contratos/apresentacao";
import { SituacaoAcao } from "@/components/situacao-acao";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const filtros: Array<{ rotulo: string; valor: "Todas" | SituacaoAcaoComercial }> = [
  { rotulo: "Todas", valor: "Todas" }, { rotulo: "Rascunhos", valor: "Rascunho" }, { rotulo: "Preparadas", valor: "Preparada" }, { rotulo: "Em andamento", valor: "EmProcessamento" }, { rotulo: "Concluídas", valor: "Concluida" },
];

const proximaAcao = (situacao: SituacaoAcaoComercial) => situacao === "Rascunho" ? "Continuar configuração" : situacao === "Preparada" ? "Revisar mensagens" : situacao === "EmProcessamento" ? "Acompanhar envios" : "Ver resultados";

export function ListaAcoes({ acoes }: { acoes: ResumoAcaoComercial[] }) {
  const [filtro, setFiltro] = useState<(typeof filtros)[number]["valor"]>("Todas");
  const visiveis = filtro === "Todas" ? acoes : acoes.filter((acao) => acao.situacao === filtro || (filtro === "Concluida" && acao.situacao === "ConcluidaComFalhas"));
  return <div className="space-y-4">
    <div className="flex flex-wrap gap-2 rounded-xl border bg-secondary/70 p-3" aria-label="Filtrar ações por situação">
      {filtros.map((item) => <Button key={item.valor} type="button" size="sm" variant={filtro === item.valor ? "default" : "ghost"} aria-pressed={filtro === item.valor} onClick={() => setFiltro(item.valor)}>{item.rotulo}</Button>)}
    </div>
    <Card><CardContent className="p-0">
      {visiveis.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">Nenhuma ação corresponde ao filtro selecionado.</p> : <Table><TableHeader><TableRow><TableHead>Ação</TableHead><TableHead className="hidden md:table-cell">Atualização</TableHead><TableHead>Situação</TableHead><TableHead className="hidden text-right sm:table-cell">Destinatários</TableHead><TableHead><span className="sr-only">Próxima ação</span></TableHead></TableRow></TableHeader><TableBody>{visiveis.map((acao) => <TableRow key={acao.id} className={cn(acao.situacao === "Rascunho" && "bg-secondary/25")}><TableCell><Link className="font-semibold text-[var(--marca-azul-profundo)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href={`/acoes-comerciais/${acao.id}`}>{acao.nome}</Link><span className="mt-1 block text-xs text-muted-foreground">{acao.objetivo ?? "Sem objetivo informado"}</span></TableCell><TableCell className="hidden text-muted-foreground md:table-cell">{new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(acao.dataAtualizacao))}</TableCell><TableCell><SituacaoAcao situacao={acao.situacao} /></TableCell><TableCell className="hidden text-right tabular-nums sm:table-cell">{acao.totalDestinatarios ?? "—"}</TableCell><TableCell className="text-right"><Button asChild size="sm" variant="ghost"><Link href={`/acoes-comerciais/${acao.id}`}>{proximaAcao(acao.situacao)}<ArrowRight aria-hidden="true" /></Link></Button></TableCell></TableRow>)}</TableBody></Table>}
    </CardContent></Card>
  </div>;
}
