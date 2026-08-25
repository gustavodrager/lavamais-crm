"use client";

import { useState, useTransition } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { OpcaoItemDeCatalogo } from "@/contratos/apresentacao";
import { atualizarInformacoesAcao } from "./acoes";

export function EditarInformacoesAcao({ acaoId, nomeInicial, objetivoInicial, itemInicial, itens }: { acaoId: string; nomeInicial: string; objetivoInicial: string | null; itemInicial: string | null; itens: OpcaoItemDeCatalogo[] }) {
  const [nome, setNome] = useState(nomeInicial); const [objetivo, setObjetivo] = useState(objetivoInicial ?? ""); const [item, setItem] = useState(itemInicial ?? ""); const [mensagem, setMensagem] = useState<string | null>(null); const [salvo, setSalvo] = useState(false); const [pendente, iniciarTransicao] = useTransition();
  function salvar() { setMensagem(null); setSalvo(false); iniciarTransicao(async () => { const resposta = await atualizarInformacoesAcao({ acaoId, nome, objetivo, itemDeCatalogoId: item || null }); if (resposta.sucesso) setSalvo(true); else setMensagem(resposta.mensagem); }); }
  return <details className="mt-6 rounded-xl border p-4"><summary className="cursor-pointer font-semibold">Corrigir informações iniciais</summary><div className="mt-4 space-y-4"><p className="text-sm text-muted-foreground">Enquanto estiver em rascunho, você pode corrigir nome, objetivo e item sem refazer a lista de clientes.</p><div className="space-y-2"><label htmlFor={`nome-acao-${acaoId}`} className="text-sm font-medium">Nome da ação</label><Input id={`nome-acao-${acaoId}`} value={nome} onChange={(e) => setNome(e.target.value)} maxLength={160} /></div><div className="space-y-2"><label htmlFor={`objetivo-acao-${acaoId}`} className="text-sm font-medium">Objetivo</label><Textarea id={`objetivo-acao-${acaoId}`} value={objetivo} onChange={(e) => setObjetivo(e.target.value)} maxLength={500} /></div><div className="space-y-2"><label htmlFor={`item-acao-${acaoId}`} className="text-sm font-medium">Item do catálogo</label><select id={`item-acao-${acaoId}`} value={item} onChange={(e) => setItem(e.target.value)} className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="">Sem item</option>{itens.map((opcao) => <option key={opcao.id} value={opcao.id}>{opcao.nome}{opcao.categoria ? ` · ${opcao.categoria}` : ""}</option>)}</select></div><Button type="button" onClick={salvar} disabled={pendente}>{pendente ? "Salvando..." : "Salvar correção"}</Button>{mensagem && <Alert variant="destructive"><AlertTitle>Não foi possível salvar</AlertTitle><AlertDescription>{mensagem}</AlertDescription></Alert>}{salvo && <p role="status" className="text-sm text-emerald-700">Informações atualizadas.</p>}</div></details>;
}
