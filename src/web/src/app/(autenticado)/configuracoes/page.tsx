import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";
import { FormulariosConfiguracao } from "./formularios-configuracao";

export default async function Configuracoes({ searchParams }: { searchParams: Promise<{ secao?: string }> }) {
  const { secao } = await searchParams;
  const porta = obterPortaCrmApi();
  const [catalogo, etiquetas, modelos] = await Promise.all([porta.listarCatalogo(), porta.listarEtiquetas(), porta.listarModelosPublicados()]);
  return <><CabecalhoPagina titulo="Configurações" descricao="Prepare serviços, etiquetas e mensagens necessárias para as ações comerciais." /><FormulariosConfiguracao itens={catalogo.filter((item) => item.tipo === "Servico")} etiquetas={etiquetas} modelos={modelos} secaoInicial={secao === "mensagens" ? "mensagens" : "servicos"} /></>;
}
