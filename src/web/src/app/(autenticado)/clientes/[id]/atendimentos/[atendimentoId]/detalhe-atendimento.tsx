import Link from "next/link";
import { AlertTriangle, CalendarClock, CircleDollarSign, ExternalLink, ReceiptText } from "lucide-react";
import type { DetalheMovimentacaoComercial } from "@/contratos/apresentacao";
import { CancelarMovimentacao } from "@/app/(autenticado)/movimentacoes/cancelar-movimentacao";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function DetalheAtendimento({ atendimento, podeCancelar }: { atendimento: DetalheMovimentacaoComercial; podeCancelar: boolean }) {
  const cancelado = atendimento.situacao === "Cancelada";
  const descricao = resumirLinhas(atendimento);
  return (
    <div className="space-y-5">
      {cancelado ? (
        <Alert variant="destructive">
          <AlertTriangle aria-hidden="true" />
          <AlertTitle>Atendimento cancelado</AlertTitle>
          <AlertDescription>
            <p>{atendimento.motivoCancelamento || "Motivo não informado."}</p>
            {atendimento.dataCancelamento ? <p className="mt-1 text-xs">Cancelado em {formatarDataHora(atendimento.dataCancelamento)}.</p> : null}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card>
          <CardHeader><CardTitle>Itens e serviços</CardTitle></CardHeader>
          <CardContent className="p-0">
            {atendimento.linhas.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">A composição deste atendimento anterior não está disponível.</p>
            ) : (
              <>
                <div className="divide-y md:hidden">
                  {atendimento.linhas.map((linha) => (
                    <article key={linha.id} className="space-y-3 p-4">
                      <div><p className="font-medium">{linha.nomeArtigo}</p><p className="text-sm text-muted-foreground">{linha.nomeServico}</p></div>
                      <dl className="grid grid-cols-2 gap-3 text-sm">
                        <div><dt className="text-xs text-muted-foreground">Quantidade</dt><dd className="font-medium">{linha.quantidade}</dd></div>
                        <div className="text-right"><dt className="text-xs text-muted-foreground">Preço unitário</dt><dd className="font-medium">{moeda.format(linha.precoUnitario)}</dd></div>
                      </dl>
                      <p className="text-right font-semibold tabular-nums">{moeda.format(linha.subtotal)}</p>
                    </article>
                  ))}
                </div>
                <div className="hidden md:block">
                  <Table>
                    <TableHeader><TableRow><TableHead>Artigo</TableHead><TableHead>Serviço</TableHead><TableHead className="text-right">Qtd.</TableHead><TableHead className="text-right">Preço unitário</TableHead><TableHead className="text-right">Subtotal</TableHead></TableRow></TableHeader>
                    <TableBody>{atendimento.linhas.map((linha) => <TableRow key={linha.id}><TableCell className="font-medium">{linha.nomeArtigo}</TableCell><TableCell>{linha.nomeServico}</TableCell><TableCell className="text-right tabular-nums">{linha.quantidade}</TableCell><TableCell className="text-right tabular-nums">{moeda.format(linha.precoUnitario)}</TableCell><TableCell className="text-right font-medium tabular-nums">{moeda.format(linha.subtotal)}</TableCell></TableRow>)}</TableBody>
                  </Table>
                </div>
                <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-4"><span className="font-medium">Total informado</span><strong className="text-lg tabular-nums">{moeda.format(atendimento.valorTotal)}</strong></div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader><CardTitle>Resumo</CardTitle></CardHeader>
            <CardContent><dl className="space-y-4 text-sm">
              <ItemResumo icone={CalendarClock} rotulo="Data do atendimento" valor={formatarDataHora(atendimento.dataMovimentacao)} />
              <ItemResumo icone={CircleDollarSign} rotulo="Total informado" valor={moeda.format(atendimento.valorTotal)} />
              <ItemResumo icone={ReceiptText} rotulo="Origem" valor={rotuloOrigem(atendimento.origem)} />
              {atendimento.codigoExterno ? <div><dt className="text-xs text-muted-foreground">Código externo</dt><dd className="mt-1 break-all font-medium">{atendimento.codigoExterno}</dd></div> : null}
            </dl></CardContent>
          </Card>
          {atendimento.observacao ? <Card><CardHeader><CardTitle>Observação</CardTitle></CardHeader><CardContent><p className="whitespace-pre-wrap text-sm leading-6">{atendimento.observacao}</p></CardContent></Card> : null}
          {!cancelado && podeCancelar ? <Card><CardHeader><CardTitle>Ações</CardTitle></CardHeader><CardContent><CancelarMovimentacao id={atendimento.id} versao={atendimento.versao} nomeCliente={atendimento.nomeCliente} descricao={descricao} /></CardContent></Card> : null}
        </div>
      </div>

      <Alert>
        <ReceiptText aria-hidden="true" />
        <AlertTitle>Registro comercial informativo</AlertTitle>
        <AlertDescription>Este atendimento compõe o histórico do CRM e não representa pedido operacional, pagamento, caixa, produção ou documento fiscal.</AlertDescription>
      </Alert>
    </div>
  );
}

function ItemResumo({ icone: Icone, rotulo, valor }: { icone: typeof CalendarClock; rotulo: string; valor: string }) {
  return <div className="flex gap-3"><Icone className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" /><div><dt className="text-xs text-muted-foreground">{rotulo}</dt><dd className="mt-1 font-medium">{valor}</dd></div></div>;
}

export function LinkDoCliente({ clienteId, nomeCliente }: { clienteId: string; nomeCliente: string }) {
  return <Button asChild variant="outline" size="sm"><Link href={`/clientes/${clienteId}`}><ExternalLink aria-hidden="true" />Abrir cadastro de {nomeCliente}</Link></Button>;
}

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const formatarDataHora = (valor: string) => new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "long", timeStyle: "short" }).format(new Date(valor));
const rotuloOrigem = (origem: DetalheMovimentacaoComercial["origem"]) => origem === "Recepcao" ? "Recepção" : origem === "ImportacaoEssence" ? "Importação Essence" : "Integração Essence";
const resumirLinhas = (item: DetalheMovimentacaoComercial) => item.linhas.length ? item.linhas.map((linha) => `${linha.quantidade}× ${linha.nomeArtigo} · ${linha.nomeServico}`).join("; ") : "Atendimento anterior";
