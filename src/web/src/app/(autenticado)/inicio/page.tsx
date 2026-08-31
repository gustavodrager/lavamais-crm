import type { DetalheAcaoComercial } from "@/contratos/apresentacao";
import { redirect } from "next/navigation";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";
import { obterPortaSessao } from "@/infraestrutura/obter-porta-sessao";
import { papelDaVisao } from "@/lib/sessao-apresentacao";
import {
  dataLocalAmanha,
  dataLocalAtual,
  rotuloMesAtual,
  resumirAcoesOperacionais,
  resumirAcoesNoPainel,
  resumirMovimentacoesDoDia,
} from "@/lib/painel-inicial";
import { PainelGerencial } from "./painel-gerencial";
import { PainelOperador } from "./painel-operador";

export default async function Inicio() {
  const sessao = await obterPortaSessao().obterSessao();
  if (!sessao) redirect("/entrar");
  const api = obterPortaCrmApi();
  const agora = new Date();
  const dataHoje = dataLocalAtual(agora);
  const dataAmanha = dataLocalAmanha(agora);
  const papelVisualizado = papelDaVisao(sessao);

  if (papelVisualizado === "Operador") {
    const [resultado, movimentacoes, roteiro, roteiroAmanha] = await Promise.all([
      api.listarAcoes(),
      api.listarMovimentacoes(undefined, 100),
      api.obterRoteiro(dataHoje),
      api.obterRoteiro(dataAmanha),
    ]);

    return <PainelOperador
      resumoAcoes={resumirAcoesOperacionais(resultado.itens)}
      resumoMovimentacoes={resumirMovimentacoesDoDia(movimentacoes, agora)}
      roteiro={roteiro}
      roteiroAmanha={roteiroAmanha}
      dataHoje={dataHoje}
      dataAmanha={dataAmanha}
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
