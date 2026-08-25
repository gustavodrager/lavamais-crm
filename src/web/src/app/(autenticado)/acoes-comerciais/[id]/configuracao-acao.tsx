"use client";

import { useState } from "react";
import type { CriteriosDeSegmentacao, OpcaoModeloDeMensagem, SimulacaoDePublico } from "@/contratos/apresentacao";
import { JornadaAcao } from "@/components/jornada-acao";
import { DefinicaoPublico } from "./definicao-publico";
import { PreparacaoAcao } from "./preparacao";

export function ConfiguracaoAcao({ acaoId, criterios, modelos, versaoModeloAtualId, simulacaoInicial, nomeItemCatalogo }: { acaoId: string; criterios: CriteriosDeSegmentacao; modelos: OpcaoModeloDeMensagem[]; versaoModeloAtualId: string | null; simulacaoInicial: SimulacaoDePublico | null; nomeItemCatalogo?: string | null }) {
  const [simulacao, setSimulacao] = useState(simulacaoInicial);
  const [modeloSelecionado, setModeloSelecionado] = useState(versaoModeloAtualId ?? "");
  const [telaAtual, setTelaAtual] = useState<"publico" | "mensagem">("publico");
  const etapaAtual = telaAtual === "publico" ? 2 : modeloSelecionado ? 4 : 3;
  return <>
    <JornadaAcao etapaAtual={etapaAtual} />
    {telaAtual === "publico" ? <DefinicaoPublico acaoId={acaoId} criterios={criterios} simulacao={simulacao} aoSimular={setSimulacao} aoAlterarFiltros={() => setSimulacao(null)} aoContinuar={() => setTelaAtual("mensagem")} /> : <PreparacaoAcao acaoId={acaoId} modelos={modelos} versaoModeloId={modeloSelecionado} aoSelecionarModelo={setModeloSelecionado} simulacao={simulacao} nomeItemCatalogo={nomeItemCatalogo} aoVoltar={() => setTelaAtual("publico")} />}
  </>;
}
