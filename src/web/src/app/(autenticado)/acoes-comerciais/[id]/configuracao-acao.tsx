"use client";

import { useState } from "react";
import type { CriteriosDeSegmentacao, OpcaoModeloDeMensagem, SimulacaoDePublico } from "@/contratos/apresentacao";
import { JornadaAcao } from "@/components/jornada-acao";
import { DefinicaoPublico } from "./definicao-publico";
import { PreparacaoAcao } from "./preparacao";

export function ConfiguracaoAcao({ acaoId, criterios, modelos, versaoModeloAtualId, simulacaoInicial }: { acaoId: string; criterios: CriteriosDeSegmentacao; modelos: OpcaoModeloDeMensagem[]; versaoModeloAtualId: string | null; simulacaoInicial: SimulacaoDePublico | null }) {
  const [simulacao, setSimulacao] = useState(simulacaoInicial);
  const [modeloSelecionado, setModeloSelecionado] = useState(versaoModeloAtualId ?? "");
  const etapaAtual = !simulacao ? 2 : !modeloSelecionado ? 3 : 4;
  return <>
    <JornadaAcao etapaAtual={etapaAtual} />
    <DefinicaoPublico acaoId={acaoId} criterios={criterios} simulacao={simulacao} aoSimular={setSimulacao} aoAlterarFiltros={() => setSimulacao(null)} />
    <PreparacaoAcao acaoId={acaoId} modelos={modelos} versaoModeloId={modeloSelecionado} aoSelecionarModelo={setModeloSelecionado} simulacao={simulacao} />
  </>;
}
