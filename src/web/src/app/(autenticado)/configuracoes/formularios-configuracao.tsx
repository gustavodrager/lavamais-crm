"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { CircleCheck, MessageCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { carregarCatalogoInicial, criarEtiqueta, criarServico } from "./acoes";

type Item = {
  id: string;
  nome: string;
  categoria: string | null;
  valorReferencia: number | null;
  situacao: "Ativo" | "Inativo";
  codigoExterno: string | null;
};
type Etiqueta = { id: string; nome: string };
type SecaoConfiguracao = "servicos" | "etiquetas";

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function FormulariosConfiguracao({
  itens,
  etiquetas,
  secaoInicial = "servicos",
  podeCarregarCatalogoInicial,
}: {
  itens: Item[];
  etiquetas: Etiqueta[];
  secaoInicial?: SecaoConfiguracao;
  podeCarregarCatalogoInicial: boolean;
}) {
  const secao = secaoInicial;
  return <div className="space-y-5">
    <StatusCanalMensagens />
    <nav aria-label="Áreas de configuração" className="flex gap-2 rounded-xl border bg-secondary/60 p-2">
      <Button asChild variant={secao === "servicos" ? "default" : "ghost"} className="min-h-11">
        <Link href="/configuracoes" aria-current={secao === "servicos" ? "page" : undefined}>Catálogo</Link>
      </Button>
      <Button asChild variant={secao === "etiquetas" ? "default" : "ghost"} className="min-h-11">
        <Link href="/configuracoes?secao=etiquetas" aria-current={secao === "etiquetas" ? "page" : undefined}>Etiquetas</Link>
      </Button>
    </nav>
    <div className="mx-auto max-w-4xl">{secao === "servicos"
      ? <FormularioServico itens={itens} podeCarregarCatalogoInicial={podeCarregarCatalogoInicial} />
      : <FormularioEtiqueta etiquetas={etiquetas} />}
    </div>
  </div>;
}

function StatusCanalMensagens() {
  return <section aria-labelledby="titulo-status-mensagens" className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4">
    <div className="flex min-w-0 items-center gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><MessageCircle className="size-5" aria-hidden="true" /></span>
      <div><h2 id="titulo-status-mensagens" className="font-medium">WhatsApp Web assistido</h2><p className="text-sm text-muted-foreground">A conversa abre no WhatsApp oficial e o envio é confirmado manualmente no CRM.</p></div>
    </div>
    <Badge variant="outline" className="text-emerald-700"><CircleCheck aria-hidden="true" />Disponível</Badge>
  </section>;
}

function FormularioServico({ itens, podeCarregarCatalogoInicial }: { itens: Item[]; podeCarregarCatalogoInicial: boolean }) {
  const referencia = useRef<HTMLFormElement>(null);
  const [retorno, setRetorno] = useState<{ sucesso: boolean; mensagem: string } | null>(null);
  const [resumoCarga, setResumoCarga] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();

  function enviar(dados: FormData) {
    iniciar(async () => {
      const resultado = await criarServico({
        nome: String(dados.get("nome") ?? ""),
        categoria: String(dados.get("categoria") ?? ""),
        valorReferencia: String(dados.get("valorReferencia") ?? ""),
        codigoExterno: String(dados.get("codigoExterno") ?? ""),
      });
      if (resultado.sucesso) {
        referencia.current?.reset();
        setRetorno({ sucesso: true, mensagem: "Serviço adicionado ao catálogo das ações comerciais." });
      } else setRetorno({ sucesso: false, mensagem: resultado.mensagem });
    });
  }

  function carregar() {
    iniciar(async () => {
      const resultado = await carregarCatalogoInicial();
      if (resultado.sucesso) {
        setRetorno(null);
        setResumoCarga(resultado.resumo ?? "Catálogo inicial conferido.");
      } else {
        setResumoCarga(null);
        setRetorno({ sucesso: false, mensagem: resultado.mensagem });
      }
    });
  }

  return <Card>
    <CardHeader><CardTitle>Itens das ações comerciais</CardTitle><CardDescription>Serviços que podem ser vinculados à criação de uma ação.</CardDescription></CardHeader>
    <CardContent className="space-y-5">
      <section aria-labelledby="titulo-servicos-cadastrados">
        <div className="mb-3 flex items-center justify-between gap-3"><h3 id="titulo-servicos-cadastrados" className="font-medium">Serviços cadastrados</h3><Badge variant="secondary">{itens.length}</Badge></div>
        {itens.length === 0 ? <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">Nenhum serviço cadastrado.</p> : <ul className="divide-y rounded-lg border">{itens.map((item) => <li key={item.id} className="flex flex-col justify-between gap-2 p-3 sm:flex-row sm:items-center">
          <div><span className="font-medium">{item.nome}</span><span className="mt-1 block text-xs text-muted-foreground">{item.categoria ?? "Sem categoria"}{item.valorReferencia !== null ? ` · ${moeda.format(item.valorReferencia)}` : " · Sem valor de referência"}</span></div>
          <Badge variant={item.situacao === "Ativo" ? "secondary" : "outline"}>{item.situacao}</Badge>
        </li>)}</ul>}
      </section>
      <form ref={referencia} action={enviar} className="space-y-4 border-t pt-5">
        <h3 className="font-medium">Adicionar serviço</h3>
        <div className="space-y-2"><Label htmlFor="servico-nome">Nome</Label><Input id="servico-nome" name="nome" required /></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2"><Label htmlFor="servico-categoria">Categoria</Label><Input id="servico-categoria" name="categoria" /></div>
          <div className="space-y-2"><Label htmlFor="servico-valor">Valor de referência (R$)</Label><Input id="servico-valor" name="valorReferencia" inputMode="decimal" /></div>
        </div>
        <details className="rounded-lg border p-3"><summary className="cursor-pointer text-sm font-medium">Dados de integração</summary><div className="mt-3 space-y-2"><Label htmlFor="servico-codigo">Código externo</Label><Input id="servico-codigo" name="codigoExterno" /></div></details>
        {retorno ? <Alert variant={retorno.sucesso ? "default" : "destructive"}><AlertTitle>{retorno.sucesso ? "Serviço adicionado" : "Não foi possível salvar"}</AlertTitle><AlertDescription>{retorno.mensagem}</AlertDescription></Alert> : null}
        <Button type="submit" disabled={pendente}>{pendente ? "Salvando..." : "Adicionar serviço"}</Button>
      </form>
      {podeCarregarCatalogoInicial ? <section className="border-t pt-5" aria-labelledby="titulo-catalogo-movimentacoes">
        <h3 id="titulo-catalogo-movimentacoes" className="font-medium">Catálogo de atendimentos</h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">Cria artigos, serviços aplicáveis e preços iniciais sem duplicar registros existentes.</p>
        <Button type="button" variant="outline" className="mt-3" disabled={pendente} onClick={carregar}>{pendente ? "Carregando..." : "Carregar catálogo inicial"}</Button>
        {resumoCarga ? <Alert className="mt-3"><AlertTitle>Catálogo conferido</AlertTitle><AlertDescription>{resumoCarga}</AlertDescription></Alert> : null}
      </section> : null}
    </CardContent>
  </Card>;
}

function FormularioEtiqueta({ etiquetas }: { etiquetas: Etiqueta[] }) {
  const referencia = useRef<HTMLFormElement>(null);
  const [retorno, setRetorno] = useState<{ sucesso: boolean; mensagem: string } | null>(null);
  const [pendente, iniciar] = useTransition();

  function enviar(dados: FormData) {
    iniciar(async () => {
      const resultado = await criarEtiqueta({ nome: String(dados.get("nome") ?? "") });
      if (resultado.sucesso) {
        referencia.current?.reset();
        setRetorno({ sucesso: true, mensagem: "Etiqueta adicionada e disponível para organizar clientes." });
      } else setRetorno({ sucesso: false, mensagem: resultado.mensagem });
    });
  }

  return <Card>
    <CardHeader><CardTitle>Etiquetas de clientes</CardTitle><CardDescription>Marcadores declarados para organizar e selecionar clientes.</CardDescription></CardHeader>
    <CardContent className="space-y-5">
      <section aria-labelledby="titulo-etiquetas-cadastradas">
        <div className="mb-3 flex items-center justify-between gap-3"><h3 id="titulo-etiquetas-cadastradas" className="font-medium">Etiquetas cadastradas</h3><Badge variant="secondary">{etiquetas.length}</Badge></div>
        {etiquetas.length === 0 ? <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">Nenhuma etiqueta cadastrada.</p> : <ul className="flex flex-wrap gap-2 rounded-lg border p-3">{etiquetas.map((item) => <li key={item.id}><Badge variant="secondary">{item.nome}</Badge></li>)}</ul>}
      </section>
      <form ref={referencia} action={enviar} className="space-y-4 border-t pt-5">
        <h3 className="font-medium">Adicionar etiqueta</h3>
        <div className="space-y-2"><Label htmlFor="etiqueta-nome">Nome</Label><Input id="etiqueta-nome" name="nome" required /></div>
        {retorno ? <Alert variant={retorno.sucesso ? "default" : "destructive"}><AlertTitle>{retorno.sucesso ? "Etiqueta adicionada" : "Não foi possível salvar"}</AlertTitle><AlertDescription>{retorno.mensagem}</AlertDescription></Alert> : null}
        <Button type="submit" disabled={pendente}>{pendente ? "Salvando..." : "Adicionar etiqueta"}</Button>
      </form>
    </CardContent>
  </Card>;
}
