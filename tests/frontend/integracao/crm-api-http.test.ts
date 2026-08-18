import { CrmApiHttp, ErroCrmApi } from "../../../src/web/src/infraestrutura/crm-api-http";

const acao = { id: "6d3d0d64-a111-4cff-8db8-111111111111", nome: "Ação real", objetivo: null, itemDeCatalogoId: "6d3d0d64-a111-4cff-8db8-111111111112", situacao: "Rascunho", dataAtualizacao: "2026-08-18T12:00:00Z" };

describe("CrmApiHttp", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("envia o token somente no servidor e adapta a lista real", async () => {
    const requisitar = vi.fn().mockResolvedValue(new Response(JSON.stringify([acao]), { status: 200 })); vi.stubGlobal("fetch", requisitar);
    const resultado = await new CrmApiHttp("http://crm.test", async () => "segredo").listarAcoes();
    expect(resultado.itens[0]).toMatchObject({ nome: "Ação real", totalDestinatarios: null });
    expect(requisitar.mock.calls[0][1].headers.Authorization).toBe("Bearer segredo");
  });
  it.each([401, 403])("preserva o status %s da API", async (status) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: "Falha controlada" }), { status })));
    await expect(new CrmApiHttp("http://crm.test", async () => "token").listarAcoes()).rejects.toMatchObject<ErroCrmApi>({ status });
  });
  it("converte falha de rede em indisponibilidade", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("rede")));
    await expect(new CrmApiHttp("http://crm.test", async () => "token").listarAcoes()).rejects.toMatchObject({ status: 503 });
  });
});
