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
import { obterPortaSessao } from "@/infraestrutura/obter-porta-sessao";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CancelarAcao } from "./cancelar-acao";
import { EditarInformacoesAcao } from "./editar-informacoes-acao";

export default async function DetalheAcao({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let acao;
  try { acao = await obterPortaCrmApi().obter(id); }
  catch (erro) { if (erro instanceof ErroCrmApi) return <><CabecalhoPagina titulo="Detalhe da Ação Comercial" descricao="Acompanhe a preparação, a entrega e o resultado comercial." /><EstadoFalhaApi status={erro.status} /></>; throw erro; }
  if (!acao) notFound();
  const sessao = await obterPortaSessao().obterSessao();
  const rascunho = acao.situacao === "Rascunho";
  const temFiltrosSalvos = Boolean(acao.criterios.tipoCliente || acao.criterios.cidades?.length || acao.criterios.bairros?.length || acao.criterios.cadastradoApartirDe || acao.criterios.clienteIds?.length || acao.criterios.clienteIdsExcluidos?.length);
  const rascunhoGerenciavel = rascunho && sessao?.papel !== "Operador";
  const [modelos, simulacaoInicial, itensCatalogo] = rascunhoGerenciavel ? await Promise.all([
    obterPortaCrmApi().listarModelosPublicados(),
    temFiltrosSalvos ? obterPortaCrmApi().simularPublico(acao.id, 1, 10) : Promise.resolve(null),
    obterPortaCrmApi().listarItensDeCatalogoAtivos(),
  ]) : [[], null, []];
  const nomeItemCatalogo = itensCatalogo.find((item) => item.id === acao.itemDeCatalogoId)?.nome ?? null;
  const podeCancelar = (acao.situacao === "Rascunho" || acao.situacao === "Preparada") && sessao?.papel !== "Operador";
  const exibeExecucao = acao.situacao !== "Rascunho" && acao.situacao !== "Cancelada";
  const priorizaEnvio = acao.situacao === "Preparada" || acao.situacao === "EmProcessamento";
  const blocoExecucao = exibeExecucao ? <ExecucaoAcao acaoId={acao.id} situacao={acao.situacao} destinatarios={acao.destinatarios} envioHabilitado={process.env.LAVAMAIS_ENVIO_NOTIFICACOES_HABILITADO === "1"} /> : null;
  const conteudo = rascunho && sessao?.papel === "Operador"
    ? <Card><CardContent className="p-5"><Alert><AlertTitle>Ação em rascunho</AlertTitle><AlertDescription>O gerente ainda está preparando esta ação. Você poderá acompanhar os destinatários e registrar resultados quando ela estiver pronta.</AlertDescription></Alert></CardContent></Card>
    : rascunho
      ? <><EditarInformacoesAcao acaoId={acao.id} nomeInicial={acao.nome} objetivoInicial={acao.objetivo} itemInicial={acao.itemDeCatalogoId} itens={itensCatalogo} /><ConfiguracaoAcao acaoId={acao.id} criterios={acao.criterios} modelos={modelos} versaoModeloAtualId={acao.versaoModeloId} simulacaoInicial={simulacaoInicial} nomeItemCatalogo={nomeItemCatalogo} /></>
      : <><JornadaAcao etapaAtual={4} />{priorizaEnvio && blocoExecucao}<ResumoAcao acao={acao} />{!priorizaEnvio && blocoExecucao}</>;
  return <><CabecalhoPagina titulo={acao.nome} descricao={acao.objetivo ?? "Acompanhe a preparação, a entrega e o resultado comercial."} acao={<div className="flex items-center gap-2"><SituacaoAcao situacao={acao.situacao} />{podeCancelar && <CancelarAcao acaoId={acao.id} versao={acao.versao} />}</div>} />
    {acao.situacao === "EmProcessamento" && <AtualizacaoAutomatica />}
    {conteudo}
  </>;
}
