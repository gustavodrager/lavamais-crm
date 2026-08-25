import Link from "next/link";
import { ArrowRight, MessageCircle, Plus, Send, Users } from "lucide-react";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { SituacaoAcao } from "@/components/situacao-acao";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";

export default async function Inicio() {
  const resultado = await obterPortaCrmApi().listarAcoes();
  const pendentes = resultado.itens.filter((acao) => acao.situacao !== "Concluida" && acao.situacao !== "ConcluidaComFalhas" && acao.situacao !== "Cancelada");
  const proxima = pendentes[0];
  const preparadas = pendentes.filter((acao) => acao.situacao === "Preparada").length;
  const emAndamento = pendentes.filter((acao) => acao.situacao === "EmProcessamento").length;
  return <>
    <CabecalhoPagina titulo="Olá! O que precisa ser feito agora?" descricao="Continue uma ação, confira mensagens ou comece um novo contato comercial." acao={<Button asChild><Link href="/acoes-comerciais/nova"><Plus />Criar ação comercial</Link></Button>} />
    <section className="grid gap-4 sm:grid-cols-3" aria-label="Resumo do trabalho">
      <Indicador icone={MessageCircle} rotulo="Ações para continuar" valor={pendentes.length} />
      <Indicador icone={Send} rotulo="Prontas para enviar" valor={preparadas} />
      <Indicador icone={Users} rotulo="Em acompanhamento" valor={emAndamento} />
    </section>
    <section className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <Card><CardHeader><CardTitle>Continue de onde parou</CardTitle><CardDescription>A tarefa mais recente que ainda precisa de atenção.</CardDescription></CardHeader><CardContent>{proxima ? <div className="flex flex-col gap-4 rounded-xl border bg-secondary/35 p-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="mb-2"><SituacaoAcao situacao={proxima.situacao} /></div><p className="font-semibold">{proxima.nome}</p><p className="mt-1 text-sm text-muted-foreground">{proxima.objetivo ?? "Sem objetivo informado"}</p></div><Button asChild><Link href={`/acoes-comerciais/${proxima.id}`}>Continuar<ArrowRight /></Link></Button></div> : <p className="text-sm text-muted-foreground">Nenhuma ação está pendente. Você pode começar uma nova quando quiser.</p>}</CardContent></Card>
      <Card><CardHeader><CardTitle>Atalhos</CardTitle><CardDescription>Acesse as tarefas mais usadas.</CardDescription></CardHeader><CardContent className="grid gap-2"><Button asChild variant="outline" className="justify-between"><Link href="/clientes">Buscar cliente<ArrowRight /></Link></Button><Button asChild variant="outline" className="justify-between"><Link href="/importacao">Importar clientes<ArrowRight /></Link></Button><Button asChild variant="outline" className="justify-between"><Link href="/configuracoes?secao=mensagens">Configurar mensagens<ArrowRight /></Link></Button></CardContent></Card>
    </section>
  </>;
}

function Indicador({ icone: Icone, rotulo, valor }: { icone: typeof Users; rotulo: string; valor: number }) {
  return <Card><CardContent className="flex items-center gap-4 p-5"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icone className="size-5" aria-hidden="true" /></span><div><p className="text-2xl font-bold tabular-nums text-[var(--marca-azul-profundo)]">{valor}</p><p className="text-sm text-muted-foreground">{rotulo}</p></div></CardContent></Card>;
}
