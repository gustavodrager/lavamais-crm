import { criarUrlDaAplicacao } from "../../../src/web/src/infraestrutura/url-aplicacao";

describe("criarUrlDaAplicacao", () => {
  const urlOriginal = process.env.LAVAMAIS_URL_APLICACAO;

  afterEach(() => {
    vi.unstubAllEnvs();
    if (urlOriginal === undefined) delete process.env.LAVAMAIS_URL_APLICACAO;
    else process.env.LAVAMAIS_URL_APLICACAO = urlOriginal;
  });

  it("recusa origem publica sem HTTPS em producao", () => {
    vi.stubEnv("NODE_ENV", "production");
    process.env.LAVAMAIS_URL_APLICACAO = "http://crm.exemplo";
    expect(() => criarUrlDaAplicacao("/entrar", "http://interno:3000")).toThrow(/HTTPS/);
  });

  it("exige origem publica explicita em producao", () => {
    vi.stubEnv("NODE_ENV", "production");
    delete process.env.LAVAMAIS_URL_APLICACAO;
    expect(() => criarUrlDaAplicacao("/entrar", "https://crm.exemplo")).toThrow(/deve ser configurada/);
  });

  it("prioriza a origem publica configurada atras do proxy", () => {
    process.env.LAVAMAIS_URL_APLICACAO = "https://crm-homologacao.exemplo";
    expect(criarUrlDaAplicacao("/entrar?erro=configuracao", "http://0.0.0.0:8080").toString())
      .toBe("https://crm-homologacao.exemplo/entrar?erro=configuracao");
  });

  it("usa a origem da requisicao quando nao existe configuracao", () => {
    delete process.env.LAVAMAIS_URL_APLICACAO;
    expect(criarUrlDaAplicacao("/entrar", "http://127.0.0.1:3000").toString())
      .toBe("http://127.0.0.1:3000/entrar");
  });
});
