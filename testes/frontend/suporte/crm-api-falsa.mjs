import http from "node:http";

const id = "6d3d0d64-a111-4cff-8db8-111111111111";
const idCriado = "7e4e1e75-b222-4cff-8db8-222222222222";
const itemCatalogoId = "6d3d0d64-a111-4cff-8db8-111111111112";
const modeloId = "6d3d0d64-a111-4cff-8db8-111111111115";
const versaoModeloId = "6d3d0d64-a111-4cff-8db8-111111111116";
const criteriosVazios = { versaoSchema: 2, modo: "Filtros", tipoCliente: null, cidades: null, bairros: null, etiquetaIds: null, cadastradoApartirDe: null, dataNascimentoDe: null, dataNascimentoAte: null, clienteIds: null, clienteIdsExcluidos: null };
const acao = { id, nome: "Ação integrada de edredons", objetivo: "Validar o fluxo real", itemDeCatalogoId: "6d3d0d64-a111-4cff-8db8-111111111112", versaoModeloId: null, criterios: criteriosVazios, situacao: "EmProcessamento", dataAtualizacao: "2026-08-18T12:00:00Z", versao: 3 };
let acaoCriada = null;
const totais = { destinatarios: 12, pendentes: 0, aguardandoSolicitacao: 0, solicitados: 0, enviados: 12, entregues: 10, lidos: 8, falhos: 2, naoInformados: 10, semRetorno: 0, responderam: 0, interessados: 0, convertidos: 2, semInteresse: 0, valorConvertido: 150 };
let destinatarioCriado = { id: "6d3d0d64-a111-4cff-8db8-111111111118", clienteId: "6d3d0d64-a111-4cff-8db8-111111111113", nomeCliente: "Ana Martins", destino: "+5513999999999", conteudoPreVisualizacao: "Olá, Ana Martins!", situacaoEnvio: "Pendente", resultadoComercial: "NaoInformado", valorConvertido: null, dataResultadoComercial: null, codigoFalha: null, versao: 1 };
http.createServer((req, res) => {
  res.setHeader("content-type", "application/json");
  if (req.headers.authorization !== "Bearer token-controlado-e2e") { res.statusCode = 401; return res.end(JSON.stringify({ title: "Nao autenticado" })); }
  if (req.url === "/api/v1/itens-de-catalogo?situacao=Ativo" || req.url === "/api/v1/itens-de-catalogo") return res.end(JSON.stringify([{ id: itemCatalogoId, tipo: "Servico", nome: "Lavagem de edredom", descricao: null, categoria: "Casa", valorReferencia: 50, situacao: "Ativo", codigoExterno: "SRV-1" }]));
  if (req.url === "/api/v1/etiquetas") return res.end(JSON.stringify([{ id: "3bf773d6-f28c-4165-92b5-3b1b153a2c32", nome: "Cliente recorrente" }]));
  if (req.url === "/api/v1/modelos-de-mensagem") return res.end(JSON.stringify([{ id: modeloId, nome: "Oferta de serviço", canal: "Whatsapp", situacao: "Publicado", versaoAtualId: versaoModeloId, versoes: [{ id: versaoModeloId, numero: 1, conteudoPreVisualizacao: "Olá, {{nomeCliente}}! Conheça {{itemCatalogo}}.", variaveis: ["nomeCliente", "itemCatalogo"], chaveTemplateNotificacao: "oferta_servico", dataPublicacao: "2026-08-19T10:00:00Z" }] }]));
  if ((req.url === "/api/v1/acoes-comerciais" || req.url === "/api/v1/acoes-comerciais/") && req.method === "POST") {
    let corpo = "";
    req.on("data", (parte) => { corpo += parte; });
    return req.on("end", () => {
      const dados = JSON.parse(corpo);
      destinatarioCriado = { id: "6d3d0d64-a111-4cff-8db8-111111111118", clienteId: "6d3d0d64-a111-4cff-8db8-111111111113", nomeCliente: "Ana Martins", destino: "+5513999999999", conteudoPreVisualizacao: "Olá, Ana Martins!", situacaoEnvio: "Pendente", resultadoComercial: "NaoInformado", valorConvertido: null, dataResultadoComercial: null, codigoFalha: null, versao: 1 };
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
  if (req.url === `/api/v1/acoes-comerciais/${idCriado}/preparar` && req.method === "POST" && acaoCriada) { acaoCriada = { ...acaoCriada, situacao: "Preparada", versao: acaoCriada.versao + 1 }; res.statusCode = 204; return res.end(); }
  if (req.url === `/api/v1/acoes-comerciais/${idCriado}/destinatarios/${destinatarioCriado.id}/enviar` && req.method === "POST" && acaoCriada) { destinatarioCriado = { ...destinatarioCriado, situacaoEnvio: "AguardandoSolicitacao", versao: destinatarioCriado.versao + 1 }; acaoCriada = { ...acaoCriada, situacao: "EmProcessamento", versao: acaoCriada.versao + 1 }; res.statusCode = 202; return res.end(JSON.stringify({ id: destinatarioCriado.id, situacaoEnvio: destinatarioCriado.situacaoEnvio, versao: destinatarioCriado.versao })); }
  if (req.url === `/api/v1/acoes-comerciais/${idCriado}/destinatarios/${destinatarioCriado.id}/resultado` && req.method === "PUT") { let corpo = ""; req.on("data", (parte) => { corpo += parte; }); return req.on("end", () => { const dados = JSON.parse(corpo); destinatarioCriado = { ...destinatarioCriado, resultadoComercial: dados.resultado, valorConvertido: dados.valorConvertido, dataResultadoComercial: "2026-08-20T15:00:00Z", versao: destinatarioCriado.versao + 1 }; res.statusCode = 204; res.end(); }); }
  if (req.url === `/api/v1/acoes-comerciais/${id}`) return res.end(JSON.stringify({ acao, totais, destinatarios: [] }));
  if (req.url === `/api/v1/acoes-comerciais/${idCriado}` && acaoCriada) { const preparada = acaoCriada.situacao !== "Rascunho"; return res.end(JSON.stringify({ acao: acaoCriada, totais: { ...totais, destinatarios: preparada ? 1 : 0, pendentes: preparada && destinatarioCriado.situacaoEnvio === "Pendente" ? 1 : 0, aguardandoSolicitacao: preparada && destinatarioCriado.situacaoEnvio === "AguardandoSolicitacao" ? 1 : 0, enviados: 0, entregues: 0, lidos: 0, falhos: 0, convertidos: 0, valorConvertido: 0 }, destinatarios: preparada ? [destinatarioCriado] : [] })); }
  if (new URL(req.url, "http://127.0.0.1:4310").pathname === "/api/v1/clientes") return res.end(JSON.stringify({ itens: [], pagina: 1, tamanhoPagina: 20, total: 0 }));
  res.statusCode = 404; res.end(JSON.stringify({ title: "Nao encontrado" }));
}).listen(4310, "127.0.0.1");
