import "server-only";

export function autenticacaoEstaDesabilitada() {
  if (process.env.LAVAMAIS_HOMOLOGACAO_SEM_AUTENTICACAO === "1") {
    if (process.env.LAVAMAIS_AMBIENTE !== "Homologacao") throw new Error("O modo sem autenticacao so pode ser usado em Homologacao.");
    return true;
  }
  if (process.env.LAVAMAIS_DESABILITAR_AUTENTICACAO === "1") {
    if (process.env.NODE_ENV === "production") throw new Error("LAVAMAIS_DESABILITAR_AUTENTICACAO nao pode ser usada em producao.");
    return true;
  }
  return false;
}

export function obterAccessTokenDesenvolvimento() {
  if (!autenticacaoEstaDesabilitada()) return null;
  if (process.env.LAVAMAIS_HOMOLOGACAO_SEM_AUTENTICACAO === "1") return "homologacao-sem-autenticacao";
  if (process.env.LAVAMAIS_AMBIENTE_TESTE === "1") return "token-controlado-e2e";
  return process.env.LAVAMAIS_ACCESS_TOKEN_DESENVOLVIMENTO ?? null;
}
