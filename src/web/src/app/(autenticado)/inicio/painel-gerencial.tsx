import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  CalendarDays,
  ClipboardCheck,
  ListChecks,
  MessageCircle,
  Plus,
  ReceiptText,
  Route,
  Send,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ResumoAcaoComercial, RoteiroDiario } from "@/contratos/apresentacao";
import { rotuloProximaAcao, selecionarAcaoPrioritaria } from "@/lib/acoes-comerciais";
import type { ResumoComercialDoPainel, ResumoMovimentacoesDoDia } from "@/lib/painel-inicial";
import { resumirRoteiroDoDia } from "@/lib/painel-inicial";
import { cn } from "@/lib/utils";

interface PainelGerencialProps {
  acoes: ResumoAcaoComercial[];
  resumo: ResumoComercialDoPainel;
  roteiro: RoteiroDiario | null;
  roteiroAmanha: RoteiroDiario | null;
  resumoMovimentacoes: ResumoMovimentacoesDoDia;
  dataHoje: string;
  dataAmanha: string;
  rotuloMes: string;
}

export function PainelGerencial({ acoes, resumo, roteiro, roteiroAmanha, resumoMovimentacoes, dataHoje, dataAmanha, rotuloMes }: PainelGerencialProps) {
  const acaoComFalhasId = resumo.porAcao.find((item) => item.falhasParaRevisar > 0)?.acaoId;
  const acaoComMensagensId = resumo.porAcao.find((item) => item.mensagensParaEnviar > 0)?.acaoId;
  const acaoComRetornosId = resumo.porAcao.find((item) => item.retornosParaRegistrar > 0)?.acaoId;
  const destaqueId = acaoComFalhasId ?? acaoComMensagensId ?? acaoComRetornosId;
  const destaque = acoes.find((acao) => acao.id === destaqueId) ?? selecionarAcaoPrioritaria(acoes);
  const resumoDestaque = resumo.porAcao.find((item) => item.acaoId === destaque?.id);
  const conteudoDestaque = criarConteudoDestaque(destaque, resumoDestaque);

  return <>
    <CabecalhoPagina
      titulo="Olá! O que precisa ser feito agora?"
      descricao="Priorize os contatos pendentes e acompanhe o resultado comercial."
      acao={<Button asChild><Link href="/acoes-comerciais/nova"><Plus />Criar ação comercial</Link></Button>}
    />

    <Card>
      <CardHeader>
        <div className={cn("flex items-center gap-2 text-xs font-semibold uppercase text-primary", conteudoDestaque.atencao && "text-destructive")}>
          {conteudoDestaque.atencao ? <TriangleAlert className="size-4" /> : <ClipboardCheck className="size-4" />}
          {conteudoDestaque.sobretitulo}
        </div>
        <CardTitle><h2>{conteudoDestaque.titulo}</h2></CardTitle>
        <CardDescription>{conteudoDestaque.descricao}</CardDescription>
      </CardHeader>
      <CardContent>
        {destaque ? <Button asChild className="w-full sm:w-auto"><Link href={`/acoes-comerciais/${destaque.id}`}>{conteudoDestaque.acao}<ArrowRight /></Link></Button> : <Button asChild variant="outline"><Link href="/acoes-comerciais/nova">Criar primeira ação<ArrowRight /></Link></Button>}
      </CardContent>
    </Card>

    <section className="mt-6" aria-labelledby="titulo-operacao-painel">
      <CabecalhoSecao id="titulo-operacao-painel" titulo="Operação de hoje" descricao="Roteiro e atendimentos do dia." complemento="Hoje" />
      <div className="grid items-stretch gap-5 lg:grid-cols-2">
        <ResumoRoteiroGerencial roteiro={roteiro} roteiroAmanha={roteiroAmanha} dataHoje={dataHoje} dataAmanha={dataAmanha} />
        <ResumoMovimentacoesGerencial resumo={resumoMovimentacoes} />
      </div>
    </section>

    <section className="mt-6" aria-labelledby="titulo-pendencias-painel">
      <CabecalhoSecao id="titulo-pendencias-painel" titulo="Pendências" descricao="Trabalho que exige uma ação da equipe." complemento="Atualizado agora" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Indicador className="col-span-2 sm:col-span-1" icone={Send} rotulo="Mensagens para enviar" valor={resumo.mensagensParaEnviar} href={caminhoDaAcao(acaoComMensagensId)} />
        <Indicador icone={TriangleAlert} rotulo="Falhas para revisar" valor={resumo.falhasParaRevisar} href={caminhoDaAcao(acaoComFalhasId)} destaque="perigo" />
        <Indicador icone={ClipboardCheck} rotulo="Retornos para registrar" valor={resumo.retornosParaRegistrar} href={caminhoDaAcao(acaoComRetornosId)} />
      </div>
    </section>

    <section className="mt-6" aria-labelledby="titulo-resultados-painel">
      <CabecalhoSecao id="titulo-resultados-painel" titulo="Resultado comercial" descricao="Resultados registrados nas ações comerciais." complemento={rotuloMes} />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Indicador icone={ListChecks} rotulo="Resultados registrados" valor={resumo.resultadosRegistrados} href="/acoes-comerciais" />
        <Indicador icone={MessageCircle} rotulo="Interessados" valor={resumo.interessados} href="/acoes-comerciais" />
        <Indicador icone={BadgeCheck} rotulo="Conversões" valor={resumo.conversoes} href="/acoes-comerciais" />
        <Indicador icone={Banknote} rotulo="Valor convertido informado" valor={moeda.format(resumo.valorConvertido)} href="/acoes-comerciais" />
      </div>
    </section>
  </>;
}

function ResumoRoteiroGerencial({ roteiro, roteiroAmanha, dataHoje, dataAmanha }: {
  roteiro: RoteiroDiario | null;
  roteiroAmanha: RoteiroDiario | null;
  dataHoje: string;
  dataAmanha: string;
}) {
  const resumo = resumirRoteiroDoDia(roteiro);
  const resumoAmanha = resumirRoteiroDoDia(roteiroAmanha);
  const percentual = resumo.total > 0 ? Math.round((resumo.registradas / resumo.total) * 100) : 0;
  const rotuloSituacao = roteiro ? rotulosSituacaoRoteiro[roteiro.situacao] : "Não criado";
  const paradasNaoRealizadas = roteiro?.paradas.filter((parada) => parada.situacao === "NaoRealizada") ?? [];
  const resumoDoRoteiroAmanha = roteiroAmanha
    ? `${rotulosSituacaoRoteiro[roteiroAmanha.situacao]} · ${plural(resumoAmanha.total, "parada", "paradas")}`
    : "Roteiro ainda não criado";

  return <Card>
    <CardHeader>
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Route className="size-4" aria-hidden="true" /></span>
        <Badge variant="secondary">{rotuloSituacao}</Badge>
      </div>
      <CardTitle><h3>Roteiro de hoje</h3></CardTitle>
      <CardDescription>{roteiro ? `Motorista: ${roteiro.nomeMotorista}` : "Aguardando organização da recepção"}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <span className="text-xs text-muted-foreground">Paradas registradas</span>
          <strong className="shrink-0 text-sm tabular-nums text-[var(--marca-azul-profundo)]">{resumo.registradas} de {resumo.total}</strong>
        </div>
        {roteiro ? <>
          <div className="h-2 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-label={`Progresso do roteiro: ${percentual}%`} aria-valuenow={percentual} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full bg-primary" style={{ width: `${percentual}%` }} /></div>
          <dl className="grid grid-cols-3 gap-2 text-center"><div><dt className="text-[0.6875rem] text-muted-foreground">Pendentes</dt><dd className="mt-1 text-sm font-semibold tabular-nums">{resumo.pendentes}</dd></div><div><dt className="text-[0.6875rem] text-muted-foreground">A caminho</dt><dd className="mt-1 text-sm font-semibold tabular-nums">{resumo.emDeslocamento}</dd></div><div><dt className="text-[0.6875rem] text-muted-foreground">Não realizadas</dt><dd className={cn("mt-1 text-sm font-semibold tabular-nums", resumo.naoRealizadas > 0 && "text-destructive")}>{resumo.naoRealizadas}</dd></div></dl>
          {paradasNaoRealizadas.length > 0 ? <p className="flex items-start gap-2 rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive"><TriangleAlert className="mt-0.5 size-3.5 shrink-0" /><span><strong>{plural(paradasNaoRealizadas.length, "parada não realizada", "paradas não realizadas")}:</strong> {resumirParadasNaoRealizadas(paradasNaoRealizadas)}</span></p> : null}
        </> : <p className="text-xs text-muted-foreground">O roteiro de hoje ainda não foi criado.</p>}
      </div>

      <Link href={`/roteiros?data=${dataAmanha}`} className="flex items-center gap-2 rounded-lg bg-secondary/60 px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"><CalendarDays className="size-3.5 shrink-0" /><span className="min-w-0 flex-1"><strong className="text-foreground">Amanhã:</strong> {resumoDoRoteiroAmanha}</span><ArrowRight className="size-3.5 shrink-0" /></Link>
      <Button asChild variant="outline" className="w-full justify-between"><Link href={`/roteiros?data=${dataHoje}`}>{roteiro ? "Ver roteiro" : "Criar roteiro"}<ArrowRight /></Link></Button>
    </CardContent>
  </Card>;
}

function ResumoMovimentacoesGerencial({ resumo }: { resumo: ResumoMovimentacoesDoDia }) {
  const ultimoRegistro = resumo.registradas[0];

  return <Card>
    <CardHeader>
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><ReceiptText className="size-4" aria-hidden="true" /></span>
        <Badge variant="secondary">{plural(resumo.quantidadeRegistradas, "registro", "registros")}</Badge>
      </div>
      <CardTitle><h3>Atendimentos de hoje</h3></CardTitle>
      <CardDescription>Visitas comerciais registradas pela equipe.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <dl className="grid grid-cols-3 gap-3"><div><dt className="text-xs text-muted-foreground">Registros</dt><dd className="mt-1 text-base font-semibold tabular-nums text-[var(--marca-azul-profundo)]">{resumo.quantidadeRegistradas}</dd></div><div><dt className="text-xs text-muted-foreground">Clientes</dt><dd className="mt-1 text-base font-semibold tabular-nums text-[var(--marca-azul-profundo)]">{resumo.clientesUnicos}</dd></div><div><dt className="text-xs text-muted-foreground">Valor informado</dt><dd className="mt-1 text-base font-semibold tabular-nums text-[var(--marca-azul-profundo)]">{moeda.format(resumo.valorInformado)}</dd></div></dl>
      {ultimoRegistro ? <div className="border-t pt-3"><p className="text-xs text-muted-foreground">Último atendimento</p><div className="mt-1 flex items-center justify-between gap-3 text-sm"><strong className="truncate">{ultimoRegistro.nomeCliente}</strong><span className="shrink-0 tabular-nums">{moeda.format(ultimoRegistro.valorTotal)}</span></div></div> : <p className="border-t pt-3 text-xs text-muted-foreground">Nenhum atendimento válido foi registrado hoje.</p>}
      {resumo.quantidadeCanceladas > 0 ? <p className="flex items-center gap-2 rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive"><TriangleAlert className="size-3.5 shrink-0" />{plural(resumo.quantidadeCanceladas, "registro cancelado", "registros cancelados")}</p> : null}
      <Button asChild variant="outline" className="w-full justify-between"><Link href="/movimentacoes">Ver atendimentos<ArrowRight /></Link></Button>
    </CardContent>
  </Card>;
}

function resumirParadasNaoRealizadas(paradas: RoteiroDiario["paradas"]) {
  const detalhes = paradas.slice(0, 2).map((parada) => `${parada.nomeCliente} · ${parada.motivoNaoRealizacao ?? "motivo não informado"}`);
  return paradas.length > 2 ? `${detalhes.join("; ")} e mais ${paradas.length - 2}` : detalhes.join("; ");
}

function Indicador({ icone: Icone, rotulo, valor, href, destaque, className }: { icone: LucideIcon; rotulo: string; valor: number | string; href: string; destaque?: "perigo"; className?: string }) {
  const conteudo = <Card size="sm" className={cn("h-full gap-0 py-0 transition-colors", href && "group-hover:ring-primary/35")}>
    <CardContent className="flex min-h-24 items-center gap-3 p-4">
      <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary", destaque === "perigo" && "bg-destructive/10 text-destructive")}><Icone className="size-4" aria-hidden="true" /></span>
      <div className="min-w-0"><p className="text-xl font-bold tabular-nums text-[var(--marca-azul-profundo)]">{valor}</p><p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">{rotulo}</p></div>
    </CardContent>
  </Card>;

  return <Link href={href} aria-label={`${rotulo}: ${valor}`} className={cn("group block min-w-0 rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50", className)}>{conteudo}</Link>;
}

function CabecalhoSecao({ id, titulo, descricao, complemento }: { id: string; titulo: string; descricao: string; complemento: string }) {
  return <div className="mb-3 flex items-end justify-between gap-4"><div><h2 id={id} className="font-heading text-base font-semibold text-[var(--marca-azul-profundo)]">{titulo}</h2><p className="text-xs text-muted-foreground">{descricao}</p></div><span className="shrink-0 text-xs text-muted-foreground">{complemento}</span></div>;
}

function criarConteudoDestaque(acao: ResumoAcaoComercial | null, resumo?: ResumoComercialDoPainel["porAcao"][number]) {
  if (!acao) return { sobretitulo: "Tudo em dia", titulo: "Nenhuma pendência agora", descricao: "Comece uma nova ação comercial quando houver uma oportunidade de contato.", acao: "Criar ação", atencao: false };
  if (resumo?.falhasParaRevisar) return { sobretitulo: "Atenção agora", titulo: plural(resumo.falhasParaRevisar, "falha precisa", "falhas precisam") + " de revisão", descricao: `Confira os problemas de envio em “${acao.nome}”.`, acao: "Revisar falhas", atencao: true };
  if (resumo?.mensagensParaEnviar) return { sobretitulo: "Próxima tarefa", titulo: plural(resumo.mensagensParaEnviar, "mensagem aguarda", "mensagens aguardam") + " envio", descricao: `Continue “${acao.nome}” e confira cada mensagem antes de enviar.`, acao: "Continuar envios", atencao: false };
  if (resumo?.retornosParaRegistrar) return { sobretitulo: "Próxima tarefa", titulo: plural(resumo.retornosParaRegistrar, "retorno aguarda", "retornos aguardam") + " registro", descricao: `Registre o resultado dos contatos de “${acao.nome}”.`, acao: "Registrar retornos", atencao: false };
  return { sobretitulo: "Próxima tarefa", titulo: acao.nome, descricao: descricaoProximaAcao(acao), acao: rotuloProximaAcao(acao.situacao), atencao: acao.situacao === "ConcluidaComFalhas" };
}

function descricaoProximaAcao(acao: ResumoAcaoComercial) {
  if (acao.situacao === "ConcluidaComFalhas") return "Confira as falhas antes de seguir com outras ações.";
  if (acao.situacao === "Preparada") return "A lista e a mensagem estão prontas para os envios individuais.";
  if (acao.situacao === "Rascunho") return "Continue a configuração da ação mais recente.";
  return "Acompanhe os envios e registre os resultados comerciais.";
}

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const rotulosSituacaoRoteiro = { EmPreparacao: "Em preparação", Publicado: "Publicado", EmAndamento: "Em andamento", Finalizado: "Finalizado" };
const caminhoDaAcao = (id?: string) => id ? `/acoes-comerciais/${id}` : "/acoes-comerciais";
const plural = (quantidade: number, singular: string, plural: string) => `${quantidade} ${quantidade === 1 ? singular : plural}`;
