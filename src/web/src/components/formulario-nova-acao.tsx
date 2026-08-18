"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const esquema = z.object({ nome: z.string().trim().min(3, "Informe um nome com pelo menos 3 caracteres."), objetivo: z.string().trim().min(10, "Descreva o objetivo em pelo menos 10 caracteres."), itemCatalogo: z.string().min(1, "Selecione um item do catálogo.") });
type DadosFormulario = z.infer<typeof esquema>;

export function FormularioNovaAcao() {
  const [salva, setSalva] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<DadosFormulario>({ resolver: zodResolver(esquema), defaultValues: { nome: "", objetivo: "", itemCatalogo: "" } });
  const enviar = async () => { await new Promise((resolve) => setTimeout(resolve, 300)); setSalva(true); };
  return <form onSubmit={handleSubmit(enviar)} className="space-y-6" noValidate>
    {salva ? <Alert><CheckCircle2 aria-hidden="true" /><AlertTitle>Rascunho validado</AlertTitle><AlertDescription>Na integração real, a próxima etapa será aberta depois que a API confirmar a gravação.</AlertDescription></Alert> : null}
    <div className="space-y-2"><Label htmlFor="nome">Nome da ação</Label><Input id="nome" placeholder="Ex.: Cuidados com edredons" aria-invalid={Boolean(errors.nome)} aria-describedby={errors.nome ? "erro-nome" : undefined} {...register("nome")} />{errors.nome && <p id="erro-nome" role="alert" className="text-sm text-destructive">{errors.nome.message}</p>}</div>
    <div className="space-y-2"><Label htmlFor="objetivo">Objetivo</Label><Textarea id="objetivo" placeholder="O que a equipe pretende alcançar?" aria-invalid={Boolean(errors.objetivo)} aria-describedby={errors.objetivo ? "erro-objetivo" : "ajuda-objetivo"} {...register("objetivo")} /><p id="ajuda-objetivo" className="text-xs text-muted-foreground">Este texto orienta a equipe e não será enviado ao cliente.</p>{errors.objetivo && <p id="erro-objetivo" role="alert" className="text-sm text-destructive">{errors.objetivo.message}</p>}</div>
    <div className="space-y-2"><Label htmlFor="itemCatalogo">Item do catálogo</Label><select id="itemCatalogo" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50" aria-invalid={Boolean(errors.itemCatalogo)} {...register("itemCatalogo")}><option value="">Selecione um produto ou serviço</option><option value="edredom">Lavagem de edredom</option><option value="terno">Lavagem de terno</option><option value="primeira-lavagem">Primeira lavagem</option></select>{errors.itemCatalogo && <p role="alert" className="text-sm text-destructive">{errors.itemCatalogo.message}</p>}</div>
    <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end"><Button type="button" variant="outline">Salvar e sair</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Salvando..." : "Continuar para o público"}</Button></div>
  </form>;
}
