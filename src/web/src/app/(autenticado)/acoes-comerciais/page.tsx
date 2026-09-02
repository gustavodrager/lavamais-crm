import Link from "next/link";
import { Megaphone, MessageSquareText, Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { EstadoFalhaApi } from "@/components/estado-falha-api";
import { EstadoVazio } from "@/components/estado-vazio";
import { Button } from "@/components/ui/button";
import type { OpcaoModeloDeMensagem } from "@/contratos/apresentacao";
import { ErroCrmApi } from "@/infraestrutura/crm-api-http";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";
import { obterPortaSessao } from "@/infraestrutura/obter-porta-sessao";
import { papelDaVisao } from "@/lib/sessao-apresentacao";
import { BibliotecaMensagens } from "./biblioteca-mensagens";
import { ListaAcoes, type FiltroOperador } from "./lista-acoes";

type VisaoAcoes = "acoes" | "mensagens";

export default async function AcoesComerciais({ searchParams }: { searchParams: Promise<{ visao?: string; filtro?: string }> }) {
  const { visao, filtro } = await searchParams;
  const sessao = await obterPortaSessao().obterSessao();
  const papelVisualizado = papelDaVisao(sessao);
  const modoOperador = papelVisualizado === "Operador";
  const visaoAtiva: VisaoAcoes = visao === "mensagens" ? "mensagens" : "acoes";
  if (modoOperador && visaoAtiva === "mensagens") redirect("/acoes-comerciais");

  const api = obterPortaCrmApi();
  if (visaoAtiva === "mensagens") {
    let modelos: OpcaoModeloDeMensagem[];
    try {
      modelos = await api.listarModelosPublicados();
    } catch (erro) {
      if (erro instanceof ErroCrmApi) return <>
        <CabecalhoPagina titulo="Ações Comerciais" descricao="Consulte as mensagens aprovadas que podem ser escolhidas na preparação de uma ação." />
        <NavegacaoDasVisoes ativa="mensagens" />
        <EstadoFalhaApi status={erro.status} />
      </>;
      throw erro;
    }
    const podeGerenciarMensagens = papelVisualizado === "Administrador" || papelVisualizado === "Gerente";
    return <>
      <CabecalhoPagina titulo="Ações Comerciais" descricao="Consulte as mensagens aprovadas que podem ser escolhidas na preparação de uma ação." />
      <NavegacaoDasVisoes ativa="mensagens" />
      <BibliotecaMensagens modelos={modelos} podeGerenciar={podeGerenciarMensagens} />
    </>;
  }

  let resultado;
  try { resultado = await api.listarAcoes(); }
  catch (erro) { if (erro instanceof ErroCrmApi) return <><CabecalhoPagina titulo="Ações Comerciais" descricao="Crie, prepare e acompanhe contatos comerciais com uma audiência rastreável." /><NavegacaoDasVisoes ativa="acoes" /><EstadoFalhaApi status={erro.status} /></>; throw erro; }
  const podeCriar = !modoOperador;
  return <><CabecalhoPagina titulo={modoOperador ? "Fila de mensagens" : "Ações Comerciais"} descricao={modoOperador ? "Confira a mensagem pronta, envie uma cliente por vez e registre o retorno." : "Crie, prepare e acompanhe contatos comerciais com uma audiência rastreável."} acao={podeCriar ? <Button asChild><Link href="/acoes-comerciais/nova"><Plus aria-hidden="true" />Nova ação comercial</Link></Button> : undefined} />
    {!modoOperador ? <NavegacaoDasVisoes ativa="acoes" /> : null}
    {resultado.itens.length === 0 ? <EstadoVazio icone={Megaphone} titulo={modoOperador ? "Nenhuma mensagem na fila" : "Nenhuma Ação Comercial"} descricao={podeCriar ? "Crie a primeira ação para começar a preparar uma audiência real." : "Nenhuma ação foi preparada para atendimento ainda."} acao={podeCriar ? <Button asChild><Link href="/acoes-comerciais/nova"><Plus aria-hidden="true" />Criar primeira ação</Link></Button> : undefined} /> : <ListaAcoes acoes={resultado.itens} modoOperador={modoOperador} filtroInicial={normalizarFiltroOperador(filtro)} />}
  </>;
}

function normalizarFiltroOperador(valor: string | undefined): FiltroOperador {
  return valor === "Retornos" || valor === "Concluidas" ? valor : "ParaEnviar";
}

function NavegacaoDasVisoes({ ativa }: { ativa: VisaoAcoes }) {
  return <nav aria-label="Áreas de Ações Comerciais" className="mb-5 flex gap-2 rounded-xl border bg-secondary/60 p-2">
    <Button asChild variant={ativa === "acoes" ? "default" : "ghost"} className="min-h-11">
      <Link href="/acoes-comerciais" aria-current={ativa === "acoes" ? "page" : undefined}><Megaphone aria-hidden="true" />Ações</Link>
    </Button>
    <Button asChild variant={ativa === "mensagens" ? "default" : "ghost"} className="min-h-11">
      <Link href="/acoes-comerciais?visao=mensagens" aria-current={ativa === "mensagens" ? "page" : undefined}><MessageSquareText aria-hidden="true" />Mensagens aprovadas</Link>
    </Button>
  </nav>;
}
