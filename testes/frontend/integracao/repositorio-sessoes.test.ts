import { randomUUID } from "node:crypto";
import { excluirSessao, obterSessao, salvarSessao } from "../../../src/web/src/infraestrutura/repositorio-sessoes";

describe("repositorio de sessoes", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("mantem e exclui sessoes em desenvolvimento", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const idSessao = randomUUID();
    const sessao = { apresentacao: { usuario: { nome: "Maria", iniciais: "MA" }, tenant: { nome: "LavaMais" } }, accessToken: "token", expiraEm: Date.now() + 60_000 };
    await salvarSessao(idSessao, sessao);
    await expect(obterSessao(idSessao)).resolves.toEqual(sessao);
    await excluirSessao(idSessao); await expect(obterSessao(idSessao)).resolves.toBeUndefined();
  });

  it("remove da memoria uma sessao expirada", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const idSessao = randomUUID();
    await salvarSessao(idSessao, { apresentacao: { usuario: { nome: "Maria", iniciais: "MA" }, tenant: { nome: "LavaMais" } }, accessToken: "token", expiraEm: Date.now() - 1 });
    await expect(obterSessao(idSessao)).resolves.toBeUndefined();
  });

  it("exige banco e chave de criptografia em producao", async () => {
    vi.stubEnv("NODE_ENV", "production"); vi.stubEnv("LAVAMAIS_SESSOES_DATABASE_URL", ""); vi.stubEnv("LAVAMAIS_CHAVE_CRIPTOGRAFIA_SESSAO", "");
    await expect(obterSessao(randomUUID())).rejects.toThrow(/nao configuradas/);
  });
});
