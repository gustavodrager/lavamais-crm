import { criarUrlDaAplicacao } from "../../../src/web/src/infraestrutura/url-aplicacao";

describe("criarUrlDaAplicacao", () => {
  const urlOriginal = process.env.LAVAMAIS_URL_APLICACAO;

  afterEach(() => {
    if (urlOriginal === undefined) delete process.env.LAVAMAIS_URL_APLICACAO;
    else process.env.LAVAMAIS_URL_APLICACAO = urlOriginal;
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
