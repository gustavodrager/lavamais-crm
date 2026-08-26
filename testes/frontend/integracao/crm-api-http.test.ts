import { CrmApiHttp, ErroCrmApi } from "../../../src/web/src/infraestrutura/crm-api-http";

const criterios = { versaoSchema: 2 as const, modo: "Filtros" as const, tipoCliente: null, cidades: null, bairros: null, etiquetaIds: null, cadastradoApartirDe: null, dataNascimentoDe: null, dataNascimentoAte: null, clienteIds: null, clienteIdsExcluidos: null };
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
  it("lista ofertas do catalogo de lavanderia e envia movimentacao com linhas", async () => {
    const oferta = { id: "1d3d0d64-a111-4cff-8db8-111111111112", artigoDeLavanderiaId: "2d3d0d64-a111-4cff-8db8-111111111112", nomeArtigo: "Camisa", categoria: "Vestuario", servicoDeLavanderiaId: "3d3d0d64-a111-4cff-8db8-111111111112", nomeServico: "Lavagem e passadoria", precoUnitario: 16.2, situacao: "Ativo", versao: 1 };
    const requisitar = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify([oferta]), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: acao.id }), { status: 201 }));
    vi.stubGlobal("fetch", requisitar);
    const api = new CrmApiHttp("http://crm.test", async () => "token");

    await expect(api.listarOfertasDoCatalogoDeLavanderia()).resolves.toEqual([{ id: oferta.id, artigoDeLavanderiaId: oferta.artigoDeLavanderiaId, nomeArtigo: oferta.nomeArtigo, categoria: oferta.categoria, servicoDeLavanderiaId: oferta.servicoDeLavanderiaId, nomeServico: oferta.nomeServico, precoUnitario: oferta.precoUnitario }]);
    const entrada = { clienteId: "4d3d0d64-a111-4cff-8db8-111111111112", linhas: [{ ofertaDeServicoId: oferta.id, quantidade: 2, precoUnitario: null }], dataMovimentacao: null, codigoExterno: null, observacao: null };
    await api.registrarMovimentacao(entrada);
    expect(requisitar.mock.calls[0][0].toString()).toBe("http://crm.test/api/v1/catalogo-lavanderia/ofertas");
    expect(requisitar.mock.calls[1][0].toString()).toBe("http://crm.test/api/v1/movimentacoes-comerciais");
    expect(JSON.parse(requisitar.mock.calls[1][1].body)).toEqual(entrada);
    expect(requisitar.mock.calls[1][1].body).not.toContain("tenantId");
    expect(requisitar.mock.calls[1][1].body).not.toContain("valorTotal");
  });
  it("adapta o contrato real de clientes sem depender de etiquetas expandidas", async () => {
    const requisitar = vi.fn().mockResolvedValue(new Response(JSON.stringify({ itens: [{ id: "6d3d0d64-a111-4cff-8db8-111111111113", nome: "Ana", nomeFantasia: null, whatsapp: "5513999999999", email: null, dataNascimento: null, tipo: "Residencial", situacao: "Ativo", permiteMarketingWhatsapp: true, endereco: { logradouro: null, numero: null, complemento: null, bairro: "Centro", cidade: "Praia Grande", estado: null, cep: null }, etiquetaIds: ["6d3d0d64-a111-4cff-8db8-111111111119"], codigoExterno: "CLI-1" }], pagina: 1, tamanhoPagina: 20, total: 1 }), { status: 200 }));
    vi.stubGlobal("fetch", requisitar);
    const resultado = await new CrmApiHttp("http://crm.test", async () => "token").listarClientes();
    expect(resultado.itens[0]).toEqual({ id: "6d3d0d64-a111-4cff-8db8-111111111113", nome: "Ana", whatsapp: "5513999999999", localidade: "Centro · Praia Grande", quantidadeEtiquetas: 1, permiteWhatsapp: true, temEnderecoOperacional: false, situacao: "Ativo", codigoExterno: "CLI-1" });
    expect(requisitar.mock.calls[0][0].toString()).toBe("http://crm.test/api/v1/clientes?pagina=1&tamanhoPagina=20");
  });
  it("envia o mapeamento da pre-visualizacao na query exigida pela API", async () => {
    const requisitar = vi.fn().mockResolvedValue(new Response(JSON.stringify({ referenciaArquivo: "6d3d0d64-a111-4cff-8db8-111111111120", colunas: ["nome", "whatsapp"], totalLinhas: 1, amostra: [] }), { status: 200 }));
    vi.stubGlobal("fetch", requisitar);
    const arquivo = new File(["nome,whatsapp\nAna,5513999999999"], "clientes.csv", { type: "text/csv" });
    await new CrmApiHttp("http://crm.test", async () => "token").preVisualizarImportacao(arquivo);
    const url = new URL(requisitar.mock.calls[0][0].toString());
    expect(url.pathname).toBe("/api/v1/importacoes/clientes/pre-visualizar");
    expect(JSON.parse(url.searchParams.get("mapeamento") ?? "null")).toMatchObject({
      nome: "nome",
      whatsapp: "whatsapp",
      permiteMarketingWhatsapp: "permiteMarketingWhatsapp",
      permiteMarketingWhatsappPadrao: false,
    });
    expect(requisitar.mock.calls[0][1].body).toBeInstanceOf(FormData);
    expect((requisitar.mock.calls[0][1].body as FormData).has("mapeamento")).toBe(false);
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
      .mockResolvedValueOnce(new Response(JSON.stringify({ acao, totais: { destinatarios: 0, pendentes: 0, aguardandoSolicitacao: 0, solicitados: 0, enviados: 0, entregues: 0, lidos: 0, falhos: 0, naoInformados: 0, semRetorno: 0, responderam: 0, interessados: 0, convertidos: 0, semInteresse: 0, valorConvertido: 0 }, destinatarios: [] }), { status: 200 }))
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
  it("envia somente um destinatário com a versão de concorrência", async () => {
    const destinatarioId = "6d3d0d64-a111-4cff-8db8-111111111118";
    const resposta = { id: destinatarioId, situacaoEnvio: "AguardandoSolicitacao", versao: 6 };
    const requisitar = vi.fn().mockResolvedValue(new Response(JSON.stringify(resposta), { status: 202 })); vi.stubGlobal("fetch", requisitar);
    await expect(new CrmApiHttp("http://crm.test", async () => "token").enviarDestinatario(acao.id, destinatarioId, 5)).resolves.toEqual(resposta);
    expect(requisitar.mock.calls[0][0].toString()).toContain(`/destinatarios/${destinatarioId}/enviar`);
    expect(JSON.parse(requisitar.mock.calls[0][1].body)).toEqual({ versao: 5 });
  });
  it("registra resultado comercial sem expor credenciais", async () => {
    const requisitar = vi.fn().mockResolvedValue(new Response(null, { status: 204 })); vi.stubGlobal("fetch", requisitar);
    await new CrmApiHttp("http://crm.test", async () => "token").registrarResultado(acao.id, "6d3d0d64-a111-4cff-8db8-111111111118", "Convertido", 149.9, 3);
    expect(requisitar.mock.calls[0][0].toString()).toContain("/resultado");
    expect(JSON.parse(requisitar.mock.calls[0][1].body)).toEqual({ resultado: "Convertido", valorConvertido: 149.9, versao: 3 });
  });
  it("envia a versão e suporta o replanejamento da parada", async () => {
    const requisitar = vi.fn().mockResolvedValue(new Response(null, { status: 204 })); vi.stubGlobal("fetch", requisitar);
    const api = new CrmApiHttp("http://crm.test", async () => "token");
    await api.adicionarParada("6d3d0d64-a111-4cff-8db8-111111111111", { clienteId: "6d3d0d64-a111-4cff-8db8-111111111112", tipo: "Coleta", periodo: "Manhã", observacao: null, versao: 7 });
    await api.adiarParada("6d3d0d64-a111-4cff-8db8-111111111113", 8);
    expect(JSON.parse(requisitar.mock.calls[0][1].body)).toMatchObject({ versao: 7, tipo: "Coleta" });
    expect(requisitar.mock.calls[1][0].toString()).toContain("/paradas/6d3d0d64-a111-4cff-8db8-111111111113/adiar");
    expect(JSON.parse(requisitar.mock.calls[1][1].body)).toEqual({ versao: 8 });
  });
});
