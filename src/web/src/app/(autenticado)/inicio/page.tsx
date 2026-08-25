import Link from "next/link";
import { ArrowRight, ClipboardCheck, MessageCircle, Plus, ReceiptText, Route, Send, Users } from "lucide-react";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { SituacaoAcao } from "@/components/situacao-acao";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";
import { obterPortaSessao } from "@/infraestrutura/obter-porta-sessao";

export default async function Inicio() {
  const sessao = await obterPortaSessao().obterSessao();
  if (sessao?.papel === "Operador") return <InicioOperador />;
  const resultado = await obterPortaCrmApi().listarAcoes();
  const pendentes = resultado.itens.filter((acao) => !["Concluida", "ConcluidaComFalhas", "Cancelada"].includes(acao.situacao));
  const comFalhas = resultado.itens.filter((acao) => acao.situacao === "ConcluidaComFalhas");
  const detalhesConcluidos = await Promise.all(resultado.itens.filter((acao) => ["Concluida", "ConcluidaComFalhas"].includes(acao.situacao)).slice(0, 20).map((acao) => obterPortaCrmApi().obter(acao.id)));
  const resultadosPendentes = detalhesConcluidos.reduce((total, detalhe) => total + (detalhe?.totais.naoInformados ?? 0), 0);
  const proxima = [...pendentes, ...comFalhas].sort((a, b) => new Date(b.dataAtualizacao).getTime() - new Date(a.dataAtualizacao).getTime())[0];
  const preparadas = pendentes.filter((acao) => acao.situacao === "Preparada").length;
  const emAndamento = pendentes.filter((acao) => acao.situacao === "EmProcessamento").length;
  return <>
    <CabecalhoPagina titulo="Olá! O que precisa ser feito agora?" descricao="Continue uma ação, confira mensagens ou comece um novo contato comercial." acao={<Button asChild><Link href="/acoes-comerciais/nova"><Plus />Criar ação comercial</Link></Button>} />
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumo do trabalho">
      <Indicador icone={MessageCircle} rotulo="Ações para continuar" valor={pendentes.length} />
      <Indicador icone={Send} rotulo="Prontas para enviar" valor={preparadas} />
      <Indicador icone={Users} rotulo="Em acompanhamento" valor={emAndamento + comFalhas.length} />
      <Indicador icone={ClipboardCheck} rotulo="Resultados pendentes" valor={resultadosPendentes} />
    </section>
    <section className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <Card><CardHeader><CardTitle>{comFalhas.length > 0 ? "Atenção necessária" : "Continue de onde parou"}</CardTitle><CardDescription>{comFalhas.length > 0 ? "Há ações concluídas com falhas que precisam de conferência." : "A tarefa mais recente que ainda precisa de atenção."}</CardDescription></CardHeader><CardContent>{proxima ? <div className="flex flex-col gap-4 rounded-xl border bg-secondary/35 p-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="mb-2"><SituacaoAcao situacao={proxima.situacao} /></div><p className="font-semibold">{proxima.nome}</p><p className="mt-1 text-sm text-muted-foreground">{proxima.objetivo ?? "Sem objetivo informado"}</p></div><Button asChild><Link href={`/acoes-comerciais/${proxima.id}`}>{proxima.situacao === "ConcluidaComFalhas" ? "Conferir" : "Continuar"}<ArrowRight /></Link></Button></div> : <p className="text-sm text-muted-foreground">Nenhuma ação está pendente. Você pode começar uma nova quando quiser.</p>}</CardContent></Card>
      <Card><CardHeader><CardTitle>Atalhos</CardTitle><CardDescription>Acesse as tarefas mais usadas.</CardDescription></CardHeader><CardContent className="grid gap-2"><Button asChild variant="outline" className="justify-between"><Link href="/clientes">Buscar cliente<ArrowRight /></Link></Button><Button asChild variant="outline" className="justify-between"><Link href="/importacao">Importar clientes<ArrowRight /></Link></Button><Button asChild variant="outline" className="justify-between"><Link href="/configuracoes?secao=mensagens">Configurar mensagens<ArrowRight /></Link></Button></CardContent></Card>
    </section>
  </>;
}

function InicioOperador() {
  return <>
    <CabecalhoPagina titulo="Atendimento de hoje" descricao="Encontre o cliente e registre o próximo passo sem perder tempo." acao={<Button asChild><Link href="/movimentacoes"><Plus />Registrar movimentação</Link></Button>} />
    <section className="grid gap-4 sm:grid-cols-3" aria-label="Atalhos de atendimento">
      <Atalho titulo="Buscar cliente" descricao="Localize pelo nome ou WhatsApp." href="/clientes" icone={Users} />
      <Atalho titulo="Registrar movimentação" descricao="Anote um serviço realizado." href="/movimentacoes" icone={ReceiptText} />
      <Atalho titulo="Roteiro do dia" descricao="Consulte as coletas e entregas." href="/roteiros" icone={Route} />
    </section>
    <Card className="mt-6"><CardHeader><CardTitle>Quando chegarem vários clientes</CardTitle><CardDescription>Use a busca rápida, selecione o cliente e registre o essencial. O sistema mantém os dados no formulário até confirmar.</CardDescription></CardHeader><CardContent><Button asChild variant="outline"><Link href="/clientes">Abrir busca de clientes<ArrowRight /></Link></Button></CardContent></Card>
  </>;
}

function Atalho({ titulo, descricao, href, icone: Icone }: { titulo: string; descricao: string; href: string; icone: typeof Users }) {
  return <Card><CardContent className="flex h-full flex-col gap-3 p-5"><span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Icone className="size-5" aria-hidden="true" /></span><div><p className="font-semibold">{titulo}</p><p className="mt-1 text-sm text-muted-foreground">{descricao}</p></div><Button asChild variant="outline" className="mt-auto justify-between"><Link href={href}>Abrir<ArrowRight /></Link></Button></CardContent></Card>;
}

function Indicador({ icone: Icone, rotulo, valor }: { icone: typeof Users; rotulo: string; valor: number }) {
  return <Card><CardContent className="flex items-center gap-4 p-5"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icone className="size-5" aria-hidden="true" /></span><div><p className="text-2xl font-bold tabular-nums text-[var(--marca-azul-profundo)]">{valor}</p><p className="text-sm text-muted-foreground">{rotulo}</p></div></CardContent></Card>;
}
