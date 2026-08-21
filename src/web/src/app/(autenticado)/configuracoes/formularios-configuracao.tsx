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
  function enviar(dados: FormData) { iniciar(async () => concluir(await criarModelo({ nome: String(dados.get("nome") ?? ""), conteudoPreVisualizacao: String(dados.get("conteudoPreVisualizacao") ?? ""), chaveTemplateNotificacao: String(dados.get("chaveTemplateNotificacao") ?? "") }), referencia.current, setMensagem)); }
  return <Card><CardHeader><CardTitle>Modelos de mensagem</CardTitle><CardDescription>Templates aprovados no Notification Hub.</CardDescription></CardHeader><CardContent className="space-y-5"><form ref={referencia} action={enviar} className="space-y-3"><Campo id="modelo-nome" rotulo="Nome"><Input id="modelo-nome" name="nome" required /></Campo><Campo id="modelo-template" rotulo="Chave do template"><Input id="modelo-template" name="chaveTemplateNotificacao" required /></Campo><Campo id="modelo-conteudo" rotulo="Pré-visualização"><Textarea id="modelo-conteudo" name="conteudoPreVisualizacao" placeholder="Olá, {{nomeCliente}}! Conheça {{itemCatalogo}}." required /></Campo><Mensagem mensagem={mensagem} /><Button type="submit" disabled={pendente}>{pendente ? "Publicando..." : "Criar e publicar"}</Button></form><ListaVaziaOuItens vazio="Nenhum modelo publicado." itens={modelos.map((item) => <li key={item.versaoId}><span>{item.nome}</span><Badge variant="secondary" className="ml-2">v{item.numeroVersao}</Badge></li>)} /></CardContent></Card>;
}

function concluir(resultado: ResultadoConfiguracao, formulario: HTMLFormElement | null, definirMensagem: (mensagem: string | null) => void) { if (resultado.sucesso) { formulario?.reset(); definirMensagem(null); } else definirMensagem(resultado.mensagem); }
function Campo({ id, rotulo, children }: { id: string; rotulo: string; children: React.ReactNode }) { return <div className="space-y-2"><Label htmlFor={id}>{rotulo}</Label>{children}</div>; }
function Mensagem({ mensagem }: { mensagem: string | null }) { return mensagem ? <Alert variant="destructive"><AlertDescription>{mensagem}</AlertDescription></Alert> : null; }
function ListaVaziaOuItens({ vazio, itens }: { vazio: string; itens: React.ReactNode[] }) { return itens.length ? <ul className="space-y-2 border-t pt-4 text-sm">{itens}</ul> : <p className="border-t pt-4 text-sm text-muted-foreground">{vazio}</p>; }
