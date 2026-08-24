"use client";

import { useRef, useState, useTransition } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { OpcaoModeloDeMensagem } from "@/contratos/apresentacao";
import { modelosPadraoLavaMais, type ModeloPadraoLavaMais } from "@/conteudo/modelos-padrao-lavamais";
import { criarEtiqueta, criarModelo, criarServico, type ResultadoConfiguracao } from "./acoes";

type Item = { id: string; nome: string; categoria: string | null; valorReferencia: number | null; codigoExterno: string | null };
type Etiqueta = { id: string; nome: string };

export function FormulariosConfiguracao({ itens, etiquetas, modelos }: { itens: Item[]; etiquetas: Etiqueta[]; modelos: OpcaoModeloDeMensagem[] }) {
  return <div className="grid gap-5 xl:grid-cols-3"><FormularioServico itens={itens} /><FormularioEtiqueta etiquetas={etiquetas} /><FormularioModelo modelos={modelos} /></div>;
}

function FormularioServico({ itens }: { itens: Item[] }) {
  const referencia = useRef<HTMLFormElement>(null); const [mensagem, setMensagem] = useState<string | null>(null); const [pendente, iniciar] = useTransition();
  function enviar(dados: FormData) { iniciar(async () => concluir(await criarServico({ nome: String(dados.get("nome") ?? ""), categoria: String(dados.get("categoria") ?? ""), valorReferencia: String(dados.get("valorReferencia") ?? ""), codigoExterno: String(dados.get("codigoExterno") ?? "") }), referencia.current, setMensagem)); }
  return <Card><CardHeader><CardTitle>Serviços</CardTitle><CardDescription>Itens oferecidos nas ações comerciais.</CardDescription></CardHeader><CardContent className="space-y-5"><form ref={referencia} action={enviar} className="space-y-3"><Campo id="servico-nome" rotulo="Nome"><Input id="servico-nome" name="nome" required /></Campo><Campo id="servico-categoria" rotulo="Categoria"><Input id="servico-categoria" name="categoria" /></Campo><div className="grid grid-cols-2 gap-3"><Campo id="servico-valor" rotulo="Valor"><Input id="servico-valor" name="valorReferencia" inputMode="decimal" /></Campo><Campo id="servico-codigo" rotulo="Código externo"><Input id="servico-codigo" name="codigoExterno" /></Campo></div><Mensagem mensagem={mensagem} /><Button type="submit" disabled={pendente}>{pendente ? "Salvando..." : "Adicionar serviço"}</Button></form><ListaVaziaOuItens vazio="Nenhum serviço cadastrado." itens={itens.map((item) => <li key={item.id} className="flex justify-between gap-3"><span>{item.nome}</span><Badge variant="secondary">{item.categoria ?? "Sem categoria"}</Badge></li>)} /></CardContent></Card>;
}

function FormularioEtiqueta({ etiquetas }: { etiquetas: Etiqueta[] }) {
  const referencia = useRef<HTMLFormElement>(null); const [mensagem, setMensagem] = useState<string | null>(null); const [pendente, iniciar] = useTransition();
  function enviar(dados: FormData) { iniciar(async () => concluir(await criarEtiqueta({ nome: String(dados.get("nome") ?? "") }), referencia.current, setMensagem)); }
  return <Card><CardHeader><CardTitle>Etiquetas</CardTitle><CardDescription>Marcadores declarados para organizar clientes.</CardDescription></CardHeader><CardContent className="space-y-5"><form ref={referencia} action={enviar} className="space-y-3"><Campo id="etiqueta-nome" rotulo="Nome"><Input id="etiqueta-nome" name="nome" required /></Campo><Mensagem mensagem={mensagem} /><Button type="submit" disabled={pendente}>{pendente ? "Salvando..." : "Adicionar etiqueta"}</Button></form><ListaVaziaOuItens vazio="Nenhuma etiqueta cadastrada." itens={etiquetas.map((item) => <li key={item.id}><Badge variant="secondary">{item.nome}</Badge></li>)} /></CardContent></Card>;
}

function FormularioModelo({ modelos }: { modelos: OpcaoModeloDeMensagem[] }) {
  const referencia = useRef<HTMLFormElement>(null); const [mensagem, setMensagem] = useState<string | null>(null); const [pendente, iniciar] = useTransition();
  function usarModelo(modelo: ModeloPadraoLavaMais) {
    const formulario = referencia.current;
    if (!formulario) return;
    const nome = formulario.elements.namedItem("nome");
    const conteudo = formulario.elements.namedItem("conteudoPreVisualizacao");
    if (nome instanceof HTMLInputElement) nome.value = modelo.nome;
    if (conteudo instanceof HTMLTextAreaElement) conteudo.value = modelo.conteudoPreVisualizacao;
    if (nome instanceof HTMLInputElement) nome.focus();
  }
  function enviar(dados: FormData) { iniciar(async () => concluir(await criarModelo({ nome: String(dados.get("nome") ?? ""), conteudoPreVisualizacao: String(dados.get("conteudoPreVisualizacao") ?? ""), chaveTemplateNotificacao: String(dados.get("chaveTemplateNotificacao") ?? "") }), referencia.current, setMensagem)); }
  return <Card><CardHeader><CardTitle>Modelos de mensagem</CardTitle><CardDescription>Mensagens comerciais da LavaMais vinculadas a templates aprovados na Central de Notificação.</CardDescription></CardHeader><CardContent className="space-y-5"><section aria-labelledby="titulo-modelos-padrao" className="space-y-3"><div><h3 id="titulo-modelos-padrao" className="font-medium">Sugestões LavaMais</h3><p className="text-xs text-muted-foreground">Escolha uma mensagem para preencher o formulário.</p></div><div className="grid gap-2">{modelosPadraoLavaMais.map((modelo) => <button key={modelo.id} type="button" onClick={() => usarModelo(modelo)} className="min-h-11 rounded-lg border bg-card px-3 py-2 text-left transition-colors hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"><span className="block text-sm font-medium">{modelo.nome}</span><span className="block text-xs text-muted-foreground">{modelo.objetivo}</span></button>)}</div></section><form ref={referencia} action={enviar} className="space-y-3 border-t pt-5"><Campo id="modelo-nome" rotulo="Nome"><Input id="modelo-nome" name="nome" required /></Campo><Campo id="modelo-template" rotulo="Chave aprovada na Central de Notificação"><Input id="modelo-template" name="chaveTemplateNotificacao" required /></Campo><Campo id="modelo-conteudo" rotulo="Pré-visualização"><Textarea id="modelo-conteudo" name="conteudoPreVisualizacao" placeholder="Olá, {{nomeCliente}}! Conheça {{itemCatalogo}}." required /></Campo><p className="text-xs text-muted-foreground">A mensagem só deve ser publicada depois que a chave correspondente estiver disponível na Central de Notificação.</p><Mensagem mensagem={mensagem} /><Button type="submit" disabled={pendente}>{pendente ? "Publicando..." : "Criar e publicar"}</Button></form><ListaVaziaOuItens vazio="Nenhum modelo publicado." itens={modelos.map((item) => <li key={item.versaoId}><span>{item.nome}</span><Badge variant="secondary" className="ml-2">v{item.numeroVersao}</Badge></li>)} /></CardContent></Card>;
}

function concluir(resultado: ResultadoConfiguracao, formulario: HTMLFormElement | null, definirMensagem: (mensagem: string | null) => void) { if (resultado.sucesso) { formulario?.reset(); definirMensagem(null); } else definirMensagem(resultado.mensagem); }
function Campo({ id, rotulo, children }: { id: string; rotulo: string; children: React.ReactNode }) { return <div className="space-y-2"><Label htmlFor={id}>{rotulo}</Label>{children}</div>; }
function Mensagem({ mensagem }: { mensagem: string | null }) { return mensagem ? <Alert variant="destructive"><AlertDescription>{mensagem}</AlertDescription></Alert> : null; }
function ListaVaziaOuItens({ vazio, itens }: { vazio: string; itens: React.ReactNode[] }) { return itens.length ? <ul className="space-y-2 border-t pt-4 text-sm">{itens}</ul> : <p className="border-t pt-4 text-sm text-muted-foreground">{vazio}</p>; }
