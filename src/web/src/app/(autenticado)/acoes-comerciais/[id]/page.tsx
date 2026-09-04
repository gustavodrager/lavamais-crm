import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { EstadoFalhaApi } from "@/components/estado-falha-api";
import { SituacaoAcao } from "@/components/situacao-acao";
import { ErroCrmApi } from "@/infraestrutura/crm-api-http";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";
import { ExecucaoAcaoWhatsappWeb } from "./execucao-whatsapp-web";
import { ResumoAcao } from "./resumo-acao";
import { ConfiguracaoAcao } from "./configuracao-acao";
import { JornadaAcao } from "@/components/jornada-acao";
import { obterPortaSessao } from "@/infraestrutura/obter-porta-sessao";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CancelarAcao } from "./cancelar-acao";
import { EditarInformacoesAcao } from "./editar-informacoes-acao";
import { papelDaVisao } from "@/lib/sessao-apresentacao";
import { AprovacaoAcao } from "./aprovacao-acao";

export default async function DetalheAcao({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const api = obterPortaCrmApi();
  let acao;
  try { acao = await api.obter(id); }
  catch (erro) { if (erro instanceof ErroCrmApi) return <><CabecalhoPagina titulo="Detalhe da Ação Comercial" descricao="Acompanhe a preparação, os envios confirmados e o resultado comercial." /><EstadoFalhaApi status={erro.status} /></>; throw erro; }
  if (!acao) notFound();
  const sessao = await obterPortaSessao().obterSessao();
  const papelVisualizado = papelDaVisao(sessao);
  const modoOperador = papelVisualizado === "Operador";
  const rascunho = acao.situacao === "Rascunho";
  const temFiltrosSalvos = Boolean(acao.criterios.tipoCliente || acao.criterios.cidades?.length || acao.criterios.bairros?.length || acao.criterios.cadastradoApartirDe || acao.criterios.clienteIds?.length || acao.criterios.clienteIdsExcluidos?.length);
  const rascunhoGerenciavel = rascunho && papelVisualizado !== "Operador";
  const [modelos, simulacaoInicial, itensCatalogo] = rascunhoGerenciavel ? await Promise.all([
    api.listarModelosPublicados(),
    temFiltrosSalvos ? api.simularPublico(acao.id, 1, 10) : Promise.resolve(null),
    api.listarItensDeCatalogoAtivos(),
  ]) : [[], null, []];
  const nomeItemCatalogo = itensCatalogo.find((item) => item.id === acao.itemDeCatalogoId)?.nome ?? null;
  const podeCancelar = (acao.situacao === "Rascunho" || acao.situacao === "AguardandoAprovacao" || acao.situacao === "Preparada") && papelVisualizado !== "Operador";
  const exibeExecucao = ["Preparada", "EmProcessamento", "Concluida", "ConcluidaComFalhas"].includes(acao.situacao);
  const blocoExecucao = exibeExecucao ? <ExecucaoAcaoWhatsappWeb acaoId={acao.id} situacao={acao.situacao} destinatarios={acao.destinatarios} modoOperador={modoOperador} /> : null;
  const conteudo = rascunho && modoOperador
    ? <Card><CardContent className="p-5"><Alert><AlertTitle>Ação em rascunho</AlertTitle><AlertDescription>O gerente ainda está preparando esta ação. Você poderá acompanhar os destinatários e registrar resultados quando ela estiver pronta.</AlertDescription></Alert></CardContent></Card>
    : rascunho
      ? <><EditarInformacoesAcao acaoId={acao.id} nomeInicial={acao.nome} objetivoInicial={acao.objetivo} itemInicial={acao.itemDeCatalogoId} itens={itensCatalogo} /><ConfiguracaoAcao acaoId={acao.id} criterios={acao.criterios} modelos={modelos} versaoModeloAtualId={acao.versaoModeloId} simulacaoInicial={simulacaoInicial} nomeItemCatalogo={nomeItemCatalogo} /></>
      : acao.situacao === "AguardandoAprovacao" && !modoOperador
        ? <><JornadaAcao etapaAtual={3} /><AprovacaoAcao acaoId={acao.id} versao={acao.versao} /></>
      : modoOperador
        ? blocoExecucao ?? <Card><CardContent className="p-5"><Alert><AlertTitle>Ação ainda não liberada</AlertTitle><AlertDescription>O gerente precisa aprovar esta ação antes que os atendimentos apareçam na sua fila.</AlertDescription></Alert></CardContent></Card>
        : exibeExecucao
          ? <><JornadaAcao etapaAtual={4} />{blocoExecucao}<ResumoAcao acao={acao} /></>
          : <Card><CardContent className="p-5"><Alert><AlertTitle>Ação {acao.situacao === "Rejeitada" ? "rejeitada" : "encerrada"}</AlertTitle><AlertDescription>Esta ação não está disponível para atendimento.</AlertDescription></Alert></CardContent></Card>;
  return <><CabecalhoPagina titulo={acao.nome} descricao={acao.objetivo ?? "Acompanhe a preparação, os envios confirmados e o resultado comercial."} acao={<div className="flex flex-wrap items-center gap-2">{modoOperador && <Button asChild variant="outline"><Link href="/acoes-comerciais"><ArrowLeft />Voltar à fila</Link></Button>}<SituacaoAcao situacao={acao.situacao} />{podeCancelar && <CancelarAcao acaoId={acao.id} versao={acao.versao} />}</div>} />
    {conteudo}
  </>;
}
