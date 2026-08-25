import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, MessageCircle, Plus } from "lucide-react";
import { HistoricoComercial } from "./historico-comercial";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";

export default async function DetalheDoCliente({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const api = obterPortaCrmApi();
  const [cliente, movimentacoes] = await Promise.all([api.obterCliente(id), api.listarMovimentacoes(id, 100)]);
  if (!cliente) notFound();
  return <div className="space-y-6">
    <Button asChild variant="ghost" className="-ml-3"><Link href="/clientes"><ArrowLeft />Voltar para clientes</Link></Button>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="mb-2 flex flex-wrap items-center gap-2"><Badge variant={cliente.situacao === "Ativo" ? "secondary" : "outline"}>{cliente.situacao}</Badge>{cliente.tipo && <Badge variant="outline">{cliente.tipo}</Badge>}</div><h1 className="font-heading text-3xl font-semibold tracking-tight">{formatarNome(cliente.nome)}</h1><p className="mt-1 text-muted-foreground">Visão comercial e histórico de relacionamento.</p></div><Button asChild><Link href={`/movimentacoes?${new URLSearchParams({ busca: cliente.nome, clienteId: cliente.id })}`}><Plus />Nova movimentação</Link></Button></div>
    <Card><CardContent className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3"><Informacao icone={MessageCircle} rotulo="WhatsApp" valor={mascararWhatsapp(cliente.whatsapp)} complemento={cliente.permiteWhatsapp ? "Marketing autorizado" : "Sem autorização de marketing"} /><Informacao icone={MapPin} rotulo="Localidade" valor={cliente.localidade} complemento={cliente.codigoExterno ? `Código externo ${cliente.codigoExterno}` : undefined} /></CardContent></Card>
    <HistoricoComercial movimentacoes={movimentacoes} />
  </div>;
}

function Informacao({ icone: Icone, rotulo, valor, complemento }: { icone: typeof MessageCircle; rotulo: string; valor: string; complemento?: string }) { return <div className="flex gap-3"><div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary"><Icone className="size-4" aria-hidden="true" /></div><div><p className="text-xs font-medium text-muted-foreground">{rotulo}</p><p className="text-sm font-medium">{valor}</p>{complemento && <p className="text-xs text-muted-foreground">{complemento}</p>}</div></div>; }
function formatarNome(valor: string) { return valor === valor.toLocaleUpperCase("pt-BR") ? valor.toLocaleLowerCase("pt-BR").replace(/(^|[\s'-])\p{L}/gu, (letra) => letra.toLocaleUpperCase("pt-BR")) : valor; }
function mascararWhatsapp(valor: string) { const digitos = valor.replace(/\D/g, ""); return digitos.length >= 4 ? `•••• ••••-${digitos.slice(-4)}` : "WhatsApp cadastrado"; }
