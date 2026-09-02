import type { DetalheAcaoComercial } from "@/contratos/apresentacao";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const percentual = (parte: number, total: number) => total > 0 ? Math.min(100, Math.round((parte / total) * 100)) : 0;
const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function ResumoAcao({ acao }: { acao: DetalheAcaoComercial }) {
  const finalizados = acao.totais.enviados;
  const progresso = percentual(finalizados, acao.totais.destinatarios);
  const conversao = percentual(acao.totais.convertidos, acao.totais.destinatarios);
  return <section aria-label="Indicadores da ação" className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Destinatários</CardTitle></CardHeader><CardContent className="text-2xl font-semibold tabular-nums">{acao.totais.destinatarios}</CardContent></Card>
      <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Envios confirmados</CardTitle><CardDescription>{progresso}% da audiência</CardDescription></CardHeader><CardContent className="text-2xl font-semibold tabular-nums">{finalizados}</CardContent></Card>
      <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Conversões</CardTitle><CardDescription>{conversao}% da audiência</CardDescription></CardHeader><CardContent className="text-2xl font-semibold tabular-nums">{acao.totais.convertidos}</CardContent></Card>
      <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Valor convertido</CardTitle></CardHeader><CardContent className="text-2xl font-semibold tabular-nums">{moeda.format(acao.totais.valorConvertido)}</CardContent></Card>
    </div>
    <div className="grid gap-4 lg:grid-cols-2">
      <Card><CardHeader><CardTitle>Envios confirmados</CardTitle><CardDescription>{finalizados} de {acao.totais.destinatarios} mensagens foram confirmadas pela equipe depois do envio no WhatsApp.</CardDescription></CardHeader><CardContent className="space-y-4"><progress className="h-2 w-full accent-primary" max={100} value={progresso} aria-label={`Envios confirmados: ${progresso}%`} /><dl className="grid grid-cols-2 gap-3 text-sm">{[["Pendentes", acao.totais.pendentes], ["Enviados", acao.totais.enviados]].map(([rotulo, valor]) => <div key={rotulo}><dt className="text-xs text-muted-foreground">{rotulo}</dt><dd className="font-semibold tabular-nums">{valor}</dd></div>)}</dl></CardContent></Card>
      <Card><CardHeader><CardTitle>Resultados comerciais</CardTitle><CardDescription>Registro manual feito depois que a equipe confirma o envio.</CardDescription></CardHeader><CardContent><dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">{[["Não informados", acao.totais.naoInformados], ["Sem retorno", acao.totais.semRetorno], ["Responderam", acao.totais.responderam], ["Interessados", acao.totais.interessados], ["Convertidos", acao.totais.convertidos], ["Sem interesse", acao.totais.semInteresse]].map(([rotulo, valor]) => <div key={rotulo}><dt className="text-xs text-muted-foreground">{rotulo}</dt><dd className="font-semibold tabular-nums">{valor}</dd></div>)}</dl></CardContent></Card>
    </div>
  </section>;
}
