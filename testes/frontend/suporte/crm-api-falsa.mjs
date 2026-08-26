import http from "node:http";

const id = "6d3d0d64-a111-4cff-8db8-111111111111";
const idCriado = "7e4e1e75-b222-4cff-8db8-222222222222";
const itemCatalogoId = "6d3d0d64-a111-4cff-8db8-111111111112";
const modeloId = "6d3d0d64-a111-4cff-8db8-111111111115";
const versaoModeloId = "6d3d0d64-a111-4cff-8db8-111111111116";
const criteriosVazios = { versaoSchema: 2, modo: "Filtros", tipoCliente: null, cidades: null, bairros: null, etiquetaIds: null, cadastradoApartirDe: null, dataNascimentoDe: null, dataNascimentoAte: null, clienteIds: null, clienteIdsExcluidos: null };
const acao = { id, nome: "Ação integrada de edredons", objetivo: "Validar o fluxo real", itemDeCatalogoId: "6d3d0d64-a111-4cff-8db8-111111111112", versaoModeloId: null, criterios: criteriosVazios, situacao: "EmProcessamento", dataAtualizacao: "2026-08-18T12:00:00Z", versao: 3 };
let acaoCriada = null;
const totais = { destinatarios: 12, pendentes: 0, aguardandoSolicitacao: 0, solicitados: 0, enviados: 2, entregues: 2, lidos: 6, falhos: 2, naoInformados: 6, semRetorno: 2, responderam: 0, interessados: 2, convertidos: 2, semInteresse: 0, valorConvertido: 150 };
let destinatarioCriado = { id: "6d3d0d64-a111-4cff-8db8-111111111118", clienteId: "6d3d0d64-a111-4cff-8db8-111111111113", nomeCliente: "Ana Martins", destino: "+5513999999999", conteudoPreVisualizacao: "Olá, Ana Martins!", situacaoEnvio: "Pendente", resultadoComercial: "NaoInformado", valorConvertido: null, dataResultadoComercial: null, codigoFalha: null, versao: 1 };
const dataHoje = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const [anoHoje, mesHoje, diaHoje] = dataHoje.split("-").map(Number);
const dataAmanha = new Date(Date.UTC(anoHoje, mesHoje - 1, diaHoje + 1)).toISOString().slice(0, 10);
const configuracoesDestinatarios = [
  ["Falhou", "NaoInformado", null, null, "falha_provedor"], ["Falhou", "NaoInformado", null, null, "destino_invalido"],
  ["Enviado", "NaoInformado", null, null, null], ["Enviado", "NaoInformado", null, null, null],
  ["Entregue", "NaoInformado", null, null, null], ["Entregue", "NaoInformado", null, null, null],
  ["Lido", "Interessado", `${dataHoje}T15:00:00Z`, null, null], ["Lido", "Interessado", `${dataHoje}T15:00:00Z`, null, null],
  ["Lido", "Convertido", `${dataHoje}T15:00:00Z`, 100, null], ["Lido", "Convertido", `${dataHoje}T15:00:00Z`, 50, null],
  ["Lido", "SemRetorno", `${dataHoje}T15:00:00Z`, null, null], ["Lido", "SemRetorno", `${dataHoje}T15:00:00Z`, null, null],
];
const destinatariosIntegrados = configuracoesDestinatarios.map(([situacaoEnvio, resultadoComercial, dataResultadoComercial, valorConvertido, codigoFalha], indice) => ({
  id: `6d3d0d64-a111-4cff-8db8-${String(200 + indice).padStart(12, "0")}`,
  clienteId: `6d3d0d64-a111-4cff-8db8-${String(300 + indice).padStart(12, "0")}`,
  nomeCliente: `Cliente ${indice + 1}`,
  destino: `+551399999${String(indice).padStart(3, "0")}`,
  conteudoPreVisualizacao: `Olá, Cliente ${indice + 1}!`, situacaoEnvio, resultadoComercial,
  valorConvertido, dataResultadoComercial, codigoFalha, versao: 1,
}));
const roteiroHoje = { id: "8d3d0d64-a111-4cff-8db8-111111111111", data: dataHoje, nomeMotorista: "Carlos", situacao: "EmAndamento", versao: 3, paradas: [
  { id: "8d3d0d64-a111-4cff-8db8-111111111112", clienteId: "6d3d0d64-a111-4cff-8db8-111111111113", nomeCliente: "Ana Martins", whatsapp: "5513999999999", enderecoCompleto: "Av. Presidente Kennedy, 1240", tipo: "Entrega", periodo: "10h–12h", observacao: null, ordem: 1, situacao: "Concluida", motivoNaoRealizacao: null, dataInicio: `${dataHoje}T13:00:00Z`, dataConclusao: `${dataHoje}T14:00:00Z` },
  { id: "8d3d0d64-a111-4cff-8db8-111111111113", clienteId: "6d3d0d64-a111-4cff-8db8-111111111114", nomeCliente: "Maria Helena Costa", whatsapp: "5513988888888", enderecoCompleto: "Rua das Acácias, 88", tipo: "Coleta", periodo: "14h–16h", observacao: null, ordem: 2, situacao: "EmDeslocamento", motivoNaoRealizacao: null, dataInicio: `${dataHoje}T16:00:00Z`, dataConclusao: null },
  { id: "8d3d0d64-a111-4cff-8db8-111111111114", clienteId: "6d3d0d64-a111-4cff-8db8-111111111115", nomeCliente: "João Pereira", whatsapp: "5513977777777", enderecoCompleto: "Av. Brasil, 350", tipo: "Entrega", periodo: "16h–18h", observacao: null, ordem: 3, situacao: "Pendente", motivoNaoRealizacao: null, dataInicio: null, dataConclusao: null },
] };
const roteiroAmanha = { id: "8d3d0d64-a111-4cff-8db8-222222222221", data: dataAmanha, nomeMotorista: "Carlos", situacao: "EmPreparacao", versao: 1, paradas: [
  { id: "8d3d0d64-a111-4cff-8db8-222222222222", clienteId: "6d3d0d64-a111-4cff-8db8-111111111116", nomeCliente: "Fernanda Lima", whatsapp: "5513966666666", enderecoCompleto: "Rua Iporanga, 45", tipo: "Coleta", periodo: "8h–10h", observacao: null, ordem: 1, situacao: "Pendente", motivoNaoRealizacao: null, dataInicio: null, dataConclusao: null },
  { id: "8d3d0d64-a111-4cff-8db8-222222222223", clienteId: "6d3d0d64-a111-4cff-8db8-111111111117", nomeCliente: "Paulo Mendes", whatsapp: "5513955555555", enderecoCompleto: "Av. Paris, 210", tipo: "Entrega", periodo: "10h–12h", observacao: null, ordem: 2, situacao: "Pendente", motivoNaoRealizacao: null, dataInicio: null, dataConclusao: null },
] };
const movimentacoesHoje = [
  { id: "7d3d0d64-a111-4cff-8db8-111111111111", clienteId: "6d3d0d64-a111-4cff-8db8-111111111113", nomeCliente: "Ana Martins", valorTotal: 75, dataMovimentacao: `${dataHoje}T15:00:00Z`, codigoExterno: null, observacao: null, origem: "Recepcao", situacao: "Registrada", versao: 1, linhas: [{ id: "7d3d0d64-a111-4cff-8db8-111111111112", ofertaDeServicoId: "2d3d0d64-a111-4cff-8db8-111111111112", artigoDeLavanderiaId: "3d3d0d64-a111-4cff-8db8-111111111112", nomeArtigo: "Edredom", servicoDeLavanderiaId: "4d3d0d64-a111-4cff-8db8-111111111112", nomeServico: "Lavagem", quantidade: 1, precoTabela: 75, precoUnitario: 75, subtotal: 75 }] },
  { id: "7d3d0d64-a111-4cff-8db8-111111111121", clienteId: "6d3d0d64-a111-4cff-8db8-111111111114", nomeCliente: "Patricia Souza", valorTotal: 40, dataMovimentacao: `${dataHoje}T14:00:00Z`, codigoExterno: null, observacao: "Registro corrigido", origem: "Recepcao", situacao: "Cancelada", versao: 2, linhas: [] },
];
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
  if (req.url === `/api/v1/acoes-comerciais/${id}`) return res.end(JSON.stringify({ acao, totais, destinatarios: destinatariosIntegrados }));
  if (req.url === `/api/v1/acoes-comerciais/${idCriado}` && acaoCriada) { const preparada = acaoCriada.situacao !== "Rascunho"; return res.end(JSON.stringify({ acao: acaoCriada, totais: { ...totais, destinatarios: preparada ? 1 : 0, pendentes: preparada && destinatarioCriado.situacaoEnvio === "Pendente" ? 1 : 0, aguardandoSolicitacao: preparada && destinatarioCriado.situacaoEnvio === "AguardandoSolicitacao" ? 1 : 0, enviados: 0, entregues: 0, lidos: 0, falhos: 0, naoInformados: preparada ? 1 : 0, convertidos: 0, valorConvertido: 0 }, destinatarios: preparada ? [destinatarioCriado] : [] })); }
  if (new URL(req.url, "http://127.0.0.1:4310").pathname === "/api/v1/clientes") return res.end(JSON.stringify({ itens: [], pagina: 1, tamanhoPagina: 20, total: 0 }));
  if (new URL(req.url, "http://127.0.0.1:4310").pathname === "/api/v1/roteiros") {
    const data = new URL(req.url, "http://127.0.0.1:4310").searchParams.get("data");
    if (data === dataHoje) return res.end(JSON.stringify(roteiroHoje));
    if (data === dataAmanha) return res.end(JSON.stringify(roteiroAmanha));
    res.statusCode = 404; return res.end(JSON.stringify({ title: "Roteiro não encontrado" }));
  }
  if (new URL(req.url, "http://127.0.0.1:4310").pathname === "/api/v1/movimentacoes-comerciais") return res.end(JSON.stringify(movimentacoesHoje));
  res.statusCode = 404; res.end(JSON.stringify({ title: "Nao encontrado" }));
}).listen(4310, "127.0.0.1");
