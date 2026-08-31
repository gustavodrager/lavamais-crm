import { redirect } from "next/navigation";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { EstadoFalhaApi } from "@/components/estado-falha-api";
import { FormularioNovaAcao } from "@/components/formulario-nova-acao";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JornadaAcao } from "@/components/jornada-acao";
import { ErroCrmApi } from "@/infraestrutura/crm-api-http";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";
import { obterPortaSessao } from "@/infraestrutura/obter-porta-sessao";
import { papelDaVisao } from "@/lib/sessao-apresentacao";

export default async function NovaAcao() {
  const sessao = await obterPortaSessao().obterSessao();
  if (papelDaVisao(sessao) === "Operador") redirect("/acoes-comerciais");
  let itensCatalogo;
  try {
    itensCatalogo = await obterPortaCrmApi().listarItensDeCatalogoAtivos();
  } catch (erro) {
    if (erro instanceof ErroCrmApi) {
      return <><CabecalhoPagina titulo="Nova Ação Comercial" descricao="Comece pelo objetivo e pelo item que dará contexto à comunicação." /><EstadoFalhaApi status={erro.status} /></>;
    }
    throw erro;
  }

  return <><CabecalhoPagina titulo="Nova Ação Comercial" descricao="Comece pelo objetivo da comunicação; o item de catálogo é opcional." /><JornadaAcao etapaAtual={1} /><Card className="mx-auto max-w-3xl"><CardHeader><CardTitle>Informações iniciais</CardTitle></CardHeader><CardContent><FormularioNovaAcao itensCatalogo={itensCatalogo} /></CardContent></Card></>;
}
