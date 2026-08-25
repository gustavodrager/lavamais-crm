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
    <p className="mb-3 text-sm text-muted-foreground">{resultado.total} {resultado.total === 1 ? "cliente encontrado" : "clientes encontrados"}</p>
    {resultado.itens.length === 0 ? <Card><p className="py-10 text-center text-sm text-muted-foreground">Nenhum cliente encontrado.</p></Card> : <><div className="grid gap-3 md:hidden">{resultado.itens.map((cliente) => <Card key={cliente.id}><CardContent className="space-y-3 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-medium">{cliente.nome}</p><p className="mt-1 text-xs text-muted-foreground">{cliente.codigoExterno ? `Código ${cliente.codigoExterno}` : "Sem código externo"}</p></div><Badge variant={cliente.permiteWhatsapp ? "secondary" : "outline"}>{cliente.permiteWhatsapp ? "WhatsApp permitido" : "Sem permissão"}</Badge></div><div className="grid gap-1 text-sm"><span>{cliente.localidade}</span><span className="text-muted-foreground">{mascararWhatsapp(cliente.whatsapp)}</span></div></CardContent></Card>)}</div><Card className="hidden md:flex"><CardContent className="w-full p-0"><Table><TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead>Localidade</TableHead><TableHead className="hidden lg:table-cell">Etiquetas</TableHead><TableHead>WhatsApp</TableHead></TableRow></TableHeader><TableBody>{resultado.itens.map((cliente) => <TableRow key={cliente.id}><TableCell><span className="font-medium">{cliente.nome}</span><span className="mt-1 block text-xs text-muted-foreground">{cliente.codigoExterno ? `Código ${cliente.codigoExterno} · ` : ""}{mascararWhatsapp(cliente.whatsapp)}</span></TableCell><TableCell className="text-muted-foreground">{cliente.localidade}</TableCell><TableCell className="hidden lg:table-cell"><Badge variant="secondary">{cliente.quantidadeEtiquetas}</Badge></TableCell><TableCell><Badge variant={cliente.permiteWhatsapp ? "secondary" : "outline"}>{cliente.permiteWhatsapp ? "Permitido" : "Sem permissão"}</Badge></TableCell></TableRow>)}</TableBody></Table></CardContent></Card></>}
  </>;
}

function mascararWhatsapp(valor: string) {
  const digitos = valor.replace(/\D/g, "");
  return digitos.length >= 4 ? `•••• ••••-${digitos.slice(-4)}` : "WhatsApp cadastrado";
}
