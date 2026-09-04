import Link from "next/link";
import { CalendarClock, CircleDollarSign, ReceiptText, Sparkles } from "lucide-react";
import type { ResumoMovimentacaoComercial } from "@/contratos/apresentacao";
import { CancelarMovimentacao } from "@/app/(autenticado)/movimentacoes/cancelar-movimentacao";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function HistoricoComercial({
  movimentacoes,
  podeCancelar,
  modoOperador = false,
}: {
  movimentacoes: ResumoMovimentacaoComercial[];
  podeCancelar: boolean;
  modoOperador?: boolean;
}) {
  const ordenadas = [...movimentacoes].sort((a, b) => new Date(b.dataMovimentacao).getTime() - new Date(a.dataMovimentacao).getTime());
  const validas = ordenadas.filter((item) => item.situacao === "Registrada");
  const total = validas.reduce((soma, item) => soma + item.valorTotal, 0);
  const ticketMedio = validas.length ? total / validas.length : 0;
  const ultima = validas.reduce<ResumoMovimentacaoComercial | null>(
    (atual, item) => !atual || new Date(item.dataMovimentacao) > new Date(atual.dataMovimentacao) ? item : atual,
    null,
  );
  const servicos = new Set(validas.flatMap((item) => item.linhas.map((linha) => linha.servicoDeLavanderiaId))).size;

  return (
    <section id="historico-atendimentos" aria-labelledby="titulo-historico" className="scroll-mt-24 space-y-5">
      <div>
        <h2 id="titulo-historico" className="font-heading text-xl font-semibold">Histórico de atendimentos</h2>
        <p className="text-sm text-muted-foreground">Atendimentos registrados pelo CRM para este cliente.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {!modoOperador ? <Indicador icone={CircleDollarSign} titulo="Total informado" valor={moeda.format(total)} /> : null}
        <Indicador icone={ReceiptText} titulo="Atendimentos" valor={String(validas.length)} />
        {!modoOperador ? <Indicador icone={Sparkles} titulo="Média informada" valor={moeda.format(ticketMedio)} /> : null}
        <Indicador
          icone={CalendarClock}
          titulo="Último atendimento"
          valor={ultima ? formatarData(ultima.dataMovimentacao) : "Nenhum"}
          complemento={servicos ? `${servicos} ${servicos === 1 ? "serviço" : "serviços"}` : undefined}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Atendimentos do cliente</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {ordenadas.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">Ainda não há atendimentos registrados para este cliente.</p>
          ) : (
            <>
              <div className="divide-y md:hidden">
                {ordenadas.map((item) => {
                  const descricao = resumirLinhas(item);
                  return (
                    <article key={item.id} className="relative space-y-3 p-4 transition-colors hover:bg-muted/30">
                      <Link href={`/clientes/${item.clienteId}/atendimentos/${item.id}`} className="absolute inset-0 rounded-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/50" aria-label={`Ver detalhes do atendimento de ${formatarData(item.dataMovimentacao)}`} />
                      <div className="pointer-events-none relative flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{descricao}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{formatarData(item.dataMovimentacao)}</p>
                        </div>
                        <Badge variant={item.situacao === "Registrada" ? "secondary" : "destructive"}>
                          {item.situacao === "Registrada" ? "Registrado" : "Cancelado"}
                        </Badge>
                      </div>
                      {item.observacao ? <p className="pointer-events-none relative text-sm text-muted-foreground">{item.observacao}</p> : null}
                      <div className="pointer-events-none relative flex items-center justify-between gap-3">
                        <strong className="text-sm tabular-nums">{moeda.format(item.valorTotal)}</strong>
                        {podeCancelar && item.situacao === "Registrada" ? (
                          <span className="pointer-events-auto relative z-10"><CancelarMovimentacao id={item.id} versao={item.versao} nomeCliente={item.nomeCliente} descricao={descricao} /></span>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Artigos e serviços</TableHead>
                      <TableHead>Situação</TableHead>
                      <TableHead>Observação</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      {podeCancelar ? <TableHead><span className="sr-only">Ações</span></TableHead> : null}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordenadas.map((item) => {
                      const descricao = resumirLinhas(item);
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="whitespace-nowrap">{formatarData(item.dataMovimentacao)}</TableCell>
                          <TableCell className="font-medium"><Link href={`/clientes/${item.clienteId}/atendimentos/${item.id}`} className="block rounded-sm py-2 text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">{descricao}</Link></TableCell>
                          <TableCell>
                            <Badge variant={item.situacao === "Registrada" ? "secondary" : "destructive"}>
                              {item.situacao === "Registrada" ? "Registrado" : "Cancelado"}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-72 truncate text-muted-foreground">{item.observacao || "—"}</TableCell>
                          <TableCell className="text-right font-medium">{moeda.format(item.valorTotal)}</TableCell>
                          {podeCancelar ? (
                            <TableCell>
                              {item.situacao === "Registrada" ? (
                                <CancelarMovimentacao id={item.id} versao={item.versao} nomeCliente={item.nomeCliente} descricao={descricao} />
                              ) : null}
                            </TableCell>
                          ) : null}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function Indicador({
  icone: Icone,
  titulo,
  valor,
  complemento,
}: {
  icone: typeof CircleDollarSign;
  titulo: string;
  valor: string;
  complemento?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icone className="size-4" aria-hidden="true" />
        </div>
        <p className="text-xs font-medium text-muted-foreground">{titulo}</p>
        <p className="mt-1 text-xl font-semibold tabular-nums">{valor}</p>
        {complemento ? <p className="mt-1 text-xs text-muted-foreground">{complemento}</p> : null}
      </CardContent>
    </Card>
  );
}

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const formatarData = (valor: string) => new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  dateStyle: "short",
}).format(new Date(valor));

function resumirLinhas(item: ResumoMovimentacaoComercial) {
  return item.linhas.length
    ? item.linhas.map((linha) => `${linha.quantidade}× ${linha.nomeArtigo} · ${linha.nomeServico}`).join("; ")
    : "Atendimento anterior";
}
