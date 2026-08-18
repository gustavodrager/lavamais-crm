import { Plus, Search } from "lucide-react";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";

export default async function Clientes() {
  const resultado = await obterPortaCrmApi().listarClientes();
  return <><CabecalhoPagina titulo="Clientes" descricao="Consulte contatos, localidades, etiquetas e permissões de comunicação." acao={<Button><Plus aria-hidden="true" />Novo cliente</Button>} /><div className="relative mb-4 max-w-md"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input className="pl-9" placeholder="Buscar por nome, WhatsApp ou bairro" aria-label="Buscar clientes" /></div><Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead className="hidden md:table-cell">Localidade</TableHead><TableHead className="hidden lg:table-cell">Etiquetas</TableHead><TableHead>WhatsApp</TableHead></TableRow></TableHeader><TableBody>{resultado.itens.map((cliente) => <TableRow key={cliente.id}><TableCell><span className="font-medium">{cliente.nome}</span><span className="mt-1 block text-xs text-muted-foreground">{cliente.whatsapp}</span></TableCell><TableCell className="hidden text-muted-foreground md:table-cell">{cliente.localidade}</TableCell><TableCell className="hidden lg:table-cell">{cliente.etiquetas.map((etiqueta) => <Badge key={etiqueta} variant="secondary" className="mr-1">{etiqueta}</Badge>)}</TableCell><TableCell><Badge variant={cliente.permiteWhatsapp ? "secondary" : "outline"}>{cliente.permiteWhatsapp ? "Permitido" : "Sem permissão"}</Badge></TableCell></TableRow>)}</TableBody></Table></CardContent></Card></>;
}
