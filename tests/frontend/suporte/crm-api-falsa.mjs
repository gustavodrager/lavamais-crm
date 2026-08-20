import http from "node:http";

const id = "6d3d0d64-a111-4cff-8db8-111111111111";
const idCriado = "7e4e1e75-b222-4cff-8db8-222222222222";
const itemCatalogoId = "6d3d0d64-a111-4cff-8db8-111111111112";
const criteriosVazios = { versaoSchema: 1, modo: "Filtros", tipoCliente: null, cidades: null, bairros: null, etiquetaIds: null, cadastradoApartirDe: null, dataNascimentoDe: null, dataNascimentoAte: null, clienteIds: null };
const acao = { id, nome: "Ação integrada de edredons", objetivo: "Validar o fluxo real", itemDeCatalogoId: "6d3d0d64-a111-4cff-8db8-111111111112", versaoModeloId: null, criterios: criteriosVazios, situacao: "EmProcessamento", dataAtualizacao: "2026-08-18T12:00:00Z", versao: 3 };
let acaoCriada = null;
const totais = { destinatarios: 12, pendentes: 0, solicitados: 0, enviados: 12, entregues: 10, lidos: 8, falhos: 2, naoInformados: 10, semRetorno: 0, responderam: 0, interessados: 0, convertidos: 2, semInteresse: 0, valorConvertido: 150 };
http.createServer((req, res) => {
  res.setHeader("content-type", "application/json");
  if (req.headers.authorization !== "Bearer token-controlado-e2e") { res.statusCode = 401; return res.end(JSON.stringify({ title: "Nao autenticado" })); }
  if (req.url === "/api/v1/itens-de-catalogo?situacao=Ativo") return res.end(JSON.stringify([{ id: itemCatalogoId, tipo: "Servico", nome: "Lavagem de edredom", descricao: null, categoria: "Casa", valorReferencia: 50, situacao: "Ativo" }]));
  if ((req.url === "/api/v1/acoes-comerciais" || req.url === "/api/v1/acoes-comerciais/") && req.method === "POST") {
    let corpo = "";
    req.on("data", (parte) => { corpo += parte; });
    return req.on("end", () => {
      const dados = JSON.parse(corpo);
      acaoCriada = { id: idCriado, nome: dados.nome, objetivo: dados.objetivo, itemDeCatalogoId: dados.itemDeCatalogoId, versaoModeloId: dados.versaoModeloId, criterios: dados.criterios, situacao: "Rascunho", dataAtualizacao: "2026-08-19T12:00:00Z", versao: 1 };
      res.statusCode = 201;
      res.end(JSON.stringify(acaoCriada));
    });
  }
  if (req.url === "/api/v1/acoes-comerciais" || req.url === "/api/v1/acoes-comerciais/") return res.end(JSON.stringify(acaoCriada ? [acaoCriada, acao] : [acao]));
  if (req.url === `/api/v1/acoes-comerciais/${idCriado}` && req.method === "PUT" && acaoCriada) {
    let corpo = "";
    req.on("data", (parte) => { corpo += parte; });
    return req.on("end", () => { acaoCriada = { ...acaoCriada, ...JSON.parse(corpo), dataAtualizacao: "2026-08-19T12:01:00Z", versao: acaoCriada.versao + 1 }; res.statusCode = 204; res.end(); });
  }
  if (req.url?.startsWith(`/api/v1/acoes-comerciais/${idCriado}/simular-publico`) && req.method === "POST") return res.end(JSON.stringify({ quantidadeEncontrada: 2, quantidadeElegivel: 1, pagina: 1, tamanhoPagina: 20, clientes: [{ clienteId: "6d3d0d64-a111-4cff-8db8-111111111113", nome: "Ana Martins", whatsapp: "+5513999999999", elegivel: true, motivoExclusao: null }, { clienteId: "6d3d0d64-a111-4cff-8db8-111111111114", nome: "Patricia Souza", whatsapp: null, elegivel: false, motivoExclusao: "SemPermissao" }] }));
  if (req.url === `/api/v1/acoes-comerciais/${id}`) return res.end(JSON.stringify({ acao, totais, destinatarios: [] }));
  if (req.url === `/api/v1/acoes-comerciais/${idCriado}` && acaoCriada) return res.end(JSON.stringify({ acao: acaoCriada, totais: { ...totais, destinatarios: 0, enviados: 0, entregues: 0, lidos: 0, falhos: 0, convertidos: 0, valorConvertido: 0 }, destinatarios: [] }));
  if (req.url === "/api/v1/clientes") return res.end(JSON.stringify({ itens: [], pagina: 1, tamanhoPagina: 20, total: 0 }));
  res.statusCode = 404; res.end(JSON.stringify({ title: "Nao encontrado" }));
}).listen(4310, "127.0.0.1");
