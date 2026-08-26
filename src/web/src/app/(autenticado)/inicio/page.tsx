import Link from "next/link";
import { ArrowRight, ClipboardCheck, FilePenLine, Plus, Route, Send, Users, type LucideIcon } from "lucide-react";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { SituacaoAcao } from "@/components/situacao-acao";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ResumoAcaoComercial } from "@/contratos/apresentacao";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";
import { obterPortaSessao } from "@/infraestrutura/obter-porta-sessao";
import { rotuloProximaAcao, selecionarAcaoPrioritaria } from "@/lib/acoes-comerciais";

export default async function Inicio() {
  const sessao = await obterPortaSessao().obterSessao();
  if (sessao?.papel === "Operador") return <InicioOperador />;
  const api = obterPortaCrmApi();
  const resultado = await api.listarAcoes();
  const pendentes = resultado.itens.filter((acao) => !["Concluida", "ConcluidaComFalhas", "Cancelada"].includes(acao.situacao));
  const acoesConsultadas = resultado.itens.filter((acao) => acao.situacao !== "Cancelada");
  const detalhes = await Promise.all(acoesConsultadas.map((acao) => api.obter(acao.id)));
  const resultadosPendentes = detalhes.reduce((total, detalhe) => total + (detalhe?.totais.naoInformados ?? 0), 0);
  const proxima = selecionarAcaoPrioritaria(resultado.itens);
  const rascunhos = pendentes.filter((acao) => acao.situacao === "Rascunho").length;
  const preparadas = pendentes.filter((acao) => acao.situacao === "Preparada").length;
  const emAndamento = pendentes.filter((acao) => acao.situacao === "EmProcessamento").length;
  return <>
    <CabecalhoPagina titulo="Olá! O que precisa ser feito agora?" descricao="Continue uma ação, confira mensagens ou comece um novo contato comercial." acao={<Button asChild><Link href="/acoes-comerciais/nova"><Plus />Criar ação comercial</Link></Button>} />
    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <Card className="order-1">
        <CardHeader>
          <CardTitle><h2>{proxima?.situacao === "ConcluidaComFalhas" ? "Atenção necessária" : proxima ? "Próxima tarefa" : "Tudo em dia"}</h2></CardTitle>
          <CardDescription>{proxima ? descricaoProximaAcao(proxima) : "Nenhuma ação precisa de atenção agora."}</CardDescription>
        </CardHeader>
        <CardContent>
          {proxima ? <div className="flex flex-col gap-4 rounded-xl border bg-secondary/35 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="mb-2"><SituacaoAcao situacao={proxima.situacao} /></div><p className="truncate font-semibold">{proxima.nome}</p><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{proxima.objetivo ?? "Sem objetivo informado"}</p></div><Button asChild className="shrink-0"><Link href={`/acoes-comerciais/${proxima.id}`}>{rotuloProximaAcao(proxima.situacao)}<ArrowRight /></Link></Button></div> : <Button asChild variant="outline"><Link href="/acoes-comerciais/nova">Criar uma ação<ArrowRight /></Link></Button>}
        </CardContent>
      </Card>

      <section className="order-2 grid grid-cols-2 gap-3 lg:order-3 lg:col-span-2 xl:grid-cols-4" aria-label="Resumo do trabalho">
        <Indicador icone={FilePenLine} rotulo="Rascunhos" valor={rascunhos} />
        <Indicador icone={Send} rotulo="Prontas para enviar" valor={preparadas} />
        <Indicador icone={Users} rotulo="Em andamento" valor={emAndamento} />
        <Indicador icone={ClipboardCheck} rotulo="Resultados a registrar" valor={resultadosPendentes} />
      </section>

      <Card className="order-3 lg:order-2"><CardHeader><CardTitle><h2>Atalhos</h2></CardTitle><CardDescription>Acesse as tarefas mais usadas.</CardDescription></CardHeader><CardContent className="grid gap-2"><Button asChild variant="outline" className="justify-between"><Link href="/clientes">Buscar cliente<ArrowRight /></Link></Button><Button asChild variant="outline" className="justify-between"><Link href="/importacao">Importar clientes<ArrowRight /></Link></Button><Button asChild variant="outline" className="justify-between"><Link href="/configuracoes?secao=mensagens">Configurar mensagens<ArrowRight /></Link></Button></CardContent></Card>
    </div>
  </>;
}

function InicioOperador() {
  return <>
    <CabecalhoPagina titulo="Atendimento de hoje" descricao="Encontre o cliente e registre o próximo passo sem perder tempo." acao={<Button asChild><Link href="/movimentacoes"><Plus />Registrar movimentação</Link></Button>} />
    <section className="grid gap-4 sm:grid-cols-2" aria-label="Atalhos de atendimento">
      <Atalho titulo="Clientes" descricao="Localize pelo nome ou WhatsApp." rotuloAcao="Buscar cliente" href="/clientes" icone={Users} />
      <Atalho titulo="Roteiro do dia" descricao="Consulte as coletas e entregas." rotuloAcao="Ver roteiro" href="/meu-roteiro" icone={Route} />
    </section>
  </>;
}

function Atalho({ titulo, descricao, rotuloAcao, href, icone: Icone }: { titulo: string; descricao: string; rotuloAcao: string; href: string; icone: LucideIcon }) {
  return <Card><CardContent className="flex h-full flex-col gap-3 p-5"><span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Icone className="size-5" aria-hidden="true" /></span><div><h2 className="font-semibold">{titulo}</h2><p className="mt-1 text-sm text-muted-foreground">{descricao}</p></div><Button asChild variant="outline" className="mt-auto justify-between"><Link href={href}>{rotuloAcao}<ArrowRight /></Link></Button></CardContent></Card>;
}

function Indicador({ icone: Icone, rotulo, valor }: { icone: LucideIcon; rotulo: string; valor: number }) {
  return <Card size="sm" className="gap-0 py-0"><CardContent className="flex min-h-24 items-center gap-3 p-4"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Icone className="size-4" aria-hidden="true" /></span><div className="min-w-0"><p className="text-xl font-bold tabular-nums text-[var(--marca-azul-profundo)]">{valor}</p><p className="text-xs leading-5 text-muted-foreground sm:text-sm">{rotulo}</p></div></CardContent></Card>;
}

function descricaoProximaAcao(acao: ResumoAcaoComercial) {
  if (acao.situacao === "ConcluidaComFalhas") return "Confira as falhas antes de seguir com outras ações.";
  if (acao.situacao === "Preparada") return "A lista e a mensagem estão prontas para os envios individuais.";
  if (acao.situacao === "Rascunho") return "Continue a configuração da ação mais recente.";
  return "Acompanhe os envios e registre os resultados comerciais.";
}
