"use client";

import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { criarCliente, type EntradaCriarCliente } from "./acoes";

export function FormularioCliente() {
  const [mensagem, setMensagem] = useState<string | null>(null);
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<EntradaCriarCliente>({ defaultValues: { nome: "", whatsapp: "", tipo: "", bairro: "", cidade: "", codigoExterno: "", permiteMarketingWhatsapp: true } });
  async function enviar(dados: EntradaCriarCliente) {
    setMensagem(null); const resultado = await criarCliente(dados); setMensagem(resultado.mensagem);
    if (resultado.campos) for (const [campo, mensagemDoCampo] of Object.entries(resultado.campos)) if (mensagemDoCampo) setError(campo as keyof EntradaCriarCliente, { message: mensagemDoCampo });
  }
  return <form onSubmit={handleSubmit(enviar)} className="grid gap-5 sm:grid-cols-2">
    {mensagem && <Alert variant="destructive" className="sm:col-span-2"><AlertTitle>Não foi possível cadastrar</AlertTitle><AlertDescription>{mensagem}</AlertDescription></Alert>}
    <Campo id="nome" rotulo="Nome" erro={errors.nome?.message}><Input id="nome" autoFocus {...register("nome")} /></Campo>
    <Campo id="whatsapp" rotulo="WhatsApp" erro={errors.whatsapp?.message}><Input id="whatsapp" inputMode="tel" placeholder="(13) 99999-9999" {...register("whatsapp")} /></Campo>
    <Campo id="tipo" rotulo="Tipo de cliente" erro={errors.tipo?.message}><Input id="tipo" placeholder="Ex.: Pessoa física" {...register("tipo")} /></Campo>
    <Campo id="codigoExterno" rotulo="Código externo" erro={errors.codigoExterno?.message}><Input id="codigoExterno" {...register("codigoExterno")} /></Campo>
    <Campo id="bairro" rotulo="Bairro" erro={errors.bairro?.message}><Input id="bairro" {...register("bairro")} /></Campo>
    <Campo id="cidade" rotulo="Cidade" erro={errors.cidade?.message}><Input id="cidade" {...register("cidade")} /></Campo>
    <label className="flex items-start gap-3 text-sm sm:col-span-2"><input type="checkbox" className="mt-0.5 size-4 accent-primary" {...register("permiteMarketingWhatsapp")} /><span>Cliente permite o recebimento de mensagens comerciais pelo WhatsApp.</span></label>
    <div className="flex justify-end border-t pt-5 sm:col-span-2"><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Cadastrando..." : "Cadastrar cliente"}</Button></div>
  </form>;
}

function Campo({ id, rotulo, erro, children }: { id: string; rotulo: string; erro?: string; children: ReactNode }) {
  return <div className="space-y-2"><Label htmlFor={id}>{rotulo}</Label>{children}{erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}</div>;
}
