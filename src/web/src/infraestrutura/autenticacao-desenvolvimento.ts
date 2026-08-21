import "server-only";

export function autenticacaoEstaDesabilitada() {
  if (process.env.LAVAMAIS_DESABILITAR_AUTENTICACAO !== "1") return false;
  if (process.env.NODE_ENV === "production") throw new Error("LAVAMAIS_DESABILITAR_AUTENTICACAO nao pode ser usada em producao.");
  return true;
}

export function obterAccessTokenDesenvolvimento() {
  if (!autenticacaoEstaDesabilitada()) return null;
  if (process.env.LAVAMAIS_AMBIENTE_TESTE === "1") return "token-controlado-e2e";
  return process.env.LAVAMAIS_ACCESS_TOKEN_DESENVOLVIMENTO ?? null;
}
