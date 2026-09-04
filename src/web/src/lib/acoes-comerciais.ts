import type { ResumoAcaoComercial, SituacaoAcaoComercial } from "@/contratos/apresentacao";

const situacoesPendentes = new Set<SituacaoAcaoComercial>(["Rascunho", "AguardandoAprovacao", "Preparada", "EmProcessamento"]);

const ordenarPorAtualizacao = (acoes: ResumoAcaoComercial[]) => [...acoes].sort(
  (a, b) => new Date(b.dataAtualizacao).getTime() - new Date(a.dataAtualizacao).getTime(),
);

export function selecionarAcaoPrioritaria(acoes: ResumoAcaoComercial[]) {
  const comFalhas = ordenarPorAtualizacao(acoes.filter((acao) => acao.situacao === "ConcluidaComFalhas"));
  if (comFalhas.length > 0) return comFalhas[0];
  return ordenarPorAtualizacao(acoes.filter((acao) => situacoesPendentes.has(acao.situacao)))[0] ?? null;
}

export function rotuloProximaAcao(situacao: SituacaoAcaoComercial) {
  if (situacao === "Rascunho") return "Continuar configuração";
  if (situacao === "AguardandoAprovacao") return "Analisar aprovação";
  if (situacao === "Preparada") return "Enviar mensagens";
  if (situacao === "EmProcessamento") return "Acompanhar envios";
  if (situacao === "ConcluidaComFalhas") return "Conferir falhas";
  return "Ver resultados";
}
