import Link from "next/link";
import { Search } from "lucide-react";
import { FormularioMovimentacao } from "./formulario-movimentacao";
import { CancelarMovimentacao } from "./cancelar-movimentacao";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { EstadoFalhaApi } from "@/components/estado-falha-api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ErroCrmApi } from "@/infraestrutura/crm-api-http";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";
import { obterPortaSessao } from "@/infraestrutura/obter-porta-sessao";
import { papelDaVisao } from "@/lib/sessao-apresentacao";

export default async function Movimentacoes({ searchParams }: { searchParams: Promise<{ busca?: string; clienteId?: string; erro?: string; sucesso?: string }> }) {
  const parametros = await searchParams; const busca = parametros.busca?.trim() ?? "";
  const api = obterPortaCrmApi();
  let clientes: Awaited<ReturnType<typeof api.listarClientes>>;
  let ofertas: Awaited<ReturnType<typeof api.listarOfertasDoCatalogoDeLavanderia>>;
  let movimentacoes: Awaited<ReturnType<typeof api.listarMovimentacoes>>;
  let clientePorId: Awaited<ReturnType<typeof api.obterCliente>>;
  let sessao: Awaited<ReturnType<ReturnType<typeof obterPortaSessao>["obterSessao"]>>;
  try {
    [clientes, ofertas, movimentacoes, clientePorId, sessao] = await Promise.all([
      busca ? api.listarClientes(busca, 1, 10) : Promise.resolve({ itens: [], pagina: 1, tamanhoPagina: 10, total: 0 }),
      api.listarOfertasDoCatalogoDeLavanderia(), api.listarMovimentacoes(undefined, 30),
      parametros.clienteId ? api.obterCliente(parametros.clienteId) : Promise.resolve(null), obterPortaSessao().obterSessao(),
    ]);
  } catch (erro) {
    if (erro instanceof ErroCrmApi) return <EstadoFalhaApi status={erro.status} />;
    throw erro;
  }
  const clientesAtivos = clientes.itens.filter((cliente) => cliente.situacao === "Ativo");
  const clienteSelecionado = clientesAtivos.find((cliente) => cliente.id === parametros.clienteId) ?? (clientePorId?.situacao === "Ativo" ? clientePorId : undefined);
  const papelVisualizado = papelDaVisao(sessao);
  const modoOperador = papelVisualizado === "Operador";
  const podeCancelar = papelVisualizado === "Administrador" || papelVisualizado === "Gerente";
  const agoraLocal = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()).replace(" ", "T");
  return <><CabecalhoPagina titulo={modoOperador ? "Atendimentos comerciais" : "Movimentações comerciais"} descricao={modoOperador ? "Registre os itens e serviços combinados com cada cliente." : "Registre informações básicas dos pedidos para formar o histórico comercial dos clientes."} />
    {parametros.erro && <Alert variant="destructive" className="mb-4"><AlertTitle>Registro não concluído</AlertTitle><AlertDescription>{parametros.erro}</AlertDescription></Alert>}
    {parametros.sucesso && <Alert className="mb-4"><AlertTitle>Atendimento registrado</AlertTitle><AlertDescription>{parametros.sucesso}. O novo registro aparece no histórico abaixo.{parametros.clienteId ? <Link className="mt-2 block font-medium text-primary underline-offset-4 hover:underline" href={`/clientes/${parametros.clienteId}`}>Abrir histórico do cliente</Link> : null}</AlertDescription></Alert>}
    <div className="grid gap-5 xl:grid-cols-[minmax(0,460px)_1fr]">
      <Card className="rounded-lg"><CardHeader><CardTitle>{modoOperador ? "Registrar atendimento" : "Novo registro"}</CardTitle></CardHeader><CardContent className="space-y-5">
        <form className="space-y-2" role="search"><Label htmlFor="busca">Localizar cliente</Label><div className="flex gap-2"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input id="busca" name="busca" defaultValue={busca} placeholder="Nome ou WhatsApp" className="pl-9" /></div><Button type="submit" variant="outline">Buscar</Button></div></form>
        {busca && !clienteSelecionado && <div className="space-y-2">{clientesAtivos.length === 0 ? <div className="rounded-lg border border-dashed p-4"><p className="text-sm text-muted-foreground">Nenhum cliente ativo encontrado.</p><Button asChild variant="outline" className="mt-3 w-full"><Link href={`/clientes/novo?${new URLSearchParams({ retorno: `/movimentacoes?busca=${busca}` })}`}>Cadastrar cliente e continuar</Link></Button></div> : clientesAtivos.map((cliente) => <div key={cliente.id} className="flex items-center justify-between gap-3 rounded-lg border p-3"><div><Link href={`/clientes/${cliente.id}`} className="text-sm font-medium text-primary underline-offset-4 hover:underline" aria-label={`Abrir detalhes das movimentações de ${formatarNome(cliente.nome)}`}>{formatarNome(cliente.nome)}</Link><p className="text-xs text-muted-foreground">{cliente.localidade}</p></div><Button asChild size="sm" variant="outline"><Link href={`/movimentacoes?${new URLSearchParams({ busca, clienteId: cliente.id })}`}>Selecionar</Link></Button></div>)}</div>}
        {clienteSelecionado ? <FormularioMovimentacao clienteId={clienteSelecionado.id} nomeCliente={formatarNome(clienteSelecionado.nome)} ofertas={ofertas} agoraLocal={agoraLocal} busca={busca} /> : !busca && <p className="rounded-lg bg-secondary/50 p-4 text-sm text-muted-foreground">Busque e selecione um cliente ativo para começar.</p>}
      </CardContent></Card>
      <Card className="rounded-lg"><CardHeader><CardTitle>{modoOperador ? "Atendimentos recentes" : "Registros recentes"}</CardTitle></CardHeader><CardContent className="p-0">{movimentacoes.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">Nenhum atendimento registrado.</p> : <><div className="divide-y md:hidden">{movimentacoes.map((item) => <article key={item.id} className={item.situacao === "Cancelada" ? "space-y-3 p-4 opacity-60" : "space-y-3 p-4"}><div className="flex items-start justify-between gap-3"><div><Link href={`/clientes/${item.clienteId}`} className="font-medium text-primary underline-offset-4 hover:underline">{formatarNome(item.nomeCliente)}</Link><p className="mt-1 text-xs text-muted-foreground">{formatarData(item.dataMovimentacao)}</p></div><Badge variant={item.situacao === "Cancelada" ? "destructive" : "outline"}>{item.situacao === "Cancelada" ? "Cancelado" : "Registrado"}</Badge></div><p className="text-sm leading-6">{resumirLinhas(item.linhas)}</p><div className="flex items-center justify-between gap-3"><strong className="text-sm tabular-nums">{moeda.format(item.valorTotal)}</strong>{podeCancelar && item.situacao === "Registrada" ? <CancelarMovimentacao id={item.id} versao={item.versao} /> : null}</div></article>)}</div><div className="hidden overflow-x-auto md:block"><Table><TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Cliente</TableHead><TableHead>Itens</TableHead>{!modoOperador && <TableHead>Origem</TableHead>}<TableHead>Situação</TableHead><TableHead className="text-right">Valor</TableHead>{podeCancelar && <TableHead><span className="sr-only">Ações</span></TableHead>}</TableRow></TableHeader><TableBody>{movimentacoes.map((item) => <TableRow key={item.id} className={item.situacao === "Cancelada" ? "opacity-60" : undefined}><TableCell className="whitespace-nowrap">{formatarData(item.dataMovimentacao)}</TableCell><TableCell className="font-medium"><Link href={`/clientes/${item.clienteId}`} className="text-primary underline-offset-4 hover:underline" aria-label={`Abrir detalhes dos atendimentos de ${formatarNome(item.nomeCliente)}`}>{formatarNome(item.nomeCliente)}</Link></TableCell><TableCell>{resumirLinhas(item.linhas)}</TableCell>{!modoOperador && <TableCell><Badge variant="secondary">{item.origem === "Recepcao" ? "Recepção" : item.origem === "ImportacaoEssence" ? "Importação Essence" : "Integração Essence"}</Badge></TableCell>}<TableCell><Badge variant={item.situacao === "Cancelada" ? "destructive" : "outline"}>{item.situacao === "Cancelada" ? "Cancelada" : "Registrada"}</Badge></TableCell><TableCell className="text-right font-medium">{moeda.format(item.valorTotal)}</TableCell>{podeCancelar && <TableCell>{item.situacao === "Registrada" && <CancelarMovimentacao id={item.id} versao={item.versao} />}</TableCell>}</TableRow>)}</TableBody></Table></div></>}</CardContent></Card>
    </div></>;
}

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const formatarData = (valor: string) => new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" }).format(new Date(valor));
function formatarNome(valor: string) { return valor === valor.toLocaleUpperCase("pt-BR") ? valor.toLocaleLowerCase("pt-BR").replace(/(^|[\s'-])\p{L}/gu, (letra) => letra.toLocaleUpperCase("pt-BR")) : valor; }
function resumirLinhas(linhas: Array<{ quantidade: number; nomeArtigo: string; nomeServico: string }>) { return linhas.length ? linhas.map((linha) => `${linha.quantidade}× ${linha.nomeArtigo} · ${linha.nomeServico}`).join("; ") : "Registro legado"; }
