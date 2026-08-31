"use client";

import Link from "next/link";
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
  const exigeEndereco = retorno?.startsWith("/roteiros") ?? false;
  const { register, handleSubmit, setError, setValue, control, formState: { errors, isSubmitting } } = useForm<EntradaCriarCliente>({ defaultValues: { nome: "", whatsapp: "", nomeFantasia: "", tipo: "", email: "", dataNascimento: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "SP", cep: "", codigoExterno: "", permiteMarketingWhatsapp: false, retorno } });
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
    <label className="flex min-h-11 items-start gap-3 rounded-lg bg-secondary/45 p-3 text-sm sm:col-span-2"><input type="checkbox" className="mt-0.5 size-5 accent-primary" {...register("permiteMarketingWhatsapp")} /><span>Cliente autoriza receber mensagens comerciais pelo WhatsApp.</span></label>
    <div className="border-t pt-5 sm:col-span-2"><h3 className="font-medium">Endereço</h3><p className="mt-1 text-sm text-muted-foreground">{exigeEndereco ? "Logradouro, número e cidade são necessários para continuar no roteiro." : "Preencha agora para usar o cliente em coletas e entregas."}</p></div>
    <Campo id="logradouro" rotulo={`Logradouro${exigeEndereco ? " *" : ""}`} erro={errors.logradouro?.message}><Input id="logradouro" placeholder="Rua, avenida..." {...register("logradouro")} /></Campo>
    <Campo id="numero" rotulo={`Número${exigeEndereco ? " *" : ""}`} erro={errors.numero?.message}><Input id="numero" {...register("numero")} /></Campo>
    <Campo id="cidade" rotulo="Cidade" erro={errors.cidade?.message}><Select value={cidade} onValueChange={(valor) => { setValue("cidade", valor); setValue("bairro", ""); }}><SelectTrigger id="cidade"><SelectValue placeholder="Selecione a cidade" /></SelectTrigger><SelectContent>{cidadesAtendidas.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></Campo>
    <Campo id="bairro" rotulo="Bairro" erro={errors.bairro?.message}><Select value={bairro} onValueChange={(valor) => setValue("bairro", valor)} disabled={!cidade}><SelectTrigger id="bairro"><SelectValue placeholder={cidade ? "Selecione o bairro" : "Selecione primeiro a cidade"} /></SelectTrigger><SelectContent>{cidade && bairrosAtendidosPorCidade[cidade].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></Campo>
    <Campo id="complemento" rotulo="Complemento" erro={errors.complemento?.message}><Input id="complemento" {...register("complemento")} /></Campo>
    <div className="grid grid-cols-[1fr_5rem] gap-3"><Campo id="cep" rotulo="CEP" erro={errors.cep?.message}><Input id="cep" inputMode="numeric" placeholder="11700-000" {...register("cep")} /></Campo><Campo id="estado" rotulo="UF" erro={errors.estado?.message}><Input id="estado" maxLength={2} {...register("estado")} /></Campo></div>
    <details className="rounded-lg border p-4 sm:col-span-2"><summary className="cursor-pointer text-sm font-medium">Informações opcionais</summary><div className="mt-4 grid gap-4 sm:grid-cols-2"><Campo id="nomeFantasia" rotulo="Nome fantasia" erro={errors.nomeFantasia?.message}><Input id="nomeFantasia" {...register("nomeFantasia")} /></Campo><Campo id="tipo" rotulo="Tipo de cliente" erro={errors.tipo?.message}><Input id="tipo" placeholder="Ex.: Residencial" {...register("tipo")} /></Campo><Campo id="email" rotulo="E-mail" erro={errors.email?.message}><Input id="email" type="email" {...register("email")} /></Campo><Campo id="dataNascimento" rotulo="Data de nascimento" erro={errors.dataNascimento?.message}><Input id="dataNascimento" type="date" {...register("dataNascimento")} /></Campo><Campo id="codigoExterno" rotulo="Código externo" erro={errors.codigoExterno?.message}><Input id="codigoExterno" {...register("codigoExterno")} /></Campo></div></details>
    <div className="flex flex-col-reverse gap-2 border-t pt-5 sm:col-span-2 sm:flex-row sm:justify-end"><Button asChild type="button" variant="ghost"><Link href={retorno ?? "/clientes"}>Cancelar</Link></Button><Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>{isSubmitting ? "Cadastrando..." : "Cadastrar cliente"}</Button></div>
  </form>;
}

function Campo({ id, rotulo, erro, children }: { id: string; rotulo: string; erro?: string; children: ReactNode }) {
  return <div className="space-y-2"><Label htmlFor={id}>{rotulo}</Label>{children}{erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}</div>;
}
