import type {
  DetalheAcaoComercial,
  ResumoMovimentacaoComercial,
  RoteiroDiario,
} from "@/contratos/apresentacao";

const fusoHorario = "America/Sao_Paulo";
const estadosComContatoRealizado = new Set(["Enviado", "Entregue", "Lido"]);

const formatadorDia = new Intl.DateTimeFormat("en-CA", {
  timeZone: fusoHorario,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const formatadorMes = new Intl.DateTimeFormat("en-CA", {
  timeZone: fusoHorario,
  year: "numeric",
  month: "2-digit",
});

const formatadorRotuloMes = new Intl.DateTimeFormat("pt-BR", {
  timeZone: fusoHorario,
  month: "long",
  year: "numeric",
});

export interface ResumoPorAcaoNoPainel {
  acaoId: string;
  dataAtualizacao: string;
  mensagensParaEnviar: number;
  falhasParaRevisar: number;
  retornosParaRegistrar: number;
}

export interface ResumoComercialDoPainel {
  mensagensParaEnviar: number;
  falhasParaRevisar: number;
  retornosParaRegistrar: number;
  resultadosRegistrados: number;
  interessados: number;
  conversoes: number;
  valorConvertido: number;
  porAcao: ResumoPorAcaoNoPainel[];
}

export interface ResumoMovimentacoesDoDia {
  registradas: ResumoMovimentacaoComercial[];
  quantidadeRegistradas: number;
  clientesUnicos: number;
  valorInformado: number;
  quantidadeCanceladas: number;
}

export function resumirAcoesNoPainel(
  detalhes: DetalheAcaoComercial[],
  agora = new Date(),
): ResumoComercialDoPainel {
  const mesAtual = formatadorMes.format(agora);
  let mensagensParaEnviar = 0;
  let falhasParaRevisar = 0;
  let retornosParaRegistrar = 0;
  let resultadosRegistrados = 0;
  let interessados = 0;
  let conversoes = 0;
  let valorConvertido = 0;

  const porAcao = detalhes.map((detalhe) => {
    let mensagensDaAcao = 0;
    let falhasDaAcao = 0;
    let retornosDaAcao = 0;

    for (const destinatario of detalhe.destinatarios) {
      if (destinatario.situacaoEnvio === "Pendente") mensagensDaAcao += 1;
      if (destinatario.situacaoEnvio === "Falhou") falhasDaAcao += 1;

      if (
        destinatario.resultadoComercial === "NaoInformado"
        && estadosComContatoRealizado.has(destinatario.situacaoEnvio)
      ) {
        retornosDaAcao += 1;
      }

      if (
        destinatario.resultadoComercial === "NaoInformado"
        || !destinatario.dataResultadoComercial
        || mesDaData(destinatario.dataResultadoComercial) !== mesAtual
      ) {
        continue;
      }

      resultadosRegistrados += 1;
      if (destinatario.resultadoComercial === "Interessado") interessados += 1;
      if (destinatario.resultadoComercial === "Convertido") {
        conversoes += 1;
        valorConvertido += destinatario.valorConvertido ?? 0;
      }
    }

    mensagensParaEnviar += mensagensDaAcao;
    falhasParaRevisar += falhasDaAcao;
    retornosParaRegistrar += retornosDaAcao;

    return {
      acaoId: detalhe.id,
      dataAtualizacao: detalhe.dataAtualizacao,
      mensagensParaEnviar: mensagensDaAcao,
      falhasParaRevisar: falhasDaAcao,
      retornosParaRegistrar: retornosDaAcao,
    };
  });

  porAcao.sort(
    (a, b) => new Date(b.dataAtualizacao).getTime() - new Date(a.dataAtualizacao).getTime(),
  );

  return {
    mensagensParaEnviar,
    falhasParaRevisar,
    retornosParaRegistrar,
    resultadosRegistrados,
    interessados,
    conversoes,
    valorConvertido,
    porAcao,
  };
}

export function resumirRoteiroDoDia(roteiro: RoteiroDiario | null) {
  const paradas = roteiro?.paradas ?? [];
  const concluidas = paradas.filter((parada) => parada.situacao === "Concluida").length;
  const naoRealizadas = paradas.filter((parada) => parada.situacao === "NaoRealizada").length;
  const emDeslocamento = paradas.filter((parada) => parada.situacao === "EmDeslocamento").length;
  const pendentes = paradas.filter((parada) => parada.situacao === "Pendente").length;
  const ordenadas = [...paradas].sort((a, b) => a.ordem - b.ordem);
  const proxima = ordenadas.find((parada) => parada.situacao === "EmDeslocamento")
    ?? ordenadas.find((parada) => parada.situacao === "Pendente")
    ?? null;

  return {
    total: paradas.length,
    registradas: concluidas + naoRealizadas,
    concluidas,
    naoRealizadas,
    emDeslocamento,
    pendentes,
    proxima,
  };
}

export function movimentacoesRegistradasHoje(
  movimentacoes: ResumoMovimentacaoComercial[],
  agora = new Date(),
) {
  return resumirMovimentacoesDoDia(movimentacoes, agora).registradas;
}

export function resumirMovimentacoesDoDia(
  movimentacoes: ResumoMovimentacaoComercial[],
  agora = new Date(),
): ResumoMovimentacoesDoDia {
  const hoje = formatadorDia.format(agora);
  const movimentacoesDoDia = movimentacoes.filter(
    (movimentacao) => diaDaData(movimentacao.dataMovimentacao) === hoje,
  );
  const registradas = movimentacoesDoDia.filter(
    (movimentacao) => movimentacao.situacao === "Registrada",
  );

  return {
    registradas,
    quantidadeRegistradas: registradas.length,
    clientesUnicos: new Set(registradas.map((movimentacao) => movimentacao.clienteId)).size,
    valorInformado: registradas.reduce(
      (total, movimentacao) => total + movimentacao.valorTotal,
      0,
    ),
    quantidadeCanceladas: movimentacoesDoDia.length - registradas.length,
  };
}

export function dataLocalAtual(agora = new Date()) {
  return formatadorDia.format(agora);
}

export function dataLocalAmanha(agora = new Date()) {
  const [ano, mes, dia] = dataLocalAtual(agora).split("-").map(Number);
  return new Date(Date.UTC(ano, mes - 1, dia + 1)).toISOString().slice(0, 10);
}

export function rotuloMesAtual(agora = new Date()) {
  const rotulo = formatadorRotuloMes.format(agora);
  return rotulo.charAt(0).toLocaleUpperCase("pt-BR") + rotulo.slice(1);
}

function diaDaData(valor: string) {
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? null : formatadorDia.format(data);
}

function mesDaData(valor: string) {
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? null : formatadorMes.format(data);
}
