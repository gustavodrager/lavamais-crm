import { notFound } from "next/navigation";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { EstadoFalhaApi } from "@/components/estado-falha-api";
import { SituacaoAcao } from "@/components/situacao-acao";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErroCrmApi } from "@/infraestrutura/crm-api-http";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";
import { DefinicaoPublico } from "./definicao-publico";
import { PreparacaoAcao } from "./preparacao";
import { ExecucaoAcao } from "./execucao";

export default async function DetalheAcao({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let acao;
  try { acao = await obterPortaCrmApi().obter(id); }
  catch (erro) { if (erro instanceof ErroCrmApi) return <><CabecalhoPagina titulo="Detalhe da Ação Comercial" descricao="Acompanhe a preparação, a entrega e o resultado comercial." /><EstadoFalhaApi status={erro.status} /></>; throw erro; }
  if (!acao) notFound();
  const modelos = acao.situacao === "Rascunho" ? await obterPortaCrmApi().listarModelosPublicados() : [];
  return <><CabecalhoPagina titulo={acao.nome} descricao={acao.objetivo ?? "Acompanhe a preparação, a entrega e o resultado comercial."} acao={<SituacaoAcao situacao={acao.situacao} />} />
    <div className="grid gap-4 sm:grid-cols-3"><Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Destinatários</CardTitle></CardHeader><CardContent className="text-2xl font-semibold tabular-nums">{acao.totais.destinatarios}</CardContent></Card><Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Entregues / lidos</CardTitle></CardHeader><CardContent className="text-2xl font-semibold tabular-nums">{acao.totais.entregues} / {acao.totais.lidos}</CardContent></Card><Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Conversões</CardTitle></CardHeader><CardContent className="text-2xl font-semibold tabular-nums">{acao.totais.convertidos}</CardContent></Card></div>
    {acao.situacao === "Rascunho" && <DefinicaoPublico acaoId={acao.id} criterios={acao.criterios} />}
    {acao.situacao === "Rascunho" && <PreparacaoAcao acaoId={acao.id} modelos={modelos} versaoModeloAtualId={acao.versaoModeloId} />}
    {acao.situacao !== "Rascunho" && acao.situacao !== "Cancelada" && <ExecucaoAcao acaoId={acao.id} versao={acao.versao} situacao={acao.situacao} destinatarios={acao.destinatarios} />}
    <Card className="mt-6"><CardHeader><CardTitle>Resumo técnico</CardTitle></CardHeader><CardContent className="grid gap-3 text-sm sm:grid-cols-3"><p><span className="block text-muted-foreground">Enviados</span>{acao.totais.enviados}</p><p><span className="block text-muted-foreground">Falhos</span>{acao.totais.falhos}</p><p><span className="block text-muted-foreground">Item do catálogo</span><span className="break-all font-mono text-xs">{acao.itemDeCatalogoId}</span></p></CardContent></Card>
  </>;
}
