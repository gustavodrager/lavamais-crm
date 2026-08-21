import { randomUUID } from "node:crypto";
import { consumirEstadoOidc, excluirSessao, obterSessao, salvarEstadoOidc, salvarSessao } from "../../../src/web/src/infraestrutura/repositorio-sessoes";

describe("repositorio de sessoes", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("mantem sessoes e consome o estado OIDC uma unica vez em desenvolvimento", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const idSessao = randomUUID(); const idEstado = randomUUID();
    const sessao = { apresentacao: { usuario: { nome: "Maria", iniciais: "MA" }, tenant: { nome: "LavaMais" } }, accessToken: "token", expiraEm: Date.now() + 60_000 };
    await salvarSessao(idSessao, sessao); await salvarEstadoOidc(idEstado, { state: "estado", nonce: "nonce", verificadorPkce: "verificador", retorno: "/clientes" });
    await expect(obterSessao(idSessao)).resolves.toEqual(sessao);
    await expect(consumirEstadoOidc(idEstado)).resolves.toMatchObject({ state: "estado", retorno: "/clientes" });
    await expect(consumirEstadoOidc(idEstado)).resolves.toBeUndefined();
    await excluirSessao(idSessao); await expect(obterSessao(idSessao)).resolves.toBeUndefined();
  });

  it("exige banco e chave de criptografia em producao", async () => {
    vi.stubEnv("NODE_ENV", "production"); vi.stubEnv("LAVAMAIS_SESSOES_DATABASE_URL", ""); vi.stubEnv("LAVAMAIS_CHAVE_CRIPTOGRAFIA_SESSAO", "");
    await expect(obterSessao(randomUUID())).rejects.toThrow(/nao configuradas/);
  });
});
