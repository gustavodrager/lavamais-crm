"use client";

import { useActionState, useMemo, useRef, useState, type FormEvent } from "react";
import { Info, Plus, Trash2, UserRoundCheck } from "lucide-react";
import Link from "next/link";
import type { OfertaDoCatalogoDeLavanderia } from "@/contratos/apresentacao";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { registrarMovimentacao, type EstadoRegistroMovimentacao } from "./acoes";

const estadoInicial: EstadoRegistroMovimentacao = {};
type LinhaDoFormulario = { chave: string; ofertaDeServicoId: string; quantidade: number; precoUnitario: string };
const novaLinha = (chave = crypto.randomUUID()): LinhaDoFormulario => ({ chave, ofertaDeServicoId: "", quantidade: 1, precoUnitario: "" });

export function FormularioMovimentacao({ clienteId, nomeCliente, ofertas, agoraLocal, busca = "" }: { clienteId: string; nomeCliente: string; ofertas: OfertaDoCatalogoDeLavanderia[]; agoraLocal: string; busca?: string }) {
  const [estado, acao, pendente] = useActionState(registrarMovimentacao, estadoInicial);
  const [linhas, setLinhas] = useState<LinhaDoFormulario[]>(() => [novaLinha("linha-inicial")]);
  const [dataMovimentacao, setDataMovimentacao] = useState(agoraLocal);
  const [codigoExterno, setCodigoExterno] = useState("");
  const [observacao, setObservacao] = useState("");
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);
  const formularioRef = useRef<HTMLFormElement>(null);
  const confirmouEnvio = useRef(false);
  const ofertasPorId = useMemo(() => new Map(ofertas.map((oferta) => [oferta.id, oferta])), [ofertas]);
  const linhasSerializadas = JSON.stringify(linhas.map((linha) => ({ ofertaDeServicoId: linha.ofertaDeServicoId, quantidade: linha.quantidade, precoUnitario: linha.precoUnitario || null })));
  const ofertasSelecionadas = new Set(linhas.map((linha) => linha.ofertaDeServicoId).filter(Boolean));
  const total = linhas.reduce((soma, linha) => soma + calcularSubtotal(linha, ofertasPorId), 0);
  const linhasValidas = linhas.every((linha) => {
    const preco = linha.precoUnitario.trim() ? Number(linha.precoUnitario.replace(",", ".")) : null;
    return Boolean(linha.ofertaDeServicoId) && Number.isInteger(linha.quantidade) && linha.quantidade > 0 && (preco === null || (Number.isFinite(preco) && preco >= 0));
  }) && ofertasSelecionadas.size === linhas.length;

  function atualizarLinha(chave: string, alteracao: Partial<LinhaDoFormulario>) {
    setLinhas((atuais) => atuais.map((linha) => linha.chave === chave ? { ...linha, ...alteracao } : linha));
  }

  function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    if (confirmouEnvio.current) {
      confirmouEnvio.current = false;
      return;
    }
    evento.preventDefault();
    setConfirmacaoAberta(true);
  }

  function confirmarEnvio() {
    confirmouEnvio.current = true;
    setConfirmacaoAberta(false);
    window.setTimeout(() => formularioRef.current?.requestSubmit(), 0);
  }

  return <>
  <form ref={formularioRef} action={acao} onSubmit={aoEnviar} className="space-y-4 border-t pt-5">
    {estado.mensagem ? <Alert variant="destructive"><AlertTitle>Registro não concluído</AlertTitle><AlertDescription>{estado.mensagem}{estado.requerLogin ? <Button asChild variant="outline" className="mt-3"><Link href="/entrar?retorno=/movimentacoes">Entrar novamente</Link></Button> : null}</AlertDescription></Alert> : null}
    <input type="hidden" name="clienteId" value={clienteId} />
    <input type="hidden" name="linhas" value={linhasSerializadas} />
    <input type="hidden" name="busca" value={busca} />
    <div className="rounded-lg bg-primary/5 p-3"><div className="flex items-center gap-2"><UserRoundCheck className="size-4 text-primary" /><Link href={`/clientes/${clienteId}`} className="font-medium text-primary underline-offset-4 hover:underline" aria-label={`Abrir detalhes das movimentações de ${nomeCliente}`}>{nomeCliente}</Link></div><Link href="/movimentacoes" className="mt-1 block text-xs text-primary">Trocar cliente</Link></div>
    <Alert><Info aria-hidden="true" /><AlertTitle>Registro comercial</AlertTitle><AlertDescription>Este registro representa uma visita comercial. Ele não representa pagamento, produção, estoque ou logística.</AlertDescription></Alert>
    <fieldset className="space-y-3">
      <div className="flex items-center justify-between gap-3"><legend className="text-sm font-medium">Artigos e serviços</legend><Button type="button" size="sm" variant="outline" disabled={!ofertas.length || linhas.length >= ofertas.length} onClick={() => setLinhas((atuais) => [...atuais, novaLinha()])}><Plus className="size-4" />Adicionar linha</Button></div>
      {ofertas.length === 0 ? <Alert><AlertTitle>Catálogo vazio</AlertTitle><AlertDescription>Peça a um administrador para executar a carga inicial do catálogo.</AlertDescription></Alert> : null}
      {linhas.map((linha, indice) => <div key={linha.chave} className="space-y-3 rounded-lg border p-3">
        <div className="flex items-center justify-between"><span className="text-sm font-medium">Linha {indice + 1}</span>{linhas.length > 1 ? <Button type="button" size="icon" variant="ghost" aria-label={`Remover linha ${indice + 1}`} onClick={() => setLinhas((atuais) => atuais.filter((item) => item.chave !== linha.chave))}><Trash2 className="size-4" /></Button> : null}</div>
        <div className="space-y-2"><Label htmlFor={`oferta-${linha.chave}`}>Artigo e serviço</Label><select id={`oferta-${linha.chave}`} required value={linha.ofertaDeServicoId} onChange={(evento) => atualizarLinha(linha.chave, { ofertaDeServicoId: evento.target.value, precoUnitario: "" })} className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="">Selecione uma oferta</option>{ofertas.map((oferta) => <option key={oferta.id} value={oferta.id} disabled={ofertasSelecionadas.has(oferta.id) && oferta.id !== linha.ofertaDeServicoId}>{oferta.nomeArtigo} · {oferta.nomeServico} · {oferta.categoria} · {moeda.format(oferta.precoUnitario)}</option>)}</select></div>
        {ofertasPorId.get(linha.ofertaDeServicoId) ? <div className="grid gap-2 rounded-md bg-secondary/50 p-3 text-sm sm:grid-cols-2" aria-label={`Detalhes da oferta da linha ${indice + 1}`}><div><span className="text-muted-foreground">Artigo</span><p className="font-medium">{ofertasPorId.get(linha.ofertaDeServicoId)!.nomeArtigo}</p></div><div><span className="text-muted-foreground">Serviço</span><p className="font-medium">{ofertasPorId.get(linha.ofertaDeServicoId)!.nomeServico}</p></div><div><span className="text-muted-foreground">Categoria</span><p className="font-medium">{ofertasPorId.get(linha.ofertaDeServicoId)!.categoria}</p></div><div><span className="text-muted-foreground">Preço de tabela</span><p className="font-medium tabular-nums">{moeda.format(ofertasPorId.get(linha.ofertaDeServicoId)!.precoUnitario)}</p></div></div> : <p className="text-sm text-muted-foreground">Selecione uma oferta para consultar artigo, serviço, categoria e preço de tabela.</p>}
        <div className="grid gap-3 sm:grid-cols-3"><div className="space-y-2"><Label htmlFor={`quantidade-${linha.chave}`}>Quantidade</Label><Input id={`quantidade-${linha.chave}`} type="number" min={1} step={1} required value={linha.quantidade} onChange={(evento) => atualizarLinha(linha.chave, { quantidade: Number(evento.target.value) })} /></div><div className="space-y-2 sm:col-span-2"><Label htmlFor={`preco-${linha.chave}`}>Preço unitário praticado <span className="font-normal text-muted-foreground">(opcional)</span></Label><Input id={`preco-${linha.chave}`} inputMode="decimal" placeholder="Usa o preço de tabela" value={linha.precoUnitario} onChange={(evento) => atualizarLinha(linha.chave, { precoUnitario: evento.target.value })} /><p className="text-xs text-muted-foreground">Deixe em branco para usar a tabela. A CRM API valida se o preço praticado pode ser informado.</p></div></div>
        <div className="flex items-center justify-between border-t pt-3 text-sm"><span className="text-muted-foreground">Subtotal da linha</span><strong className="tabular-nums">{moeda.format(calcularSubtotal(linha, ofertasPorId))}</strong></div>
      </div>)}
    </fieldset>
    <div className="rounded-lg bg-secondary/50 p-3 text-right" aria-live="polite"><span className="text-sm text-muted-foreground">Total estimado</span><p className="text-xl font-semibold tabular-nums">{moeda.format(total)}</p><p className="mt-1 text-xs text-muted-foreground">Valor calculado para conferência. O total definitivo será calculado pela CRM API.</p></div>
    <div className="space-y-2"><Label htmlFor="data">Data e hora da visita</Label><Input id="data" name="dataMovimentacao" type="datetime-local" value={dataMovimentacao} onChange={(evento) => setDataMovimentacao(evento.target.value)} /></div>
    <div className="space-y-2"><Label htmlFor="codigo">Código externo / Essence <span className="font-normal text-muted-foreground">(opcional)</span></Label><Input id="codigo" name="codigoExterno" value={codigoExterno} onChange={(evento) => setCodigoExterno(evento.target.value)} /></div>
    <div className="space-y-2"><Label htmlFor="observacao">Observação <span className="font-normal text-muted-foreground">(opcional)</span></Label><Textarea id="observacao" name="observacao" maxLength={500} value={observacao} onChange={(evento) => setObservacao(evento.target.value)} /></div>
    <Button type="submit" className="w-full" disabled={pendente || ofertas.length === 0 || !linhasValidas}>{pendente ? "Registrando..." : "Registrar movimentação"}</Button>
  </form>
  <AlertDialog open={confirmacaoAberta} onOpenChange={setConfirmacaoAberta}>
    <AlertDialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
      <AlertDialogHeader><AlertDialogTitle>Confirme o registro comercial</AlertDialogTitle><AlertDialogDescription>Revise os dados antes de registrar. O envio não representa pagamento ou início de produção.</AlertDialogDescription></AlertDialogHeader>
      <dl className="grid gap-3 rounded-lg bg-secondary/50 p-3 text-sm sm:grid-cols-2"><div><dt className="text-muted-foreground">Cliente</dt><dd className="font-medium">{nomeCliente}</dd></div><div><dt className="text-muted-foreground">Data</dt><dd className="font-medium">{formatarDataResumo(dataMovimentacao)}</dd></div><div className="sm:col-span-2"><dt className="text-muted-foreground">Código externo</dt><dd className="font-medium">{codigoExterno.trim() || "Não informado"}</dd></div><div className="sm:col-span-2"><dt className="text-muted-foreground">Observação</dt><dd className="whitespace-pre-wrap font-medium">{observacao.trim() || "Não informada"}</dd></div></dl>
      <div className="space-y-2" aria-label="Resumo das linhas"><h3 className="text-sm font-medium">Linhas</h3>{linhas.map((linha, indice) => { const oferta = ofertasPorId.get(linha.ofertaDeServicoId); const preco = obterPrecoPraticado(linha, oferta?.precoUnitario ?? 0); return <div key={linha.chave} className="flex items-start justify-between gap-3 border-b py-2 text-sm last:border-b-0"><div><p className="font-medium">{linha.quantidade} × {oferta?.nomeArtigo ?? "Oferta não selecionada"}</p><p className="text-xs text-muted-foreground">{oferta?.nomeServico ?? ""} · {oferta?.categoria ?? ""} · {moeda.format(preco)} por unidade</p></div><strong className="shrink-0 tabular-nums">{moeda.format(preco * linha.quantidade)}</strong><span className="sr-only">Linha {indice + 1}</span></div>; })}</div>
      <div className="flex items-center justify-between border-t pt-3"><span className="font-medium">Valor total estimado</span><strong className="text-lg tabular-nums">{moeda.format(total)}</strong></div>
      <AlertDialogFooter><AlertDialogCancel>Voltar e revisar</AlertDialogCancel><AlertDialogAction onClick={confirmarEnvio} disabled={pendente}>Confirmar e registrar</AlertDialogAction></AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
  </>;
}

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function obterPrecoPraticado(linha: LinhaDoFormulario, precoTabela: number) {
  const precoInformado = Number(linha.precoUnitario.replace(",", "."));
  return linha.precoUnitario.trim() && Number.isFinite(precoInformado) ? precoInformado : precoTabela;
}

function calcularSubtotal(linha: LinhaDoFormulario, ofertasPorId: Map<string, OfertaDoCatalogoDeLavanderia>) {
  const oferta = ofertasPorId.get(linha.ofertaDeServicoId);
  const quantidade = Number.isInteger(linha.quantidade) && linha.quantidade > 0 ? linha.quantidade : 0;
  return obterPrecoPraticado(linha, oferta?.precoUnitario ?? 0) * quantidade;
}

function formatarDataResumo(valor: string) {
  if (!valor) return "Agora, pela CRM API";
  const data = new Date(`${valor}:00-03:00`);
  return Number.isNaN(data.getTime()) ? valor : new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" }).format(data);
}
