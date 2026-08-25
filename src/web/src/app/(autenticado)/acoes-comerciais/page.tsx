import Link from "next/link";
import { Megaphone, Plus } from "lucide-react";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { EstadoFalhaApi } from "@/components/estado-falha-api";
import { EstadoVazio } from "@/components/estado-vazio";
import { Button } from "@/components/ui/button";
import { ErroCrmApi } from "@/infraestrutura/crm-api-http";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";
import { obterPortaSessao } from "@/infraestrutura/obter-porta-sessao";
import { ListaAcoes } from "./lista-acoes";

export default async function AcoesComerciais() {
  const sessao = await obterPortaSessao().obterSessao();
  let resultado;
  try { resultado = await obterPortaCrmApi().listarAcoes(); }
  catch (erro) { if (erro instanceof ErroCrmApi) return <><CabecalhoPagina titulo="Ações Comerciais" descricao="Crie, prepare e acompanhe contatos comerciais com uma audiência rastreável." /><EstadoFalhaApi status={erro.status} /></>; throw erro; }
  const podeCriar = sessao?.papel !== "Operador";
  return <><CabecalhoPagina titulo="Ações Comerciais" descricao="Crie, prepare e acompanhe contatos comerciais com uma audiência rastreável." acao={podeCriar ? <Button asChild><Link href="/acoes-comerciais/nova"><Plus aria-hidden="true" />Nova ação comercial</Link></Button> : undefined} />
    {resultado.itens.length === 0 ? <EstadoVazio icone={Megaphone} titulo="Nenhuma Ação Comercial" descricao={podeCriar ? "Crie a primeira ação para começar a preparar uma audiência real." : "Nenhuma ação foi preparada para acompanhamento ainda."} acao={podeCriar ? <Button asChild><Link href="/acoes-comerciais/nova"><Plus aria-hidden="true" />Criar primeira ação</Link></Button> : undefined} /> : <ListaAcoes acoes={resultado.itens} />}
  </>;
}
