import type {
  DestinatarioDaAcao,
  DetalheAcaoComercial,
  ResumoAcaoComercial,
  ResumoMovimentacaoComercial,
  RoteiroDiario,
} from "../../../src/web/src/contratos/apresentacao";
import {
  dataLocalAmanha,
  dataLocalAtual,
  movimentacoesRegistradasHoje,
  resumirAcoesOperacionais,
  resumirAcoesNoPainel,
  resumirMovimentacoesDoDia,
  resumirRoteiroDoDia,
  rotuloMesAtual,
} from "../../../src/web/src/lib/painel-inicial";

const criterios = { versaoSchema: 2 as const, modo: "Filtros" as const, tipoCliente: null, cidades: null, bairros: null, etiquetaIds: null, cadastradoApartirDe: null, dataNascimentoDe: null, dataNascimentoAte: null, clienteIds: null, clienteIdsExcluidos: null };

describe("painel inicial", () => {
  it("separa mensagens, falhas e retornos que realmente precisam de ação", () => {
    const detalhe = criarDetalhe([
      criarDestinatario("Pendente", "NaoInformado"),
      criarDestinatario("AguardandoSolicitacao", "NaoInformado"),
      criarDestinatario("Enviado", "NaoInformado"),
      criarDestinatario("Entregue", "Interessado", "2026-08-20T15:00:00Z"),
      criarDestinatario("Lido", "Convertido", "2026-08-21T15:00:00Z", 120),
      criarDestinatario("Falhou", "NaoInformado"),
      criarDestinatario("Lido", "Convertido", "2026-07-31T15:00:00Z", 80),
    ]);

    const resumo = resumirAcoesNoPainel([detalhe], new Date("2026-08-26T15:00:00Z"));

    expect(resumo).toMatchObject({
      mensagensParaEnviar: 1,
      falhasParaRevisar: 1,
      retornosParaRegistrar: 1,
      resultadosRegistrados: 2,
      interessados: 1,
      conversoes: 1,
      valorConvertido: 120,
    });
  });

  it("resume a fila operacional sem consultar cada ação novamente", () => {
    const base: ResumoAcaoComercial = {
      id: "acao-1", nome: "Ação 1", objetivo: null, itemDeCatalogoId: null, versaoModeloId: null, criterios,
      situacao: "EmProcessamento", totalDestinatarios: 10, mensagensParaEnviar: 3, falhasParaRevisar: 1,
      retornosParaRegistrar: 2, resultadosRegistrados: 4, dataAtualizacao: "2026-08-26T12:00:00Z", versao: 1,
    };

    const resumo = resumirAcoesOperacionais([
      base,
      { ...base, id: "acao-2", mensagensParaEnviar: 2, falhasParaRevisar: 0, retornosParaRegistrar: 1, resultadosRegistrados: 5, dataAtualizacao: "2026-08-27T12:00:00Z" },
      { ...base, id: "rascunho", situacao: "Rascunho", mensagensParaEnviar: 99 },
    ]);

    expect(resumo).toMatchObject({ mensagensParaEnviar: 5, falhasParaRevisar: 1, retornosParaRegistrar: 3, resultadosRegistrados: 9 });
    expect(resumo.porAcao.map((acao) => acao.acaoId)).toEqual(["acao-2", "acao-1"]);
  });

  it("considera o mês e o dia no horário de São Paulo", () => {
    const detalhe = criarDetalhe([
      criarDestinatario("Lido", "Convertido", "2026-09-01T02:30:00Z", 50),
    ]);
    const agora = new Date("2026-08-31T15:00:00Z");

    expect(resumirAcoesNoPainel([detalhe], agora).valorConvertido).toBe(50);
    expect(dataLocalAtual(agora)).toBe("2026-08-31");
    expect(dataLocalAmanha(agora)).toBe("2026-09-01");
    expect(rotuloMesAtual(agora)).toBe("Agosto de 2026");
  });

  it("prioriza a parada que já está em deslocamento", () => {
    const roteiro: RoteiroDiario = {
      id: "roteiro", data: "2026-08-26", nomeMotorista: "Carlos", situacao: "EmAndamento", versao: 1,
      paradas: [
        criarParada("pendente", 1, "Pendente"),
        criarParada("concluida", 2, "Concluida"),
        criarParada("deslocamento", 3, "EmDeslocamento"),
        criarParada("falha", 4, "NaoRealizada"),
      ],
    };

    expect(resumirRoteiroDoDia(roteiro)).toMatchObject({
      total: 4,
      registradas: 2,
      concluidas: 1,
      naoRealizadas: 1,
      emDeslocamento: 1,
      pendentes: 1,
      proxima: { id: "deslocamento" },
    });
  });

  it("conta somente movimentações válidas do dia local", () => {
    const agora = new Date("2026-08-26T15:00:00Z");
    const movimentacoes = [
      criarMovimentacao("hoje", "2026-08-26T10:00:00Z", "Registrada", "cliente-1", 50),
      criarMovimentacao("limite-fuso", "2026-08-27T01:30:00Z", "Registrada", "cliente-1", 75),
      criarMovimentacao("amanha", "2026-08-27T04:00:00Z", "Registrada", "cliente-2", 100),
      criarMovimentacao("cancelada", "2026-08-26T12:00:00Z", "Cancelada", "cliente-3", 30),
    ];

    expect(movimentacoesRegistradasHoje(movimentacoes, agora).map((item) => item.id)).toEqual(["hoje", "limite-fuso"]);
    expect(resumirMovimentacoesDoDia(movimentacoes, agora)).toMatchObject({
      quantidadeRegistradas: 2,
      clientesUnicos: 1,
      valorInformado: 125,
      quantidadeCanceladas: 1,
    });
  });
});

function criarDetalhe(destinatarios: DestinatarioDaAcao[]): DetalheAcaoComercial {
  return {
    id: "acao", nome: "Ação de teste", objetivo: null, itemDeCatalogoId: null, versaoModeloId: null, criterios,
    situacao: "EmProcessamento", totalDestinatarios: destinatarios.length, dataAtualizacao: "2026-08-26T12:00:00Z", versao: 1,
    totais: { destinatarios: destinatarios.length, pendentes: 0, aguardandoSolicitacao: 0, solicitados: 0, enviados: 0, entregues: 0, lidos: 0, falhos: 0, naoInformados: 0, semRetorno: 0, responderam: 0, interessados: 0, convertidos: 0, semInteresse: 0, valorConvertido: 0 },
    destinatarios,
  };
}

let sequenciaDestinatario = 0;
function criarDestinatario(situacaoEnvio: DestinatarioDaAcao["situacaoEnvio"], resultadoComercial: DestinatarioDaAcao["resultadoComercial"], dataResultadoComercial: string | null = null, valorConvertido: number | null = null): DestinatarioDaAcao {
  sequenciaDestinatario += 1;
  return { id: `destinatario-${sequenciaDestinatario}`, clienteId: `cliente-${sequenciaDestinatario}`, nomeCliente: "Ana", destino: "+5513999999999", conteudoPreVisualizacao: "Olá", situacaoEnvio, resultadoComercial, valorConvertido, dataResultadoComercial, codigoFalha: situacaoEnvio === "Falhou" ? "falha_teste" : null, versao: 1 };
}

function criarParada(id: string, ordem: number, situacao: RoteiroDiario["paradas"][number]["situacao"]): RoteiroDiario["paradas"][number] {
  return { id, clienteId: `cliente-${id}`, nomeCliente: "Cliente", whatsapp: "5513999999999", enderecoCompleto: "Rua Teste, 10", tipo: "Entrega", periodo: "Tarde", observacao: null, ordem, situacao, motivoNaoRealizacao: situacao === "NaoRealizada" ? "Ausente" : null, dataInicio: null, dataConclusao: null };
}

function criarMovimentacao(id: string, dataMovimentacao: string, situacao: ResumoMovimentacaoComercial["situacao"], clienteId: string, valorTotal: number): ResumoMovimentacaoComercial {
  return { id, clienteId, nomeCliente: "Cliente", valorTotal, dataMovimentacao, codigoExterno: null, observacao: null, origem: "Recepcao", situacao, versao: 1, linhas: [] };
}
