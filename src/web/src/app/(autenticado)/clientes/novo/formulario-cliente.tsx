"use client";

import { useState, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { bairrosAtendidosPorCidade, cidadesAtendidas, type CidadeAtendida } from "@/conteudo/area-atendimento-lavamais";
import { criarCliente, type EntradaCriarCliente } from "./acoes";

export function FormularioCliente({ retorno }: { retorno?: string }) {
  const [mensagem, setMensagem] = useState<string | null>(null);
  const { register, handleSubmit, setError, setValue, control, formState: { errors, isSubmitting } } = useForm<EntradaCriarCliente>({ defaultValues: { nome: "", whatsapp: "", tipo: "", bairro: "", cidade: "", codigoExterno: "", permiteMarketingWhatsapp: false, retorno } });
  const cidade = useWatch({ control, name: "cidade" }) as CidadeAtendida | "";
  const bairro = useWatch({ control, name: "bairro" });
  async function enviar(dados: EntradaCriarCliente) {
    setMensagem(null); const resultado = await criarCliente({ ...dados, retorno }); setMensagem(resultado.mensagem);
    if (resultado.campos) for (const [campo, mensagemDoCampo] of Object.entries(resultado.campos)) if (mensagemDoCampo) setError(campo as keyof EntradaCriarCliente, { message: mensagemDoCampo });
  }
  return <form onSubmit={handleSubmit(enviar)} className="grid gap-5 sm:grid-cols-2">
    {mensagem && <Alert variant="destructive" className="sm:col-span-2"><AlertTitle>Não foi possível cadastrar</AlertTitle><AlertDescription>{mensagem}</AlertDescription></Alert>}
    <Campo id="nome" rotulo="Nome" erro={errors.nome?.message}><Input id="nome" autoFocus {...register("nome")} /></Campo>
    <Campo id="whatsapp" rotulo="WhatsApp" erro={errors.whatsapp?.message}><Input id="whatsapp" inputMode="tel" placeholder="(13) 99999-9999" {...register("whatsapp")} /></Campo>
    <Campo id="codigoExterno" rotulo="Código externo" erro={errors.codigoExterno?.message}><Input id="codigoExterno" {...register("codigoExterno")} /></Campo>
    <Campo id="cidade" rotulo="Cidade" erro={errors.cidade?.message}><Select value={cidade} onValueChange={(valor) => { setValue("cidade", valor); setValue("bairro", ""); }}><SelectTrigger id="cidade"><SelectValue placeholder="Selecione a cidade" /></SelectTrigger><SelectContent>{cidadesAtendidas.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></Campo>
    <Campo id="bairro" rotulo="Bairro" erro={errors.bairro?.message}><Select value={bairro} onValueChange={(valor) => setValue("bairro", valor)} disabled={!cidade}><SelectTrigger id="bairro"><SelectValue placeholder={cidade ? "Selecione o bairro" : "Selecione primeiro a cidade"} /></SelectTrigger><SelectContent>{cidade && bairrosAtendidosPorCidade[cidade].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></Campo>
    <details className="rounded-xl border p-4 sm:col-span-2"><summary className="cursor-pointer text-sm font-medium">Informações opcionais</summary><div className="mt-4"><Campo id="tipo" rotulo="Tipo de cliente" erro={errors.tipo?.message}><Input id="tipo" placeholder="Ex.: Pessoa física" {...register("tipo")} /></Campo></div></details>
    <label className="flex min-h-11 items-start gap-3 text-sm sm:col-span-2"><input type="checkbox" className="mt-0.5 size-5 accent-primary" {...register("permiteMarketingWhatsapp")} /><span>Cliente permite o recebimento de mensagens comerciais pelo WhatsApp.</span></label>
    <div className="flex justify-end border-t pt-5 sm:col-span-2"><Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>{isSubmitting ? "Cadastrando..." : "Cadastrar cliente"}</Button></div>
  </form>;
}

function Campo({ id, rotulo, erro, children }: { id: string; rotulo: string; erro?: string; children: ReactNode }) {
  return <div className="space-y-2"><Label htmlFor={id}>{rotulo}</Label>{children}{erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}</div>;
}
