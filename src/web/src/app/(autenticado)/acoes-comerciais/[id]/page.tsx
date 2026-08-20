import { notFound } from "next/navigation";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { EstadoFalhaApi } from "@/components/estado-falha-api";
import { SituacaoAcao } from "@/components/situacao-acao";
import { ErroCrmApi } from "@/infraestrutura/crm-api-http";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";
import { DefinicaoPublico } from "./definicao-publico";
import { PreparacaoAcao } from "./preparacao";
import { ExecucaoAcao } from "./execucao";
import { ResumoAcao } from "./resumo-acao";
import { AtualizacaoAutomatica } from "./atualizacao-automatica";

export default async function DetalheAcao({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let acao;
  try { acao = await obterPortaCrmApi().obter(id); }
  catch (erro) { if (erro instanceof ErroCrmApi) return <><CabecalhoPagina titulo="Detalhe da Ação Comercial" descricao="Acompanhe a preparação, a entrega e o resultado comercial." /><EstadoFalhaApi status={erro.status} /></>; throw erro; }
  if (!acao) notFound();
  const modelos = acao.situacao === "Rascunho" ? await obterPortaCrmApi().listarModelosPublicados() : [];
  return <><CabecalhoPagina titulo={acao.nome} descricao={acao.objetivo ?? "Acompanhe a preparação, a entrega e o resultado comercial."} acao={<SituacaoAcao situacao={acao.situacao} />} />
    {acao.situacao === "EmProcessamento" && <AtualizacaoAutomatica />}
    <ResumoAcao acao={acao} />
    {acao.situacao === "Rascunho" && <DefinicaoPublico acaoId={acao.id} criterios={acao.criterios} />}
    {acao.situacao === "Rascunho" && <PreparacaoAcao acaoId={acao.id} modelos={modelos} versaoModeloAtualId={acao.versaoModeloId} />}
    {acao.situacao !== "Rascunho" && acao.situacao !== "Cancelada" && <ExecucaoAcao acaoId={acao.id} versao={acao.versao} situacao={acao.situacao} destinatarios={acao.destinatarios} />}
  </>;
}
