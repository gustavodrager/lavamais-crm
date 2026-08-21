import "server-only";

export function criarUrlDaAplicacao(caminho: string, origemDaRequisicao: string) {
  return new URL(caminho, process.env.LAVAMAIS_URL_APLICACAO ?? origemDaRequisicao);
}
