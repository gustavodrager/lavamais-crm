import Link from "next/link";
import { MapPin, MessageCircle, Navigation, Phone } from "lucide-react";
import { atualizarParada, naoRealizarParada } from "../roteiros/acoes";
import { NavegacaoRoteiro } from "../roteiros/navegacao-roteiro";
import { ConfirmarConclusao } from "./confirmar-conclusao";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";

export default async function MeuRoteiro({ searchParams }: { searchParams: Promise<{ data?: string; erro?: string }> }) {
  const p = await searchParams;
  const data = p.data || hoje();
  const roteiro = await obterPortaCrmApi().obterRoteiro(data);

  if (!roteiro || roteiro.situacao === "EmPreparacao") {
    return <div className="mx-auto max-w-lg space-y-4 pb-10"><NavegacaoRoteiro modo="executar" data={data} /><Card><CardContent className="p-8 text-center"><MapPin className="mx-auto mb-3 text-muted-foreground" /><h1 className="font-heading text-2xl font-semibold">Roteiro ainda não publicado</h1><p className="mt-2 text-sm text-muted-foreground">A sequência de {formatarData(data)} ainda está sendo organizada.</p><Button asChild variant="outline" className="mt-5"><Link href={`/roteiros?data=${data}`}>Organizar roteiro</Link></Button></CardContent></Card></div>;
  }

  const ordenadas = [...roteiro.paradas].sort((a, b) => a.ordem - b.ordem);
  const disponiveis = ordenadas.filter(x => x.situacao === "Pendente" || x.situacao === "EmDeslocamento");
  const proxima = disponiveis.find(x => x.situacao === "EmDeslocamento") ?? disponiveis.find(x => x.situacao === "Pendente");
  const pendentes = disponiveis.filter(x => x.situacao === "Pendente").length;
  const concluidas = roteiro.paradas.filter(x => x.situacao === "Concluida").length;
  const falhas = roteiro.paradas.filter(x => x.situacao === "NaoRealizada").length;
  const percentual = roteiro.paradas.length ? Math.round((concluidas + falhas) / roteiro.paradas.length * 100) : 0;

  return <div className="mx-auto max-w-lg space-y-4 pb-10">
    <NavegacaoRoteiro modo="executar" data={data} />
    <div className="rounded-lg bg-primary p-5 text-primary-foreground"><p className="text-sm opacity-80">{roteiro.nomeMotorista}</p><h1 className="mt-1 font-heading text-2xl font-semibold">Roteiro em execução</h1><p className="mt-2 text-sm">{formatarData(data)} · {concluidas} concluídas · {falhas} não realizadas</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-primary-foreground/20" role="progressbar" aria-label={`Progresso do roteiro: ${percentual}%`} aria-valuenow={percentual} aria-valuemin={0} aria-valuemax={100}><div className="h-full bg-primary-foreground" style={{ width: `${percentual}%` }} /></div></div>
    {p.erro && <Alert variant="destructive"><AlertTitle>Não foi possível atualizar a parada</AlertTitle><AlertDescription>{p.erro}</AlertDescription></Alert>}
    {proxima ? <Card><CardContent className="space-y-4 p-5">
      <div><div className="flex flex-wrap items-center gap-2"><Badge>{proxima.tipo}</Badge><Badge variant={proxima.situacao === "EmDeslocamento" ? "default" : "secondary"}>{rotuloParada(proxima.situacao)}</Badge><span className="text-sm text-muted-foreground">{proxima.periodo}</span></div><h2 className="mt-3 font-heading text-2xl font-semibold">{proxima.nomeCliente}</h2><p className="mt-1 text-sm text-muted-foreground">{proxima.enderecoCompleto}</p>{proxima.observacao && <p className="mt-3 rounded-lg bg-secondary p-3 text-sm">{proxima.observacao}</p>}</div>
      <div className="grid gap-2"><Button asChild className="h-12"><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(proxima.enderecoCompleto)}`} target="_blank" rel="noreferrer"><Navigation />Abrir no mapa</a></Button><div className="grid grid-cols-2 gap-2"><Button asChild variant="outline"><a href={`tel:+${proxima.whatsapp}`}><Phone />Ligar</a></Button><Button asChild variant="outline"><a href={`https://wa.me/${proxima.whatsapp}`} target="_blank" rel="noreferrer"><MessageCircle />WhatsApp</a></Button></div>
        {proxima.situacao === "Pendente" && <form action={atualizarParada}><input type="hidden" name="paradaId" value={proxima.id} /><input type="hidden" name="data" value={data} /><input type="hidden" name="versao" value={roteiro.versao} /><input type="hidden" name="acao" value="iniciar" /><Button variant="outline" className="w-full">Iniciar deslocamento</Button></form>}
        <ConfirmarConclusao paradaId={proxima.id} data={data} versao={roteiro.versao} nomeCliente={proxima.nomeCliente} />
        {proxima.situacao === "Pendente" && pendentes > 1 && <form action={atualizarParada}><input type="hidden" name="paradaId" value={proxima.id} /><input type="hidden" name="data" value={data} /><input type="hidden" name="versao" value={roteiro.versao} /><input type="hidden" name="acao" value="adiar" /><Button variant="outline" className="w-full">Deixar para depois</Button></form>}
        <details className="rounded-lg border p-3"><summary className="cursor-pointer text-sm font-medium">Não foi possível realizar</summary><form action={naoRealizarParada} className="mt-3 flex flex-col gap-2 sm:flex-row"><input type="hidden" name="paradaId" value={proxima.id} /><input type="hidden" name="data" value={data} /><input type="hidden" name="versao" value={roteiro.versao} /><Input name="motivo" placeholder="Informe o motivo" required minLength={3} /><Button variant="destructive">Registrar</Button></form></details>
      </div>
    </CardContent></Card> : <Card><CardContent className="p-8 text-center"><h2 className="font-heading text-xl font-semibold">Roteiro encerrado</h2><p className="mt-2 text-sm text-muted-foreground">{falhas > 0 ? `Todas as paradas foram registradas; ${falhas} precisam de reagendamento.` : "Todas as paradas foram concluídas."}</p></CardContent></Card>}
    <section aria-labelledby="sequencia-roteiro"><h2 id="sequencia-roteiro" className="mb-2 font-heading text-lg font-semibold">Sequência do dia</h2><div className="space-y-2">{ordenadas.map(x => <div key={x.id} className="flex items-center gap-3 rounded-lg border bg-card p-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary font-semibold">{x.ordem}</span><div className="min-w-0 flex-1"><p className="truncate font-medium">{x.nomeCliente}</p><p className="truncate text-xs text-muted-foreground">{x.tipo} · {x.periodo}</p>{x.motivoNaoRealizacao && <p className="truncate text-xs text-destructive">{x.motivoNaoRealizacao}</p>}</div><Badge variant={x.situacao === "NaoRealizada" ? "destructive" : x.situacao === "EmDeslocamento" ? "default" : "outline"}>{rotuloParada(x.situacao)}</Badge></div>)}</div></section>
  </div>;
}

const hoje = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const formatarData = (x: string) => new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", dateStyle: "long" }).format(new Date(`${x}T12:00:00Z`));
const rotuloParada = (x: string) => ({ Pendente: "Pendente", EmDeslocamento: "A caminho", Concluida: "Concluída", NaoRealizada: "Não realizada" }[x] || x);
