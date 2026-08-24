import Link from "next/link";
import { Megaphone, Plus } from "lucide-react";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { EstadoFalhaApi } from "@/components/estado-falha-api";
import { EstadoVazio } from "@/components/estado-vazio";
import { Button } from "@/components/ui/button";
import { ErroCrmApi } from "@/infraestrutura/crm-api-http";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";
import { ListaAcoes } from "./lista-acoes";

export default async function AcoesComerciais() {
  let resultado;
  try { resultado = await obterPortaCrmApi().listarAcoes(); }
  catch (erro) { if (erro instanceof ErroCrmApi) return <><CabecalhoPagina titulo="Ações Comerciais" descricao="Crie, prepare e acompanhe contatos comerciais com uma audiência rastreável." /><EstadoFalhaApi status={erro.status} /></>; throw erro; }
  return <><CabecalhoPagina titulo="Ações Comerciais" descricao="Crie, prepare e acompanhe contatos comerciais com uma audiência rastreável." acao={<Button asChild><Link href="/acoes-comerciais/nova"><Plus aria-hidden="true" />Nova ação comercial</Link></Button>} />
    {resultado.itens.length === 0 ? <EstadoVazio icone={Megaphone} titulo="Nenhuma Ação Comercial" descricao="Crie a primeira ação para começar a preparar uma audiência real." acao={<Button asChild><Link href="/acoes-comerciais/nova"><Plus aria-hidden="true" />Criar primeira ação</Link></Button>} /> : <ListaAcoes acoes={resultado.itens} />}
  </>;
}
