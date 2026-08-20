"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import type { DestinatarioDaAcao, SituacaoAcaoComercial } from "@/contratos/apresentacao";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { iniciarAcao } from "./acoes";
import { ResultadoDestinatario } from "./resultado-destinatario";

const rotulosEnvio = { Pendente: "Pendente", Solicitado: "Solicitado", Enviado: "Enviado", Entregue: "Entregue", Lido: "Lido", Falhou: "Falhou" };

export function ExecucaoAcao({ acaoId, versao, situacao, destinatarios }: { acaoId: string; versao: number; situacao: SituacaoAcaoComercial; destinatarios: DestinatarioDaAcao[] }) {
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [pendente, iniciarTransicao] = useTransition();
  function iniciar() { setMensagem(null); iniciarTransicao(async () => { const resultado = await iniciarAcao({ acaoId, versao }); if (!resultado.sucesso) setMensagem(resultado.mensagem); }); }
  return <Card className="mt-6"><CardHeader><CardTitle>Execução e destinatários</CardTitle><CardDescription>Acompanhe o envio técnico e o resultado comercial de cada cliente.</CardDescription></CardHeader><CardContent className="space-y-5">
    {situacao === "Preparada" && <div className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">A audiência está pronta para execução</p><p className="text-sm text-muted-foreground">Ao iniciar, as solicitações serão processadas de forma idempotente pelo Worker.</p></div><Button type="button" onClick={iniciar} disabled={pendente}><Send />{pendente ? "Iniciando..." : "Iniciar processamento"}</Button></div>}
    {mensagem && <Alert variant="destructive"><AlertTitle>Não foi possível iniciar</AlertTitle><AlertDescription>{mensagem}</AlertDescription></Alert>}
    {destinatarios.length === 0 ? <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">A ação ainda não possui destinatários congelados.</p> : <div className="overflow-x-auto rounded-md border"><Table><TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead>Destino</TableHead><TableHead>Envio</TableHead><TableHead>Resultado</TableHead></TableRow></TableHeader><TableBody>{destinatarios.map((destinatario) => <TableRow key={destinatario.id}><TableCell className="font-medium">{destinatario.nomeCliente}</TableCell><TableCell>{destinatario.destino}</TableCell><TableCell><Badge variant={destinatario.situacaoEnvio === "Falhou" ? "destructive" : destinatario.situacaoEnvio === "Pendente" ? "secondary" : "outline"}>{rotulosEnvio[destinatario.situacaoEnvio]}</Badge>{destinatario.codigoFalha && <span className="mt-1 block max-w-56 text-xs text-destructive">Código: {destinatario.codigoFalha}</span>}</TableCell><TableCell>{situacao === "Preparada" ? "Disponível após iniciar" : <ResultadoDestinatario acaoId={acaoId} destinatario={destinatario} />}</TableCell></TableRow>)}</TableBody></Table></div>}
  </CardContent></Card>;
}
