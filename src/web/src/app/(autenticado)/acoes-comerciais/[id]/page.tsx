import { notFound } from "next/navigation";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { EstadoFalhaApi } from "@/components/estado-falha-api";
import { SituacaoAcao } from "@/components/situacao-acao";
import { ErroCrmApi } from "@/infraestrutura/crm-api-http";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";
import { ExecucaoAcao } from "./execucao";
import { ResumoAcao } from "./resumo-acao";
import { AtualizacaoAutomatica } from "./atualizacao-automatica";
import { ConfiguracaoAcao } from "./configuracao-acao";
import { JornadaAcao } from "@/components/jornada-acao";

export default async function DetalheAcao({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let acao;
  try { acao = await obterPortaCrmApi().obter(id); }
  catch (erro) { if (erro instanceof ErroCrmApi) return <><CabecalhoPagina titulo="Detalhe da Ação Comercial" descricao="Acompanhe a preparação, a entrega e o resultado comercial." /><EstadoFalhaApi status={erro.status} /></>; throw erro; }
  if (!acao) notFound();
  const rascunho = acao.situacao === "Rascunho";
  const temFiltrosSalvos = Boolean(acao.criterios.tipoCliente || acao.criterios.cidades?.length || acao.criterios.bairros?.length || acao.criterios.cadastradoApartirDe || acao.criterios.clienteIds?.length || acao.criterios.clienteIdsExcluidos?.length);
  const [modelos, simulacaoInicial] = rascunho ? await Promise.all([
    obterPortaCrmApi().listarModelosPublicados(),
    temFiltrosSalvos ? obterPortaCrmApi().simularPublico(acao.id) : Promise.resolve(null),
  ]) : [[], null];
  return <><CabecalhoPagina titulo={acao.nome} descricao={acao.objetivo ?? "Acompanhe a preparação, a entrega e o resultado comercial."} acao={<SituacaoAcao situacao={acao.situacao} />} />
    {acao.situacao === "EmProcessamento" && <AtualizacaoAutomatica />}
    {rascunho ? <ConfiguracaoAcao acaoId={acao.id} criterios={acao.criterios} modelos={modelos} versaoModeloAtualId={acao.versaoModeloId} simulacaoInicial={simulacaoInicial} /> : <><JornadaAcao etapaAtual={5} /><ResumoAcao acao={acao} /></>}
    {acao.situacao !== "Rascunho" && acao.situacao !== "Cancelada" && <ExecucaoAcao acaoId={acao.id} situacao={acao.situacao} destinatarios={acao.destinatarios} envioHabilitado={process.env.LAVAMAIS_ENVIO_NOTIFICACOES_HABILITADO === "1"} />}
  </>;
}
