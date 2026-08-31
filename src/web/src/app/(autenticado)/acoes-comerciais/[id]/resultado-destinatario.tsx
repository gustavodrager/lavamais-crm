"use client";

import { useState, useTransition } from "react";
import type { DestinatarioDaAcao } from "@/contratos/apresentacao";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { registrarResultado } from "./acoes";

const opcoes = [{ valor: "SemRetorno", rotulo: "Sem retorno" }, { valor: "Respondeu", rotulo: "Respondeu" }, { valor: "Interessado", rotulo: "Interessado" }, { valor: "Convertido", rotulo: "Convertido" }, { valor: "NaoTemInteresse", rotulo: "Sem interesse" }] as const;

export function ResultadoDestinatario({ acaoId, destinatario, aoSalvar }: { acaoId: string; destinatario: DestinatarioDaAcao; aoSalvar?: (destinatarioId: string) => void }) {
  const [resultado, setResultado] = useState(destinatario.resultadoComercial === "NaoInformado" ? "" : destinatario.resultadoComercial);
  const [valor, setValor] = useState(destinatario.valorConvertido?.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "");
  const [mensagem, setMensagem] = useState<string | null>(null); const [sucesso, setSucesso] = useState(false); const [pendente, iniciarTransicao] = useTransition();
  function salvar() { setMensagem(null); setSucesso(false); iniciarTransicao(async () => { const resposta = await registrarResultado({ acaoId, destinatarioId: destinatario.id, resultado, valorConvertido: valor, versao: destinatario.versao }); if (resposta.sucesso) { setSucesso(true); aoSalvar?.(destinatario.id); } else setMensagem(resposta.mensagem); }); }
  return <div className="min-w-64 space-y-2"><Label className="sr-only" htmlFor={`resultado-${destinatario.id}`}>Resultado de {destinatario.nomeCliente}</Label><Select value={resultado} onValueChange={(valorSelecionado) => { setResultado(valorSelecionado as typeof resultado); if (valorSelecionado !== "Convertido") setValor(""); }}><SelectTrigger id={`resultado-${destinatario.id}`} className="w-full"><SelectValue placeholder="Selecione o resultado" /></SelectTrigger><SelectContent>{opcoes.map((opcao) => <SelectItem key={opcao.valor} value={opcao.valor}>{opcao.rotulo}</SelectItem>)}</SelectContent></Select>
    {resultado === "Convertido" && <><Label className="sr-only" htmlFor={`valor-${destinatario.id}`}>Valor convertido de {destinatario.nomeCliente}</Label><Input id={`valor-${destinatario.id}`} inputMode="decimal" value={valor} onChange={(evento) => setValor(evento.target.value)} placeholder="Valor convertido (opcional)" /></>}
    <Button size="sm" variant="outline" type="button" onClick={salvar} disabled={pendente || !resultado}>{pendente ? "Salvando..." : "Salvar resultado"}</Button>
    {mensagem && <p role="alert" className="text-xs text-destructive">{mensagem}</p>}{sucesso && <p role="status" className="text-xs text-emerald-700">Resultado salvo.</p>}
  </div>;
}
