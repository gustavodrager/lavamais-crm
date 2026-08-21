import Link from "next/link";
import { Megaphone, Plus } from "lucide-react";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { EstadoFalhaApi } from "@/components/estado-falha-api";
import { EstadoVazio } from "@/components/estado-vazio";
import { SituacaoAcao } from "@/components/situacao-acao";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ErroCrmApi } from "@/infraestrutura/crm-api-http";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";

export default async function AcoesComerciais() {
  let resultado;
  try { resultado = await obterPortaCrmApi().listarAcoes(); }
  catch (erro) { if (erro instanceof ErroCrmApi) return <><CabecalhoPagina titulo="Ações Comerciais" descricao="Crie, prepare e acompanhe contatos comerciais com uma audiência rastreável." /><EstadoFalhaApi status={erro.status} /></>; throw erro; }
  return <><CabecalhoPagina titulo="Ações Comerciais" descricao="Crie, prepare e acompanhe contatos comerciais com uma audiência rastreável." acao={<Button asChild><Link href="/acoes-comerciais/nova"><Plus aria-hidden="true" />Nova ação</Link></Button>} />
    {resultado.itens.length === 0 ? <EstadoVazio icone={Megaphone} titulo="Nenhuma Ação Comercial" descricao="Crie a primeira ação para começar a preparar uma audiência real." /> : <Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Ação</TableHead><TableHead className="hidden md:table-cell">Atualização</TableHead><TableHead>Situação</TableHead><TableHead className="hidden text-right sm:table-cell">Destinatários</TableHead></TableRow></TableHeader><TableBody>{resultado.itens.map((acao) => <TableRow key={acao.id}><TableCell><Link className="font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href={`/acoes-comerciais/${acao.id}`}>{acao.nome}</Link><span className="mt-1 block text-xs text-muted-foreground">{acao.objetivo ?? "Sem objetivo informado"}</span></TableCell><TableCell className="hidden text-muted-foreground md:table-cell">{new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(acao.dataAtualizacao))}</TableCell><TableCell><SituacaoAcao situacao={acao.situacao} /></TableCell><TableCell className="hidden text-right tabular-nums sm:table-cell">{acao.totalDestinatarios ?? "—"}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>}
  </>;
}
