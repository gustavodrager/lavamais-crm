import Link from "next/link";
import { ArrowRight, CalendarDays, ClipboardCheck, MapPin, MessageCircle, Plus, ReceiptText, Route, Search, Send, TriangleAlert, UserPlus, type LucideIcon } from "lucide-react";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ResumoMovimentacaoComercial, RoteiroDiario } from "@/contratos/apresentacao";
import type { ResumoMovimentacoesDoDia, ResumoOperacionalDasAcoes } from "@/lib/painel-inicial";
import { resumirRoteiroDoDia } from "@/lib/painel-inicial";

interface PropriedadesPainelOperador {
  resumoAcoes: ResumoOperacionalDasAcoes;
  resumoMovimentacoes: ResumoMovimentacoesDoDia;
  roteiro: RoteiroDiario | null;
  roteiroAmanha: RoteiroDiario | null;
  dataHoje: string;
  dataAmanha: string;
}

export function PainelOperador({ resumoAcoes, resumoMovimentacoes, roteiro, roteiroAmanha, dataHoje, dataAmanha }: PropriedadesPainelOperador) {
  const resumoRoteiro = resumirRoteiroDoDia(roteiro);
  const tarefa = escolherProximaTarefa(resumoAcoes, roteiro, roteiroAmanha, dataHoje, dataAmanha);
  const recentes = resumoMovimentacoes.registradas.slice(0, 3);
  const hrefRoteiro = roteiro?.situacao === "EmPreparacao" || !roteiro ? `/roteiros?data=${dataHoje}` : `/meu-roteiro?data=${dataHoje}`;
  const percentualRoteiro = resumoRoteiro.total > 0 ? Math.round((resumoRoteiro.registradas / resumoRoteiro.total) * 100) : 0;

  return <>
    <CabecalhoPagina
      titulo="Operação de hoje"
      descricao="Veja o que precisa de atenção e continue o atendimento de onde parou."
      acao={<Button asChild><Link href="/movimentacoes"><Plus />Registrar atendimento</Link></Button>}
    />

    <section aria-labelledby="proxima-tarefa" className="rounded-lg border border-primary/25 bg-primary/5 p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div className="max-w-2xl"><p className="flex items-center gap-2 text-xs font-semibold uppercase text-primary"><ClipboardCheck className="size-4" />Próxima tarefa</p><h2 id="proxima-tarefa" className="mt-2 font-heading text-xl font-semibold text-[var(--marca-azul-profundo)] sm:text-2xl">{tarefa.titulo}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{tarefa.descricao}</p></div>
        <Button asChild className="shrink-0"><Link href={tarefa.href}>{tarefa.acao}<ArrowRight /></Link></Button>
      </div>
    </section>

    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <IndicadorTarefa href="/acoes-comerciais?filtro=ParaEnviar" icone={Send} titulo="Mensagens para enviar" valor={resumoAcoes.mensagensParaEnviar.toString()} detalhe={resumoAcoes.falhasParaRevisar > 0 ? `${resumoAcoes.falhasParaRevisar} com falha para revisar` : "Fila de mensagens aprovadas"} destaque={resumoAcoes.mensagensParaEnviar > 0} />
      <IndicadorTarefa href="/acoes-comerciais?filtro=Retornos" icone={MessageCircle} titulo="Retornos pendentes" valor={resumoAcoes.retornosParaRegistrar.toString()} detalhe={`${resumoAcoes.resultadosRegistrados} resultados registrados`} destaque={resumoAcoes.retornosParaRegistrar > 0} />
      <IndicadorTarefa href={hrefRoteiro} icone={Route} titulo="Roteiro de hoje" valor={resumoRoteiro.total > 0 ? `${resumoRoteiro.registradas}/${resumoRoteiro.total}` : "—"} detalhe={rotuloDoRoteiro(roteiro)} destaque={resumoRoteiro.emDeslocamento > 0} />
      <IndicadorTarefa href="/movimentacoes" icone={ReceiptText} titulo="Atendimentos hoje" valor={resumoMovimentacoes.quantidadeRegistradas.toString()} detalhe={`${resumoMovimentacoes.clientesUnicos} clientes atendidos`} />
    </div>

    <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
      <Card className="rounded-lg">
        <CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle><h2>Atendimentos recentes</h2></CardTitle><CardDescription>Últimos registros feitos hoje.</CardDescription></div><Button asChild size="sm" variant="ghost"><Link href="/movimentacoes">Ver todos<ArrowRight /></Link></Button></div></CardHeader>
        <CardContent>
          {recentes.length > 0 ? <div className="divide-y">{recentes.map((movimentacao) => <article key={movimentacao.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"><div className="min-w-0"><h3 className="truncate text-sm font-semibold">{formatarNome(movimentacao.nomeCliente)}</h3><p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{resumirLinhas(movimentacao.linhas)}</p></div><time className="shrink-0 text-xs tabular-nums text-muted-foreground" dateTime={movimentacao.dataMovimentacao}>{formatarHora(movimentacao.dataMovimentacao)}</time></article>)}</div> : <div className="py-5 text-center"><ReceiptText className="mx-auto mb-2 size-6 text-muted-foreground" /><p className="text-sm text-muted-foreground">Nenhum atendimento registrado hoje.</p></div>}
          {resumoMovimentacoes.quantidadeCanceladas > 0 && <p className="mt-4 flex items-center gap-2 border-t pt-3 text-xs text-destructive"><TriangleAlert className="size-3.5" />{resumoMovimentacoes.quantidadeCanceladas === 1 ? "1 registro cancelado hoje" : `${resumoMovimentacoes.quantidadeCanceladas} registros cancelados hoje`}</p>}
        </CardContent>
      </Card>

      <Card className="rounded-lg">
        <CardHeader><CardTitle><h2>Acessos rápidos</h2></CardTitle><CardDescription>Principais tarefas do atendimento.</CardDescription></CardHeader>
        <CardContent className="grid gap-2">
          <AtalhoOperador href="/clientes" icone={Search} titulo="Buscar cliente" />
          <AtalhoOperador href="/clientes/novo" icone={UserPlus} titulo="Cadastrar cliente" />
          <AtalhoOperador href={hrefRoteiro} icone={MapPin} titulo={roteiro?.situacao === "EmPreparacao" || !roteiro ? "Organizar roteiro" : "Executar roteiro"} />
          {roteiroAmanha && <AtalhoOperador href={`/roteiros?data=${dataAmanha}`} icone={CalendarDays} titulo={`Roteiro de amanhã · ${rotuloDoRoteiro(roteiroAmanha)}`} />}
        </CardContent>
      </Card>
    </div>

    {resumoRoteiro.total > 0 && <div className="mt-5" aria-label={`Progresso do roteiro: ${percentualRoteiro}%`}><div className="mb-2 flex justify-between text-xs text-muted-foreground"><span>Progresso do roteiro</span><span>{percentualRoteiro}%</span></div><div className="h-2 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuenow={percentualRoteiro} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full bg-primary" style={{ width: `${percentualRoteiro}%` }} /></div></div>}
  </>;
}

function IndicadorTarefa({ href, icone: Icone, titulo, valor, detalhe, destaque = false }: { href: string; icone: LucideIcon; titulo: string; valor: string; detalhe: string; destaque?: boolean }) {
  return <Link href={href} className="group block rounded-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
    <Card className="h-full rounded-lg transition-colors group-hover:border-primary/50">
      <CardContent className="p-4"><div className="flex items-start justify-between gap-3"><span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary"><Icone className="size-4" /></span>{destaque && <Badge>Atenção</Badge>}</div><strong className="mt-4 block text-2xl tabular-nums text-[var(--marca-azul-profundo)]">{valor}</strong><span className="mt-1 block text-sm font-medium">{titulo}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{detalhe}</span></CardContent>
    </Card>
  </Link>;
}

function AtalhoOperador({ href, icone: Icone, titulo }: { href: string; icone: LucideIcon; titulo: string }) {
  return <Button asChild variant="outline" className="h-11 w-full justify-start"><Link href={href}><Icone />{titulo}<ArrowRight className="ml-auto" /></Link></Button>;
}

function escolherProximaTarefa(resumo: ResumoOperacionalDasAcoes, roteiro: RoteiroDiario | null, roteiroAmanha: RoteiroDiario | null, dataHoje: string, dataAmanha: string) {
  const resumoRoteiro = resumirRoteiroDoDia(roteiro);
  const ativa = resumoRoteiro.proxima?.situacao === "EmDeslocamento" ? resumoRoteiro.proxima : null;
  if (ativa) return { titulo: `Continuar a parada de ${ativa.nomeCliente}`, descricao: `${ativa.tipo} em andamento · ${ativa.periodo}. Abra a parada para navegar ou concluir.`, href: `/meu-roteiro?data=${dataHoje}`, acao: "Abrir parada" };
  if (resumo.mensagensParaEnviar > 0) return { titulo: resumo.mensagensParaEnviar === 1 ? "Enviar 1 mensagem aprovada" : `Enviar ${resumo.mensagensParaEnviar} mensagens aprovadas`, descricao: "As mensagens já estão prontas. Revise cada cliente e confirme o envio individualmente.", href: "/acoes-comerciais?filtro=ParaEnviar", acao: "Abrir fila" };
  if (roteiro && roteiro.situacao !== "EmPreparacao" && resumoRoteiro.pendentes > 0) return { titulo: `Iniciar a próxima parada: ${resumoRoteiro.proxima?.nomeCliente}`, descricao: `${resumoRoteiro.pendentes} paradas ainda aguardam execução no roteiro de hoje.`, href: `/meu-roteiro?data=${dataHoje}`, acao: "Executar roteiro" };
  if (resumo.retornosParaRegistrar > 0) return { titulo: resumo.retornosParaRegistrar === 1 ? "Registrar 1 retorno comercial" : `Registrar ${resumo.retornosParaRegistrar} retornos comerciais`, descricao: "Há clientes já contatados aguardando o resultado do atendimento.", href: "/acoes-comerciais?filtro=Retornos", acao: "Registrar retornos" };
  if (resumo.falhasParaRevisar > 0) return { titulo: resumo.falhasParaRevisar === 1 ? "Revisar 1 falha de envio" : `Revisar ${resumo.falhasParaRevisar} falhas de envio`, descricao: "Confira quais mensagens não foram entregues antes de continuar o contato.", href: "/acoes-comerciais?filtro=Falhas", acao: "Ver falhas" };
  if (!roteiro || roteiro.situacao === "EmPreparacao") return { titulo: roteiro ? "Concluir o roteiro de hoje" : "Organizar o roteiro de hoje", descricao: roteiro ? "Revise a sequência e publique quando estiver pronta para execução." : "Crie a sequência de coletas e entregas antes de iniciar as visitas.", href: `/roteiros?data=${dataHoje}`, acao: "Organizar roteiro" };
  if (roteiroAmanha?.situacao === "EmPreparacao") return { titulo: "Preparar o roteiro de amanhã", descricao: "O atendimento de hoje está em dia. Antecipe a organização das próximas coletas e entregas.", href: `/roteiros?data=${dataAmanha}`, acao: "Organizar amanhã" };
  return { titulo: "Atendimento pronto", descricao: "Busque um cliente ou registre um novo atendimento quando ele chegar.", href: "/clientes", acao: "Buscar cliente" };
}

function rotuloDoRoteiro(roteiro: RoteiroDiario | null) {
  if (!roteiro) return "Ainda não criado";
  return ({ EmPreparacao: "Em preparação", Publicado: "Publicado", EmAndamento: "Em andamento", Finalizado: "Finalizado" } as const)[roteiro.situacao];
}

function formatarNome(valor: string) { return valor === valor.toLocaleUpperCase("pt-BR") ? valor.toLocaleLowerCase("pt-BR").replace(/(^|[\s'-])\p{L}/gu, (letra) => letra.toLocaleUpperCase("pt-BR")) : valor; }
function resumirLinhas(linhas: ResumoMovimentacaoComercial["linhas"]) { return linhas.length ? linhas.map((linha) => `${linha.quantidade}× ${linha.nomeArtigo} · ${linha.nomeServico}`).join("; ") : "Atendimento comercial"; }
function formatarHora(valor: string) { return new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" }).format(new Date(valor)); }
