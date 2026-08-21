"use client";

import { useState, useTransition } from "react";
import { FileSpreadsheet, Upload } from "lucide-react";
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
    <Card><CardContent className="p-6"><form action={preVisualizar} className="space-y-5"><div className="flex items-start gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><FileSpreadsheet className="size-5" aria-hidden="true" /></span><div><h2 className="font-semibold">Arquivo de clientes</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Use CSV UTF-8 com as colunas: nome, whatsapp, email, bairro, cidade, tipo, codigoExterno e dataCadastroOrigem. O DDD 13 e a permissão de WhatsApp serão aplicados como padrão.</p></div></div><div className="space-y-2"><Label htmlFor="arquivo">Selecionar CSV</Label><Input id="arquivo" name="arquivo" type="file" accept=".csv,text/csv" required /></div><Button type="submit" disabled={pendente}><Upload aria-hidden="true" />{pendente ? "Analisando..." : "Pré-visualizar arquivo"}</Button></form></CardContent></Card>
    {mensagem && <Alert variant="destructive"><AlertTitle>Importação não concluída</AlertTitle><AlertDescription>{mensagem}</AlertDescription></Alert>}
    {preVisualizacao && <Card><CardContent className="space-y-5 p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">Pré-visualização</h2><p className="mt-1 text-sm text-muted-foreground">{preVisualizacao.totalLinhas} linhas encontradas. Revise a amostra antes de gravar.</p></div><Button type="button" disabled={pendente} onClick={confirmar}>{pendente ? "Importando..." : "Confirmar importação"}</Button></div><div className="overflow-x-auto rounded-md border"><Table><TableHeader><TableRow><TableHead>Linha</TableHead>{preVisualizacao.colunas.map((coluna) => <TableHead key={coluna}>{coluna}</TableHead>)}<TableHead>Validação</TableHead></TableRow></TableHeader><TableBody>{preVisualizacao.amostra.map((linha) => <TableRow key={linha.numero}><TableCell>{linha.numero}</TableCell>{preVisualizacao.colunas.map((coluna, indice) => <TableCell key={`${linha.numero}-${coluna}`}>{linha.valores[indice] ?? ""}</TableCell>)}<TableCell>{linha.erros.length ? <Badge variant="outline">{linha.erros.join("; ")}</Badge> : <Badge>Válida</Badge>}</TableCell></TableRow>)}</TableBody></Table></div></CardContent></Card>}
    {resultado && <Alert><AlertTitle>Importação concluída</AlertTitle><AlertDescription>{resultado.totalInseridas} clientes inseridos, {resultado.totalAtualizadas} atualizados e {resultado.totalRejeitadas} rejeitados entre {resultado.totalLinhas} linhas processadas.</AlertDescription></Alert>}
  </div>;
}
