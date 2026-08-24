import { autenticacaoEstaDesabilitada } from "../../../src/web/src/infraestrutura/autenticacao-desenvolvimento";

describe("autenticacao de desenvolvimento", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("permite desabilitar apenas fora de producao", () => {
    vi.stubEnv("NODE_ENV", "development"); vi.stubEnv("LAVAMAIS_DESABILITAR_AUTENTICACAO", "1");
    expect(autenticacaoEstaDesabilitada()).toBe(true);
  });

  it("recusa o bypass em producao", () => {
    vi.stubEnv("NODE_ENV", "production"); vi.stubEnv("LAVAMAIS_DESABILITAR_AUTENTICACAO", "1");
    expect(() => autenticacaoEstaDesabilitada()).toThrow(/nao pode ser usada em producao/);
  });

  it("permite o modo sem autenticacao no ambiente de homologacao", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("LAVAMAIS_AMBIENTE", "Homologacao");
    vi.stubEnv("LAVAMAIS_HOMOLOGACAO_SEM_AUTENTICACAO", "1");

    expect(autenticacaoEstaDesabilitada()).toBe(true);
  });

  it("recusa o modo de homologacao em outro ambiente", () => {
    vi.stubEnv("LAVAMAIS_AMBIENTE", "Production");
    vi.stubEnv("LAVAMAIS_HOMOLOGACAO_SEM_AUTENTICACAO", "1");

    expect(() => autenticacaoEstaDesabilitada()).toThrow(/so pode ser usado em Homologacao/);
  });
});
