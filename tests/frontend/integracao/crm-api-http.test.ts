import { CrmApiHttp, ErroCrmApi } from "../../../src/web/src/infraestrutura/crm-api-http";

const criterios = { versaoSchema: 1 as const, modo: "Filtros" as const, tipoCliente: null, cidades: null, bairros: null, etiquetaIds: null, cadastradoApartirDe: null, dataNascimentoDe: null, dataNascimentoAte: null, clienteIds: null };
const acao = { id: "6d3d0d64-a111-4cff-8db8-111111111111", nome: "Ação real", objetivo: null, itemDeCatalogoId: "6d3d0d64-a111-4cff-8db8-111111111112", versaoModeloId: null, criterios, situacao: "Rascunho", dataAtualizacao: "2026-08-18T12:00:00Z", versao: 1 };

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
  it("lista somente itens ativos do catalogo", async () => {
    const requisitar = vi.fn().mockResolvedValue(new Response(JSON.stringify([{
      id: "6d3d0d64-a111-4cff-8db8-111111111112", tipo: "Servico", nome: "Lavagem de edredom",
      descricao: null, categoria: "Casa", valorReferencia: 50, situacao: "Ativo",
    }]), { status: 200 }));
    vi.stubGlobal("fetch", requisitar);
    const resultado = await new CrmApiHttp("http://crm.test", async () => "token").listarItensDeCatalogoAtivos();
    expect(resultado).toEqual([{ id: "6d3d0d64-a111-4cff-8db8-111111111112", tipo: "Servico", nome: "Lavagem de edredom", categoria: "Casa" }]);
    expect(requisitar.mock.calls[0][0].toString()).toContain("situacao=Ativo");
  });
  it("envia o contrato completo ao criar um rascunho", async () => {
    const requisitar = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: acao.id }), { status: 201 }));
    vi.stubGlobal("fetch", requisitar);
    const entrada = {
      nome: "Ação real", objetivo: "Validar a criação real",
      itemDeCatalogoId: acao.itemDeCatalogoId, versaoModeloId: null,
      criterios,
    };
    await new CrmApiHttp("http://crm.test", async () => "token").criar(entrada);
    expect(JSON.parse(requisitar.mock.calls[0][1].body)).toEqual(entrada);
  });
  it("preserva o rascunho ao atualizar critérios e simula o público", async () => {
    const simulacao = { quantidadeEncontrada: 2, quantidadeElegivel: 1, pagina: 1, tamanhoPagina: 20, clientes: [{ clienteId: "6d3d0d64-a111-4cff-8db8-111111111113", nome: "Ana", whatsapp: null, elegivel: false, motivoExclusao: "SemPermissao" }] };
    const requisitar = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ acao, totais: { destinatarios: 0, pendentes: 0, solicitados: 0, enviados: 0, entregues: 0, lidos: 0, falhos: 0, convertidos: 0, valorConvertido: 0 }, destinatarios: [] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(simulacao), { status: 200 }));
    vi.stubGlobal("fetch", requisitar);
    const api = new CrmApiHttp("http://crm.test", async () => "token");
    const novosCriterios = { ...criterios, cidades: ["Praia Grande"] };
    await api.atualizarCriterios(acao.id, novosCriterios);
    expect(JSON.parse(requisitar.mock.calls[1][1].body)).toMatchObject({ nome: acao.nome, itemDeCatalogoId: acao.itemDeCatalogoId, criterios: novosCriterios });
    await expect(api.simularPublico(acao.id)).resolves.toEqual(simulacao);
    expect(requisitar.mock.calls[2][0].toString()).toContain("simular-publico?pagina=1&tamanhoPagina=20");
  });
  it("lista somente a versão atual de modelos publicados", async () => {
    const versaoId = "6d3d0d64-a111-4cff-8db8-111111111116";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify([{ id: "6d3d0d64-a111-4cff-8db8-111111111115", nome: "Oferta", canal: "Whatsapp", situacao: "Publicado", versaoAtualId: versaoId, versoes: [{ id: versaoId, numero: 2, conteudoPreVisualizacao: "Olá!", variaveis: [], chaveTemplateNotificacao: "oferta", dataPublicacao: "2026-08-19T10:00:00Z" }] }, { id: "6d3d0d64-a111-4cff-8db8-111111111117", nome: "Rascunho", canal: "Whatsapp", situacao: "Rascunho", versaoAtualId: null, versoes: [] }]), { status: 200 })));
    await expect(new CrmApiHttp("http://crm.test", async () => "token").listarModelosPublicados()).resolves.toEqual([{ modeloId: "6d3d0d64-a111-4cff-8db8-111111111115", versaoId, nome: "Oferta", numeroVersao: 2, canal: "Whatsapp", conteudoPreVisualizacao: "Olá!", variaveis: [] }]);
  });
  it("envia a versão de concorrência ao preparar", async () => {
    const requisitar = vi.fn().mockResolvedValue(new Response(null, { status: 204 })); vi.stubGlobal("fetch", requisitar);
    await new CrmApiHttp("http://crm.test", async () => "token").preparar(acao.id, 4);
    expect(JSON.parse(requisitar.mock.calls[0][1].body)).toEqual({ versao: 4 });
  });
  it("envia a versão de concorrência ao iniciar", async () => {
    const requisitar = vi.fn().mockResolvedValue(new Response(null, { status: 204 })); vi.stubGlobal("fetch", requisitar);
    await new CrmApiHttp("http://crm.test", async () => "token").iniciar(acao.id, 5);
    expect(requisitar.mock.calls[0][0].toString()).toContain("/iniciar");
    expect(JSON.parse(requisitar.mock.calls[0][1].body)).toEqual({ versao: 5 });
  });
});
