import { CalendarClock, CircleDollarSign, ReceiptText, Sparkles } from "lucide-react";
import type { ResumoMovimentacaoComercial } from "@/contratos/apresentacao";
import { CancelarMovimentacao } from "@/app/(autenticado)/movimentacoes/cancelar-movimentacao";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function HistoricoComercial({ movimentacoes, podeCancelar }: { movimentacoes: ResumoMovimentacaoComercial[]; podeCancelar: boolean }) {
  const ordenadas = [...movimentacoes].sort((a, b) => new Date(b.dataMovimentacao).getTime() - new Date(a.dataMovimentacao).getTime());
  const validas = ordenadas.filter((item) => item.situacao === "Registrada");
  const total = validas.reduce((soma, item) => soma + item.valorTotal, 0);
  const ticketMedio = validas.length ? total / validas.length : 0;
  const ultima = validas.reduce<ResumoMovimentacaoComercial | null>((atual, item) => !atual || new Date(item.dataMovimentacao) > new Date(atual.dataMovimentacao) ? item : atual, null);
  const servicos = new Set(validas.flatMap((item) => item.linhas.map((linha) => linha.servicoDeLavanderiaId))).size;

  return <section aria-labelledby="titulo-historico" className="space-y-5">
    <div><h2 id="titulo-historico" className="font-heading text-xl font-semibold">Histórico comercial</h2><p className="text-sm text-muted-foreground">Movimentações registradas pelo CRM para este cliente.</p></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Indicador icone={CircleDollarSign} titulo="Total movimentado" valor={moeda.format(total)} />
      <Indicador icone={ReceiptText} titulo="Movimentações" valor={String(validas.length)} />
      <Indicador icone={Sparkles} titulo="Ticket médio" valor={moeda.format(ticketMedio)} />
      <Indicador icone={CalendarClock} titulo="Última movimentação" valor={ultima ? formatarData(ultima.dataMovimentacao) : "Nenhuma"} complemento={servicos ? `${servicos} ${servicos === 1 ? "serviço" : "serviços"}` : undefined} />
    </div>
    <Card><CardHeader><CardTitle>Movimentações do cliente</CardTitle></CardHeader><CardContent className="p-0">{ordenadas.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">Ainda não há movimentações para este cliente.</p> : <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Artigos e serviços</TableHead><TableHead>Situação</TableHead><TableHead>Observação</TableHead><TableHead className="text-right">Valor</TableHead>{podeCancelar && <TableHead><span className="sr-only">Ações</span></TableHead>}</TableRow></TableHeader><TableBody>{ordenadas.map((item) => <TableRow key={item.id} className={item.situacao === "Cancelada" ? "opacity-60" : undefined}><TableCell className="whitespace-nowrap">{formatarData(item.dataMovimentacao)}</TableCell><TableCell className="font-medium">{item.linhas.length ? item.linhas.map((linha) => `${linha.quantidade}× ${linha.nomeArtigo} · ${linha.nomeServico}`).join("; ") : "Registro legado"}</TableCell><TableCell><Badge variant={item.situacao === "Registrada" ? "secondary" : "destructive"}>{item.situacao === "Registrada" ? "Registrada" : "Cancelada"}</Badge></TableCell><TableCell className="max-w-72 truncate text-muted-foreground">{item.observacao || "—"}</TableCell><TableCell className="text-right font-medium">{moeda.format(item.valorTotal)}</TableCell>{podeCancelar && <TableCell>{item.situacao === "Registrada" && <CancelarMovimentacao id={item.id} versao={item.versao} />}</TableCell>}</TableRow>)}</TableBody></Table></div>}</CardContent></Card>
  </section>;
}

function Indicador({ icone: Icone, titulo, valor, complemento }: { icone: typeof CircleDollarSign; titulo: string; valor: string; complemento?: string }) {
  return <Card><CardContent className="p-4"><div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icone className="size-4" aria-hidden="true" /></div><p className="text-xs font-medium text-muted-foreground">{titulo}</p><p className="mt-1 text-xl font-semibold tabular-nums">{valor}</p>{complemento && <p className="mt-1 text-xs text-muted-foreground">{complemento}</p>}</CardContent></Card>;
}

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const formatarData = (valor: string) => new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short" }).format(new Date(valor));
