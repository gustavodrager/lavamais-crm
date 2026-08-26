import Link from "next/link";
import { ArrowRight, Clock3, MapPin, Navigation, Plus, ReceiptText, Route, TriangleAlert } from "lucide-react";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ResumoMovimentacaoComercial, RoteiroDiario } from "@/contratos/apresentacao";
import type { ResumoMovimentacoesDoDia } from "@/lib/painel-inicial";
import { resumirRoteiroDoDia } from "@/lib/painel-inicial";

export function PainelOperador({ roteiro, resumoMovimentacoes }: { roteiro: RoteiroDiario | null; resumoMovimentacoes: ResumoMovimentacoesDoDia }) {
  const roteiroDisponivel = roteiro?.situacao === "EmPreparacao" ? null : roteiro;
  const resumoRoteiro = resumirRoteiroDoDia(roteiroDisponivel);
  const proxima = resumoRoteiro.proxima;
  const percentual = resumoRoteiro.total > 0 ? Math.round((resumoRoteiro.registradas / resumoRoteiro.total) * 100) : 0;
  const recentes = resumoMovimentacoes.registradas.slice(0, 2);

  return <>
    <CabecalhoPagina
      titulo="Atendimento de hoje"
      descricao="Veja a próxima parada e registre os atendimentos do dia."
      acao={<Button asChild><Link href="/movimentacoes"><Plus />Registrar movimentação</Link></Button>}
    />

    <div className="grid items-stretch gap-5 lg:grid-cols-[1.35fr_0.75fr]">
      <Card>
        {proxima ? <>
          <CardHeader>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary"><Navigation className="size-4" />Próxima parada · {proxima.ordem} de {resumoRoteiro.total}</div>
            <CardTitle><h2>{proxima.nomeCliente}</h2></CardTitle>
            <CardDescription className="flex flex-wrap gap-x-4 gap-y-2"><span className="flex items-center gap-1.5"><Route className="size-3.5" />{proxima.tipo}</span><span className="flex items-center gap-1.5"><Clock3 className="size-3.5" />{proxima.periodo}</span></CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="flex items-start gap-2 text-sm text-muted-foreground"><MapPin className="mt-0.5 size-4 shrink-0" />{proxima.enderecoCompleto}</p>
            <Button asChild className="w-full sm:w-auto"><Link href="/meu-roteiro">Abrir próxima parada<ArrowRight /></Link></Button>
          </CardContent>
        </> : <>
          <CardHeader><div className="flex items-center gap-2 text-xs font-semibold text-primary"><Route className="size-4" />Roteiro de hoje</div><CardTitle><h2>{roteiroDisponivel ? "Roteiro encerrado" : "Roteiro ainda não publicado"}</h2></CardTitle><CardDescription>{roteiroDisponivel ? "Todas as paradas de hoje já foram registradas." : "A recepção ainda está preparando a sequência de hoje."}</CardDescription></CardHeader>
          <CardContent><Button asChild variant="outline"><Link href="/meu-roteiro">Consultar roteiro<ArrowRight /></Link></Button></CardContent>
        </>}
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3"><span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary"><Route className="size-4" /></span><Badge variant="secondary">{roteiroDisponivel ? rotulosSituacao[roteiroDisponivel.situacao] : "Aguardando"}</Badge></div>
          <CardTitle><h2>Roteiro de hoje</h2></CardTitle>
          <CardDescription><strong className="text-2xl text-[var(--marca-azul-profundo)]">{resumoRoteiro.registradas}</strong> de {resumoRoteiro.total} paradas registradas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-2 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-label={`Progresso do roteiro: ${percentual}%`} aria-valuenow={percentual} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full bg-primary" style={{ width: `${percentual}%` }} /></div>
          <dl className="grid grid-cols-3 gap-2 border-t pt-3 text-center"><div><dt className="text-xs text-muted-foreground">Pendentes</dt><dd className="mt-1 font-semibold tabular-nums">{resumoRoteiro.pendentes}</dd></div><div><dt className="text-xs text-muted-foreground">A caminho</dt><dd className="mt-1 font-semibold tabular-nums">{resumoRoteiro.emDeslocamento}</dd></div><div><dt className="text-xs text-muted-foreground">Não realizadas</dt><dd className="mt-1 font-semibold tabular-nums">{resumoRoteiro.naoRealizadas}</dd></div></dl>
        </CardContent>
      </Card>
    </div>

    <div className="mt-5 grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><ReceiptText className="size-5" /></span><div><p className="text-2xl font-bold tabular-nums text-[var(--marca-azul-profundo)]">{resumoMovimentacoes.quantidadeRegistradas}</p><p className="mt-1 text-sm text-muted-foreground">Movimentações registradas hoje</p></div></div>
          <dl className="grid grid-cols-2 gap-3 border-t pt-3"><div><dt className="text-xs text-muted-foreground">Clientes</dt><dd className="mt-1 text-sm font-semibold tabular-nums">{resumoMovimentacoes.clientesUnicos}</dd></div><div><dt className="text-xs text-muted-foreground">Valor informado</dt><dd className="mt-1 text-sm font-semibold tabular-nums">{moeda.format(resumoMovimentacoes.valorInformado)}</dd></div></dl>
          {resumoMovimentacoes.quantidadeCanceladas > 0 ? <p className="flex items-center gap-2 text-xs text-destructive"><TriangleAlert className="size-3.5" />{resumoMovimentacoes.quantidadeCanceladas === 1 ? "1 registro cancelado" : `${resumoMovimentacoes.quantidadeCanceladas} registros cancelados`}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle><h2>Registros de hoje</h2></CardTitle><CardDescription>Últimas movimentações comerciais registradas.</CardDescription></div><Button asChild size="sm" variant="ghost"><Link href="/movimentacoes">Ver todos<ArrowRight /></Link></Button></div></CardHeader>
        <CardContent>
          {recentes.length > 0 ? <div className="divide-y">{recentes.map((movimentacao) => <article key={movimentacao.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"><div className="min-w-0"><h3 className="truncate text-sm font-semibold">{formatarNome(movimentacao.nomeCliente)}</h3><p className="mt-1 truncate text-xs text-muted-foreground">{resumirLinhas(movimentacao.linhas)}</p></div><strong className="shrink-0 text-sm tabular-nums text-[var(--marca-azul-profundo)]">{moeda.format(movimentacao.valorTotal)}</strong></article>)}</div> : <p className="py-4 text-sm text-muted-foreground">Nenhuma movimentação foi registrada hoje.</p>}
        </CardContent>
      </Card>
    </div>
  </>;
}

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const rotulosSituacao = { EmPreparacao: "Em preparação", Publicado: "Publicado", EmAndamento: "Em andamento", Finalizado: "Finalizado" };
function formatarNome(valor: string) { return valor === valor.toLocaleUpperCase("pt-BR") ? valor.toLocaleLowerCase("pt-BR").replace(/(^|[\s'-])\p{L}/gu, (letra) => letra.toLocaleUpperCase("pt-BR")) : valor; }
function resumirLinhas(linhas: ResumoMovimentacaoComercial["linhas"]) { return linhas.length ? linhas.map((linha) => `${linha.quantidade}× ${linha.nomeArtigo} · ${linha.nomeServico}`).join("; ") : "Registro comercial"; }
