import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DetalheAtendimento, LinkDoCliente } from "./detalhe-atendimento";
import { EstadoFalhaApi } from "@/components/estado-falha-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ErroCrmApi } from "@/infraestrutura/crm-api-http";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";
import { obterPortaSessao } from "@/infraestrutura/obter-porta-sessao";
import { papelDaVisao } from "@/lib/sessao-apresentacao";

export default async function PaginaDetalheAtendimento({ params }: { params: Promise<{ id: string; atendimentoId: string }> }) {
  const { id: clienteId, atendimentoId } = await params;
  let atendimento: Awaited<ReturnType<ReturnType<typeof obterPortaCrmApi>["obterMovimentacao"]>>;
  let sessao: Awaited<ReturnType<ReturnType<typeof obterPortaSessao>["obterSessao"]>>;
  try {
    [atendimento, sessao] = await Promise.all([obterPortaCrmApi().obterMovimentacao(atendimentoId), obterPortaSessao().obterSessao()]);
  } catch (erro) {
    if (erro instanceof ErroCrmApi) return <EstadoFalhaApi status={erro.status} />;
    throw erro;
  }
  if (!atendimento || atendimento.clienteId !== clienteId) notFound();
  const papel = papelDaVisao(sessao);
  const podeCancelar = papel === "Administrador" || papel === "Gerente";
  return <div className="space-y-6">
    <nav aria-label="Caminho da página" className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
      <Link className="hover:text-foreground hover:underline" href="/clientes">Clientes</Link><span aria-hidden="true">/</span>
      <Link className="hover:text-foreground hover:underline" href={`/clientes/${clienteId}`}>{atendimento.nomeCliente}</Link><span aria-hidden="true">/</span>
      <span aria-current="page">Atendimento</span>
    </nav>
    <Button asChild variant="ghost" className="-ml-3"><Link href={`/clientes/${clienteId}#historico-atendimentos`}><ArrowLeft aria-hidden="true" />Voltar para o histórico</Link></Button>
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div><div className="mb-2"><Badge variant={atendimento.situacao === "Registrada" ? "secondary" : "destructive"}>{atendimento.situacao === "Registrada" ? "Registrado" : "Cancelado"}</Badge></div><h1 className="font-heading text-3xl font-semibold tracking-tight">Detalhes do atendimento</h1><p className="mt-1 text-muted-foreground">Atendimento de {atendimento.nomeCliente}.</p></div>
      <LinkDoCliente clienteId={clienteId} nomeCliente={atendimento.nomeCliente} />
    </header>
    <DetalheAtendimento atendimento={atendimento} podeCancelar={podeCancelar} />
  </div>;
}
