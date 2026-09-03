import "server-only";

export function criarUrlDaAplicacao(caminho: string, origemDaRequisicao: string) {
  const configurada = process.env.LAVAMAIS_URL_APLICACAO;
  const base = new URL(configurada ?? origemDaRequisicao);
  if (process.env.NODE_ENV === "production") {
    if (!configurada) throw new Error("LAVAMAIS_URL_APLICACAO deve ser configurada em producao.");
    if (base.protocol !== "https:") throw new Error("LAVAMAIS_URL_APLICACAO deve usar HTTPS em producao.");
  }
  return new URL(caminho, base);
}
