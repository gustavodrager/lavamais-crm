import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";
import { obterPortaSessao } from "@/infraestrutura/obter-porta-sessao";
import { papelDaVisao } from "@/lib/sessao-apresentacao";

export default async function Clientes({ searchParams }: { searchParams: Promise<{ busca?: string; pagina?: string }> }) {
  const { busca = "", pagina: paginaInformada = "1" } = await searchParams;
  const pagina = Math.max(1, Number.parseInt(paginaInformada, 10) || 1);
  const [resultado, sessao] = await Promise.all([obterPortaCrmApi().listarClientes(busca.trim() || undefined, pagina, 10), obterPortaSessao().obterSessao()]);
  const modoOperador = papelDaVisao(sessao) === "Operador";
  const totalPaginas = Math.max(1, Math.ceil(resultado.total / resultado.tamanhoPagina));
  const urlPagina = (numero: number) => `/clientes?${new URLSearchParams({ ...(busca ? { busca } : {}), pagina: String(numero) })}`;
  return <><CabecalhoPagina titulo="Clientes" descricao={modoOperador ? "Busque clientes para atender, atualizar o cadastro ou adicionar ao roteiro." : "Consulte contatos, localidades, etiquetas e permissões de comunicação."} acao={<Button asChild><Link href="/clientes/novo"><Plus aria-hidden="true" />Novo cliente</Link></Button>} />
    <form className="relative mb-4 grid max-w-lg gap-2 sm:grid-cols-[1fr_auto]" role="search"><div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input className="pl-9" name="busca" defaultValue={busca} placeholder="Nome, WhatsApp ou bairro" aria-label="Buscar clientes" /></div><Button type="submit" variant="outline" className="w-full sm:w-auto">Buscar</Button></form>
    <p className="mb-3 text-sm text-muted-foreground">{resultado.total} {resultado.total === 1 ? "cliente encontrado" : "clientes encontrados"}</p>
    {resultado.itens.length === 0 ? <Card><p className="py-10 text-center text-sm text-muted-foreground">Nenhum cliente encontrado.</p></Card> : <><div className="grid gap-3 md:hidden">{resultado.itens.map((cliente) => <Link key={cliente.id} href={`/clientes/${cliente.id}`} className="rounded-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"><Card className="h-full rounded-lg transition-colors hover:border-primary/50"><CardContent className="space-y-3 p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-medium normal-case">{formatarNome(cliente.nome)}</p>{!modoOperador && <p className="mt-1 text-xs text-muted-foreground">{cliente.codigoExterno ? `Código ${cliente.codigoExterno}` : "Sem código externo"}</p>}</div><Badge variant={cliente.permiteWhatsapp ? "secondary" : "outline"}>{cliente.permiteWhatsapp ? "WhatsApp autorizado" : "Sem autorização"}</Badge></div><div className="grid gap-1 text-sm"><span>{cliente.localidade}</span><span className="font-medium text-[var(--marca-azul-profundo)]">{formatarWhatsapp(cliente.whatsapp)}</span>{cliente.temEnderecoOperacional === false && <span className="text-xs text-destructive">Endereço incompleto para roteiro</span>}</div></CardContent></Card></Link>)}</div><Card className="hidden rounded-lg md:flex"><CardContent className="w-full p-0"><Table><TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead>Localidade</TableHead>{!modoOperador && <TableHead className="hidden lg:table-cell">Etiquetas</TableHead>}<TableHead>WhatsApp</TableHead><TableHead>Autorização</TableHead></TableRow></TableHeader><TableBody>{resultado.itens.map((cliente) => <TableRow key={cliente.id} className="cursor-pointer"><TableCell><Link href={`/clientes/${cliente.id}`} className="block rounded-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"><span className="font-medium">{formatarNome(cliente.nome)}</span>{!modoOperador && <span className="mt-1 block text-xs text-muted-foreground">{cliente.codigoExterno ? `Código ${cliente.codigoExterno}` : "Sem código externo"}</span>}{cliente.temEnderecoOperacional === false && <span className="mt-1 block text-xs text-destructive">Endereço incompleto</span>}</Link></TableCell><TableCell className="text-muted-foreground">{cliente.localidade}</TableCell>{!modoOperador && <TableCell className="hidden lg:table-cell"><Badge variant="secondary">{cliente.quantidadeEtiquetas}</Badge></TableCell>}<TableCell className="font-medium text-[var(--marca-azul-profundo)]">{formatarWhatsapp(cliente.whatsapp)}</TableCell><TableCell><Badge variant={cliente.permiteWhatsapp ? "secondary" : "outline"}>{cliente.permiteWhatsapp ? "Autorizado" : "Sem autorização"}</Badge></TableCell></TableRow>)}</TableBody></Table></CardContent></Card></>}
    {resultado.total > 0 && <nav aria-label="Paginação de clientes" className="mt-5 flex items-center justify-between gap-3"><Button asChild variant="outline" className={pagina <= 1 ? "pointer-events-none opacity-50" : ""}><Link href={urlPagina(pagina - 1)} aria-disabled={pagina <= 1}>Anterior</Link></Button><span className="text-sm text-muted-foreground">Página {pagina} de {totalPaginas}</span><Button asChild variant="outline" className={pagina >= totalPaginas ? "pointer-events-none opacity-50" : ""}><Link href={urlPagina(pagina + 1)} aria-disabled={pagina >= totalPaginas}>Próxima</Link></Button></nav>}
  </>;
}

function formatarNome(valor: string) {
  if (valor !== valor.toLocaleUpperCase("pt-BR")) return valor;
  return valor.toLocaleLowerCase("pt-BR").replace(/(^|[\s'-])\p{L}/gu, (letra) => letra.toLocaleUpperCase("pt-BR"));
}

function formatarWhatsapp(valor: string) {
  const digitos = valor.replace(/\D/g, "");
  if (digitos.length === 13 && digitos.startsWith("55")) return `+55 (${digitos.slice(2, 4)}) ${digitos.slice(4, 9)}-${digitos.slice(9)}`;
  if (digitos.length === 12 && digitos.startsWith("55")) return `+55 (${digitos.slice(2, 4)}) ${digitos.slice(4, 8)}-${digitos.slice(8)}`;
  if (digitos.length === 11) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
  if (digitos.length === 10) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  return valor;
}
