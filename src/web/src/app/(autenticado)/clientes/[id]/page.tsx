import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Plus, Route } from "lucide-react";
import { DadosCadastraisDoCliente } from "./dados-cadastrais";
import { EditarCliente } from "./editar-cliente";
import { HistoricoComercial } from "./historico-comercial";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";
import { obterPortaSessao } from "@/infraestrutura/obter-porta-sessao";
import { papelDaVisao } from "@/lib/sessao-apresentacao";

export default async function DetalheDoCliente({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ editar?: string; retorno?: string; sucesso?: string }> }) {
  const { id } = await params;
  const consulta = await searchParams;
  const api = obterPortaCrmApi();
  const [cliente, movimentacoes, sessao, etiquetas] = await Promise.all([api.obterCliente(id), api.listarMovimentacoes(id, 100), obterPortaSessao().obterSessao(), api.listarEtiquetas()]);
  if (!cliente) notFound();
  const papelVisualizado = papelDaVisao(sessao);
  const modoOperador = papelVisualizado === "Operador";
  const podeCancelar = papelVisualizado === "Administrador" || papelVisualizado === "Gerente";
  const etiquetasPorId = new Map(etiquetas.map((etiqueta) => [etiqueta.id, etiqueta.nome]));
  const nomesEtiquetas = cliente.etiquetaIds.map((etiquetaId) => etiquetasPorId.get(etiquetaId) ?? `Etiqueta não localizada (${etiquetaId})`);
  return <div className="space-y-6">
    <Button asChild variant="ghost" className="-ml-3"><Link href="/clientes"><ArrowLeft />Voltar para clientes</Link></Button>
    {consulta.sucesso ? <Alert><CheckCircle2 /><AlertTitle>Cadastro atualizado</AlertTitle><AlertDescription>Os dados de {formatarNome(cliente.nome)} estão prontos para os próximos atendimentos.</AlertDescription></Alert> : null}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="mb-2 flex flex-wrap items-center gap-2"><Badge variant={cliente.situacao === "Ativo" ? "secondary" : "outline"}>{cliente.situacao}</Badge>{cliente.tipo && <Badge variant="outline">{cliente.tipo}</Badge>}</div><h1 className="font-heading text-3xl font-semibold tracking-tight">{formatarNome(cliente.nome)}</h1><p className="mt-1 text-muted-foreground">Contato, endereço e histórico de atendimento.</p></div><div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end"><Button asChild><Link href={`/movimentacoes?${new URLSearchParams({ busca: cliente.nome, clienteId: cliente.id })}`}><Plus />Registrar atendimento</Link></Button><Button asChild variant="outline"><Link href={`/roteiros?${new URLSearchParams({ busca: cliente.nome, clienteId: cliente.id })}`}><Route />Adicionar ao roteiro</Link></Button><EditarCliente cliente={cliente} retorno={consulta.retorno} abertoInicial={consulta.editar === "1"} /></div></div>
    <DadosCadastraisDoCliente cliente={cliente} nomesEtiquetas={nomesEtiquetas} modoOperador={modoOperador} />
    <HistoricoComercial movimentacoes={movimentacoes} podeCancelar={podeCancelar} modoOperador={modoOperador} />
  </div>;
}
function formatarNome(valor: string) { return valor === valor.toLocaleUpperCase("pt-BR") ? valor.toLocaleLowerCase("pt-BR").replace(/(^|[\s'-])\p{L}/gu, (letra) => letra.toLocaleUpperCase("pt-BR")) : valor; }
