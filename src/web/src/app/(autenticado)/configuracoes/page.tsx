import { redirect } from "next/navigation";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";
import { obterPortaSessao } from "@/infraestrutura/obter-porta-sessao";
import { papelDaVisao } from "@/lib/sessao-apresentacao";
import { FormulariosConfiguracao, type SituacaoCanalMensagens } from "./formularios-configuracao";

export default async function Configuracoes({ searchParams }: { searchParams: Promise<{ secao?: string }> }) {
  const { secao } = await searchParams;
  if (secao === "mensagens") redirect("/acoes-comerciais?visao=mensagens");
  const sessao = await obterPortaSessao().obterSessao();
  const papelVisualizado = papelDaVisao(sessao);
  if (papelVisualizado === "Operador") redirect("/inicio");
  const porta = obterPortaCrmApi();
  const [catalogo, etiquetas, capacidades] = await Promise.all([
    porta.listarCatalogo(),
    porta.listarEtiquetas(),
    porta.obterCapacidades().catch(() => null),
  ]);
  const situacaoCanalMensagens: SituacaoCanalMensagens = capacidades === null
    ? "NaoVerificado"
    : capacidades.envioNotificacoesHabilitado ? "Disponivel" : "Indisponivel";
  return <>
    <CabecalhoPagina titulo="Configurações" descricao="Organize o catálogo, as etiquetas e confira a disponibilidade dos recursos do CRM." />
    <FormulariosConfiguracao
      itens={catalogo.filter((item) => item.tipo === "Servico")}
      etiquetas={etiquetas}
      secaoInicial={secao === "etiquetas" ? "etiquetas" : "servicos"}
      podeCarregarCatalogoInicial={papelVisualizado === "Administrador"}
      situacaoCanalMensagens={situacaoCanalMensagens}
    />
  </>;
}
