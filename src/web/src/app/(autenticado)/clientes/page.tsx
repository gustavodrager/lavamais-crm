import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";

export default async function Clientes({ searchParams }: { searchParams: Promise<{ busca?: string }> }) {
  const { busca = "" } = await searchParams;
  const resultado = await obterPortaCrmApi().listarClientes(busca.trim() || undefined);
  return <><CabecalhoPagina titulo="Clientes" descricao="Consulte contatos, localidades, etiquetas e permissões de comunicação." acao={<Button asChild><Link href="/clientes/novo"><Plus aria-hidden="true" />Novo cliente</Link></Button>} />
    <form className="relative mb-4 flex max-w-lg gap-2" role="search"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input className="pl-9" name="busca" defaultValue={busca} placeholder="Buscar por nome, WhatsApp ou bairro" aria-label="Buscar clientes" /></div><Button type="submit" variant="outline">Buscar</Button></form>
    <Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead className="hidden md:table-cell">Localidade</TableHead><TableHead className="hidden lg:table-cell">Etiquetas</TableHead><TableHead>WhatsApp</TableHead></TableRow></TableHeader><TableBody>{resultado.itens.length === 0 ? <TableRow><TableCell colSpan={4} className="py-10 text-center text-muted-foreground">Nenhum cliente encontrado.</TableCell></TableRow> : resultado.itens.map((cliente) => <TableRow key={cliente.id}><TableCell><span className="font-medium">{cliente.nome}</span><span className="mt-1 block text-xs text-muted-foreground">{cliente.codigoExterno ? `Código ${cliente.codigoExterno} · ` : ""}{cliente.whatsapp}</span></TableCell><TableCell className="hidden text-muted-foreground md:table-cell">{cliente.localidade}</TableCell><TableCell className="hidden lg:table-cell"><Badge variant="secondary">{cliente.quantidadeEtiquetas}</Badge></TableCell><TableCell><Badge variant={cliente.permiteWhatsapp ? "secondary" : "outline"}>{cliente.permiteWhatsapp ? "Permitido" : "Sem permissão"}</Badge></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
  </>;
}
