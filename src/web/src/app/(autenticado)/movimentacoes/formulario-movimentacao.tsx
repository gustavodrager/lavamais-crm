"use client";

import { useActionState, useMemo, useState } from "react";
import { Plus, Trash2, UserRoundCheck } from "lucide-react";
import Link from "next/link";
import type { OfertaDoCatalogoDeLavanderia } from "@/contratos/apresentacao";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { registrarMovimentacao, type EstadoRegistroMovimentacao } from "./acoes";

const estadoInicial: EstadoRegistroMovimentacao = {};
type LinhaDoFormulario = { chave: string; ofertaDeServicoId: string; quantidade: number; precoUnitario: string };
const novaLinha = (chave = crypto.randomUUID()): LinhaDoFormulario => ({ chave, ofertaDeServicoId: "", quantidade: 1, precoUnitario: "" });

export function FormularioMovimentacao({ clienteId, nomeCliente, ofertas, agoraLocal }: { clienteId: string; nomeCliente: string; ofertas: OfertaDoCatalogoDeLavanderia[]; agoraLocal: string }) {
  const [estado, acao, pendente] = useActionState(registrarMovimentacao, estadoInicial);
  const [linhas, setLinhas] = useState<LinhaDoFormulario[]>(() => [novaLinha("linha-inicial")]);
  const ofertasPorId = useMemo(() => new Map(ofertas.map((oferta) => [oferta.id, oferta])), [ofertas]);
  const linhasSerializadas = JSON.stringify(linhas.map((linha) => ({ ofertaDeServicoId: linha.ofertaDeServicoId, quantidade: linha.quantidade, precoUnitario: linha.precoUnitario || null })));
  const total = linhas.reduce((soma, linha) => {
    const oferta = ofertasPorId.get(linha.ofertaDeServicoId);
    const precoInformado = Number(linha.precoUnitario.replace(",", "."));
    const preco = linha.precoUnitario && Number.isFinite(precoInformado) ? precoInformado : oferta?.precoUnitario ?? 0;
    return soma + preco * linha.quantidade;
  }, 0);

  function atualizarLinha(chave: string, alteracao: Partial<LinhaDoFormulario>) {
    setLinhas((atuais) => atuais.map((linha) => linha.chave === chave ? { ...linha, ...alteracao } : linha));
  }

  return <form action={acao} className="space-y-4 border-t pt-5">
    {estado.mensagem ? <Alert variant="destructive"><AlertTitle>Registro não concluído</AlertTitle><AlertDescription>{estado.mensagem}{estado.requerLogin ? <Button asChild variant="outline" className="mt-3"><Link href="/entrar?retorno=/movimentacoes">Entrar novamente</Link></Button> : null}</AlertDescription></Alert> : null}
    <input type="hidden" name="clienteId" value={clienteId} />
    <input type="hidden" name="linhas" value={linhasSerializadas} />
    <div className="rounded-lg bg-primary/5 p-3"><div className="flex items-center gap-2"><UserRoundCheck className="size-4 text-primary" /><span className="font-medium">{nomeCliente}</span></div><Link href="/movimentacoes" className="mt-1 block text-xs text-primary">Trocar cliente</Link></div>
    <fieldset className="space-y-3">
      <div className="flex items-center justify-between"><legend className="text-sm font-medium">Artigos e serviços</legend><Button type="button" size="sm" variant="outline" onClick={() => setLinhas((atuais) => [...atuais, novaLinha()])}><Plus className="size-4" />Adicionar linha</Button></div>
      {ofertas.length === 0 ? <Alert><AlertTitle>Catálogo vazio</AlertTitle><AlertDescription>Peça a um administrador para executar a carga inicial do catálogo.</AlertDescription></Alert> : null}
      {linhas.map((linha, indice) => <div key={linha.chave} className="space-y-3 rounded-lg border p-3">
        <div className="flex items-center justify-between"><span className="text-sm font-medium">Linha {indice + 1}</span>{linhas.length > 1 ? <Button type="button" size="icon" variant="ghost" aria-label={`Remover linha ${indice + 1}`} onClick={() => setLinhas((atuais) => atuais.filter((item) => item.chave !== linha.chave))}><Trash2 className="size-4" /></Button> : null}</div>
        <div className="space-y-2"><Label htmlFor={`oferta-${linha.chave}`}>Artigo e serviço</Label><select id={`oferta-${linha.chave}`} required value={linha.ofertaDeServicoId} onChange={(evento) => atualizarLinha(linha.chave, { ofertaDeServicoId: evento.target.value, precoUnitario: "" })} className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="">Selecione</option>{ofertas.map((oferta) => <option key={oferta.id} value={oferta.id}>{oferta.nomeArtigo} · {oferta.nomeServico} · {moeda.format(oferta.precoUnitario)}</option>)}</select></div>
        <div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label htmlFor={`quantidade-${linha.chave}`}>Quantidade</Label><Input id={`quantidade-${linha.chave}`} type="number" min={1} step={1} required value={linha.quantidade} onChange={(evento) => atualizarLinha(linha.chave, { quantidade: Number(evento.target.value) })} /></div><div className="space-y-2"><Label htmlFor={`preco-${linha.chave}`}>Preço unitário <span className="font-normal text-muted-foreground">(opcional)</span></Label><Input id={`preco-${linha.chave}`} inputMode="decimal" placeholder={ofertasPorId.get(linha.ofertaDeServicoId) ? moeda.format(ofertasPorId.get(linha.ofertaDeServicoId)!.precoUnitario) : "Tabela"} value={linha.precoUnitario} onChange={(evento) => atualizarLinha(linha.chave, { precoUnitario: evento.target.value })} /></div></div>
      </div>)}
    </fieldset>
    <div className="rounded-lg bg-secondary/50 p-3 text-right"><span className="text-sm text-muted-foreground">Total estimado</span><p className="text-xl font-semibold tabular-nums">{moeda.format(total)}</p></div>
    <div className="space-y-2"><Label htmlFor="data">Data e hora</Label><Input id="data" name="dataMovimentacao" type="datetime-local" defaultValue={agoraLocal} /></div>
    <div className="space-y-2"><Label htmlFor="codigo">Código do Essence <span className="font-normal text-muted-foreground">(opcional)</span></Label><Input id="codigo" name="codigoExterno" /></div>
    <div className="space-y-2"><Label htmlFor="observacao">Observação <span className="font-normal text-muted-foreground">(opcional)</span></Label><Textarea id="observacao" name="observacao" maxLength={500} /></div>
    <Button type="submit" className="w-full" disabled={pendente || ofertas.length === 0}>{pendente ? "Registrando..." : "Registrar movimentação"}</Button>
  </form>;
}

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
