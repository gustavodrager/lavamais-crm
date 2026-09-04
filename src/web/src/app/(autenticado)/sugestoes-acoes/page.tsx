import { redirect } from "next/navigation";
import { Lightbulb, Users } from "lucide-react";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { EstadoFalhaApi } from "@/components/estado-falha-api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErroCrmApi } from "@/infraestrutura/crm-api-http";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";
import { obterPortaSessao } from "@/infraestrutura/obter-porta-sessao";
import { papelDaVisao } from "@/lib/sessao-apresentacao";
import { BotaoGerarAcao } from "./botao-gerar-acao";

export default async function SugestoesDeAcoes() {
  const sessao = await obterPortaSessao().obterSessao();
  if (!sessao) redirect("/entrar?retorno=/sugestoes-acoes");
  if (papelDaVisao(sessao) !== "Administrador") redirect("/inicio");
  let sugestoes;
  try { sugestoes = await obterPortaCrmApi().listarSugestoesDeAcoes(); }
  catch (erro) { if (erro instanceof ErroCrmApi) return <><CabecalhoPagina titulo="Sugestões de Ações" descricao="O CRM analisa o histórico e indica oportunidades simples de contato por WhatsApp." /><EstadoFalhaApi status={erro.status} /></>; throw erro; }

  return <>
    <CabecalhoPagina titulo="Sugestões de Ações" descricao="O CRM analisa o histórico e indica oportunidades simples de contato por WhatsApp." />
    <Alert className="mb-5"><Lightbulb aria-hidden="true" /><AlertTitle>Você continua no controle</AlertTitle><AlertDescription>Gerar cria um rascunho com os clientes indicados. Depois escolha uma mensagem padrão aprovada e envie a ação para o gerente aprovar.</AlertDescription></Alert>
    <div className="grid gap-4 lg:grid-cols-2">
      {sugestoes.map((sugestao) => <Card key={sugestao.codigo} className="flex flex-col"><CardHeader><div className="flex items-start justify-between gap-3"><div><CardTitle>{sugestao.nome}</CardTitle><CardDescription className="mt-2">{sugestao.motivo}</CardDescription></div><span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">Prioridade {sugestao.prioridade}</span></div></CardHeader><CardContent className="flex flex-1 flex-col gap-4"><dl className="grid grid-cols-2 gap-3 rounded-xl bg-secondary/60 p-4"><div><dt className="text-xs text-muted-foreground">Clientes indicados</dt><dd className="mt-1 flex items-center gap-1.5 text-xl font-semibold tabular-nums"><Users className="size-4" />{sugestao.quantidadeClientes}</dd></div><div><dt className="text-xs text-muted-foreground">Histórico de compras</dt><dd className="mt-1 text-xl font-semibold tabular-nums">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(sugestao.receitaHistorica)}</dd></div></dl><div><p className="text-xs font-semibold text-muted-foreground">Mensagem sugerida</p><p className="mt-2 rounded-xl border bg-card p-3 text-sm leading-6">{sugestao.mensagemSugerida.replaceAll("{{nomeCliente}}", "Cliente")}</p></div><div className="mt-auto"><BotaoGerarAcao codigo={sugestao.codigo} desabilitado={sugestao.quantidadeClientes === 0} /></div></CardContent></Card>)}
    </div>
  </>;
}
