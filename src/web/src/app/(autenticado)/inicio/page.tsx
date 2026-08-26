import type { DetalheAcaoComercial } from "@/contratos/apresentacao";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";
import { obterPortaSessao } from "@/infraestrutura/obter-porta-sessao";
import {
  dataLocalAmanha,
  dataLocalAtual,
  rotuloMesAtual,
  resumirAcoesNoPainel,
  resumirMovimentacoesDoDia,
} from "@/lib/painel-inicial";
import { PainelGerencial } from "./painel-gerencial";
import { PainelOperador } from "./painel-operador";

export default async function Inicio() {
  const sessao = await obterPortaSessao().obterSessao();
  const api = obterPortaCrmApi();
  const agora = new Date();
  const dataHoje = dataLocalAtual(agora);
  const dataAmanha = dataLocalAmanha(agora);

  if (sessao?.papel === "Operador") {
    const [roteiro, movimentacoes] = await Promise.all([
      api.obterRoteiro(dataHoje),
      api.listarMovimentacoes(undefined, 100),
    ]);

    return <PainelOperador
      roteiro={roteiro}
      resumoMovimentacoes={resumirMovimentacoesDoDia(movimentacoes, agora)}
    />;
  }

  const [resultado, roteiro, roteiroAmanha, movimentacoes] = await Promise.all([
    api.listarAcoes(),
    api.obterRoteiro(dataHoje),
    api.obterRoteiro(dataAmanha),
    api.listarMovimentacoes(undefined, 100),
  ]);
  const acoesComDestinatarios = resultado.itens.filter(
    (acao) => acao.situacao !== "Rascunho" && acao.situacao !== "Cancelada",
  );
  const consultas = await Promise.all(acoesComDestinatarios.map((acao) => api.obter(acao.id)));
  const detalhes = consultas.filter((detalhe): detalhe is DetalheAcaoComercial => detalhe !== null);

  return <PainelGerencial
    acoes={resultado.itens}
    resumo={resumirAcoesNoPainel(detalhes, agora)}
    roteiro={roteiro}
    roteiroAmanha={roteiroAmanha}
    resumoMovimentacoes={resumirMovimentacoesDoDia(movimentacoes, agora)}
    dataHoje={dataHoje}
    dataAmanha={dataAmanha}
    rotuloMes={rotuloMesAtual(agora)}
  />;
}
