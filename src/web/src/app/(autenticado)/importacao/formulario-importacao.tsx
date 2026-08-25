"use client";

import { useState, useTransition } from "react";
import { Download, FileSpreadsheet, Upload } from "lucide-react";
import type { PreVisualizacaoImportacao, ResultadoImportacao } from "@/contratos/apresentacao";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { confirmarClientes, preVisualizarClientes } from "./acoes";

export function FormularioImportacao() {
  const [preVisualizacao, setPreVisualizacao] = useState<PreVisualizacaoImportacao | null>(null);
  const [resultado, setResultado] = useState<ResultadoImportacao | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [pendente, iniciarTransicao] = useTransition();
  function preVisualizar(dados: FormData) { setMensagem(null); setResultado(null); iniciarTransicao(async () => { const resposta = await preVisualizarClientes(dados); if (resposta.sucesso) setPreVisualizacao(resposta.preVisualizacao); else setMensagem(resposta.mensagem); }); }
  function confirmar() { if (!preVisualizacao) return; setMensagem(null); iniciarTransicao(async () => { const resposta = await confirmarClientes(preVisualizacao.referenciaArquivo); if (resposta.sucesso) { setResultado(resposta.resultado); setPreVisualizacao(null); } else setMensagem(resposta.mensagem); }); }
  return <div className="space-y-6">
    <ol className="grid gap-2 sm:grid-cols-3" aria-label="Etapas da importação"><Etapa numero="1" texto="Escolher arquivo" ativa={!preVisualizacao && !resultado} /><Etapa numero="2" texto="Conferir clientes" ativa={Boolean(preVisualizacao)} /><Etapa numero="3" texto="Ver resultado" ativa={Boolean(resultado)} /></ol>
    <Card><CardContent className="p-6"><form action={preVisualizar} className="space-y-5"><div className="flex items-start gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><FileSpreadsheet className="size-5" aria-hidden="true" /></span><div><h2 className="font-semibold">Arquivo de clientes</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Use nossa planilha modelo. O sistema confere os dados antes de cadastrar ou atualizar qualquer cliente.</p><Button asChild variant="link" className="mt-2 h-auto p-0"><a href="/modelo-importacao-clientes.csv" download><Download />Baixar planilha modelo</a></Button></div></div><Alert><AlertTitle>Permissão de WhatsApp</AlertTitle><AlertDescription>Clientes sem autorização explícita serão cadastrados como “Sem permissão” e não receberão mensagens comerciais.</AlertDescription></Alert><div className="space-y-2"><Label htmlFor="arquivo">Selecionar arquivo CSV</Label><Input id="arquivo" name="arquivo" type="file" accept=".csv,text/csv" required /></div><Button type="submit" disabled={pendente}><Upload aria-hidden="true" />{pendente ? "Conferindo arquivo..." : "Conferir clientes"}</Button></form></CardContent></Card>
    {mensagem && <Alert variant="destructive"><AlertTitle>Importação não concluída</AlertTitle><AlertDescription>{mensagem}</AlertDescription></Alert>}
    {preVisualizacao && <Card><CardContent className="space-y-5 p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">Pré-visualização</h2><p className="mt-1 text-sm text-muted-foreground">{preVisualizacao.totalLinhas} linhas encontradas. Revise a amostra antes de gravar.</p></div><Button type="button" disabled={pendente} onClick={confirmar}>{pendente ? "Importando..." : "Confirmar importação"}</Button></div><div className="overflow-x-auto rounded-md border"><Table><TableHeader><TableRow><TableHead>Linha</TableHead>{preVisualizacao.colunas.map((coluna) => <TableHead key={coluna}>{coluna}</TableHead>)}<TableHead>Validação</TableHead></TableRow></TableHeader><TableBody>{preVisualizacao.amostra.map((linha) => <TableRow key={linha.numero}><TableCell>{linha.numero}</TableCell>{preVisualizacao.colunas.map((coluna, indice) => <TableCell key={`${linha.numero}-${coluna}`}>{linha.valores[indice] ?? ""}</TableCell>)}<TableCell>{linha.erros.length ? <Badge variant="outline">{linha.erros.join("; ")}</Badge> : <Badge>Válida</Badge>}</TableCell></TableRow>)}</TableBody></Table></div></CardContent></Card>}
    {resultado && <Alert><AlertTitle>Importação concluída</AlertTitle><AlertDescription><p>{resultado.totalInseridas} clientes inseridos, {resultado.totalAtualizadas} atualizados e {resultado.totalRejeitadas} rejeitados entre {resultado.totalLinhas} linhas processadas.</p>{resultado.totalRejeitadas > 0 && <div className="mt-3"><p className="font-medium">Linhas que precisam de correção:</p><ul className="mt-1 list-disc space-y-1 pl-5">{resultado.linhas.filter((linha) => linha.erro).map((linha) => <li key={linha.numero}>Linha {linha.numero}: {linha.erro}</li>)}</ul></div>}</AlertDescription></Alert>}
  </div>;
}

function Etapa({ numero, texto, ativa }: { numero: string; texto: string; ativa: boolean }) {
  return <li className={`flex items-center gap-3 rounded-xl border p-3 text-sm ${ativa ? "border-primary bg-primary/5 font-medium text-[var(--marca-azul-profundo)]" : "bg-card text-muted-foreground"}`}><span className="grid size-7 place-items-center rounded-full border bg-card text-xs font-bold">{numero}</span>{texto}</li>;
}
