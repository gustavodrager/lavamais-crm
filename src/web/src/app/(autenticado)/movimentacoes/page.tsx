import Link from "next/link";
import { Search } from "lucide-react";
import { FormularioMovimentacao } from "./formulario-movimentacao";
import { CancelarMovimentacao } from "./cancelar-movimentacao";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";

export default async function Movimentacoes({ searchParams }: { searchParams: Promise<{ busca?: string; clienteId?: string; erro?: string; sucesso?: string }> }) {
  const parametros = await searchParams; const busca = parametros.busca?.trim() ?? "";
  const api = obterPortaCrmApi();
  const [clientes, ofertas, movimentacoes] = await Promise.all([
    busca ? api.listarClientes(busca, 1, 10) : Promise.resolve({ itens: [], pagina: 1, tamanhoPagina: 10, total: 0 }),
    api.listarOfertasDoCatalogoDeLavanderia(), api.listarMovimentacoes(undefined, 30),
  ]);
  const clienteSelecionado = clientes.itens.find((cliente) => cliente.id === parametros.clienteId);
  const agoraLocal = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()).replace(" ", "T");
  return <><CabecalhoPagina titulo="Movimentações comerciais" descricao="Registre informações básicas dos pedidos para formar o histórico comercial dos clientes." />
    {parametros.erro && <Alert variant="destructive" className="mb-4"><AlertTitle>Registro não concluído</AlertTitle><AlertDescription>{parametros.erro}</AlertDescription></Alert>}
    {parametros.sucesso && <Alert className="mb-4"><AlertTitle>Pronto</AlertTitle><AlertDescription>{parametros.sucesso}</AlertDescription></Alert>}
    <div className="grid gap-5 xl:grid-cols-[minmax(0,420px)_1fr]">
      <Card><CardHeader><CardTitle>Novo registro</CardTitle></CardHeader><CardContent className="space-y-5">
        <form className="space-y-2" role="search"><Label htmlFor="busca">Localizar cliente</Label><div className="flex gap-2"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input id="busca" name="busca" defaultValue={busca} placeholder="Nome ou WhatsApp" className="pl-9" /></div><Button type="submit" variant="outline">Buscar</Button></div></form>
        {busca && !clienteSelecionado && <div className="space-y-2">{clientes.itens.length === 0 ? <div className="rounded-lg border border-dashed p-4"><p className="text-sm text-muted-foreground">Nenhum cliente encontrado.</p><Button asChild variant="outline" className="mt-3 w-full"><Link href={`/clientes/novo?${new URLSearchParams({ retorno: `/movimentacoes?busca=${busca}` })}`}>Cadastrar cliente e continuar</Link></Button></div> : clientes.itens.map((cliente) => <div key={cliente.id} className="flex items-center justify-between gap-3 rounded-lg border p-3"><div><p className="text-sm font-medium">{formatarNome(cliente.nome)}</p><p className="text-xs text-muted-foreground">{cliente.localidade}</p></div><Button asChild size="sm" variant="outline"><Link href={`/movimentacoes?${new URLSearchParams({ busca, clienteId: cliente.id })}`}>Selecionar</Link></Button></div>)}</div>}
        {clienteSelecionado ? <FormularioMovimentacao clienteId={clienteSelecionado.id} nomeCliente={formatarNome(clienteSelecionado.nome)} ofertas={ofertas} agoraLocal={agoraLocal} /> : !busca && <p className="rounded-lg bg-secondary/50 p-4 text-sm text-muted-foreground">Busque e selecione um cliente para começar.</p>}
      </CardContent></Card>
          <Card><CardHeader><CardTitle>Registros recentes</CardTitle></CardHeader><CardContent className="p-0">{movimentacoes.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">Nenhuma movimentação registrada.</p> : <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Cliente</TableHead><TableHead>Itens</TableHead><TableHead>Origem</TableHead><TableHead>Situação</TableHead><TableHead className="text-right">Valor</TableHead><TableHead><span className="sr-only">Ações</span></TableHead></TableRow></TableHeader><TableBody>{movimentacoes.map((item) => <TableRow key={item.id}><TableCell className="whitespace-nowrap">{formatarData(item.dataMovimentacao)}</TableCell><TableCell className="font-medium">{formatarNome(item.nomeCliente)}</TableCell><TableCell>{resumirLinhas(item.linhas)}</TableCell><TableCell><Badge variant="secondary">{item.origem === "Recepcao" ? "Recepção" : "Essence"}</Badge></TableCell><TableCell><Badge variant={item.situacao === "Cancelada" ? "destructive" : "outline"}>{item.situacao === "Cancelada" ? "Cancelada" : "Registrada"}</Badge></TableCell><TableCell className="text-right font-medium">{moeda.format(item.valorTotal)}</TableCell><TableCell>{item.situacao === "Registrada" && <CancelarMovimentacao id={item.id} versao={item.versao} />}</TableCell></TableRow>)}</TableBody></Table></div>}</CardContent></Card>
    </div></>;
}

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const formatarData = (valor: string) => new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" }).format(new Date(valor));
function formatarNome(valor: string) { return valor === valor.toLocaleUpperCase("pt-BR") ? valor.toLocaleLowerCase("pt-BR").replace(/(^|[\s'-])\p{L}/gu, (letra) => letra.toLocaleUpperCase("pt-BR")) : valor; }
function resumirLinhas(linhas: Array<{ quantidade: number; nomeArtigo: string; nomeServico: string }>) { return linhas.length ? linhas.map((linha) => `${linha.quantidade}× ${linha.nomeArtigo} · ${linha.nomeServico}`).join("; ") : "Registro legado"; }
