"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import {
  criarRascunho,
  type EntradaCriarRascunho,
  type FalhaCriarRascunho,
} from "@/app/(autenticado)/acoes-comerciais/nova/acoes";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { OpcaoItemDeCatalogo } from "@/contratos/apresentacao";

const esquema = z.object({
  nome: z.string().trim().min(3, "Informe um nome com pelo menos 3 caracteres."),
  objetivo: z.string().trim().min(10, "Descreva o objetivo em pelo menos 10 caracteres."),
  itemDeCatalogoId: z.string().uuid().nullable(),
});

type DadosFormulario = z.infer<typeof esquema>;
type AcaoCriarRascunho = (entrada: EntradaCriarRascunho) => Promise<FalhaCriarRascunho>;

export function FormularioNovaAcao({
  itensCatalogo,
  aoCriar = criarRascunho,
}: {
  itensCatalogo: OpcaoItemDeCatalogo[];
  aoCriar?: AcaoCriarRascunho;
}) {
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DadosFormulario>({
    resolver: zodResolver(esquema),
    defaultValues: { nome: "", objetivo: "", itemDeCatalogoId: null },
  });

  const enviar = async (dados: DadosFormulario) => {
    setErroGeral(null);
    const resultado = await aoCriar(dados);
    setErroGeral(resultado.mensagem);
    if (resultado.campos?.nome) setError("nome", { message: resultado.campos.nome });
    if (resultado.campos?.objetivo) setError("objetivo", { message: resultado.campos.objetivo });
    if (resultado.campos?.itemDeCatalogoId) setError("itemDeCatalogoId", { message: resultado.campos.itemDeCatalogoId });
  };

  return (
    <form onSubmit={handleSubmit(enviar)} className="space-y-6" noValidate>
      {erroGeral ? (
        <Alert variant="destructive" aria-live="polite">
          <AlertCircle aria-hidden="true" />
          <AlertTitle>Não foi possível criar o rascunho</AlertTitle>
          <AlertDescription>{erroGeral}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="nome">Nome da ação</Label>
        <Input id="nome" placeholder="Ex.: Cuidados com edredons" aria-invalid={Boolean(errors.nome)} aria-describedby={errors.nome ? "erro-nome" : undefined} {...register("nome")} />
        {errors.nome ? <p id="erro-nome" role="alert" className="text-sm text-destructive">{errors.nome.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="objetivo">Objetivo</Label>
        <Textarea id="objetivo" placeholder="O que a equipe pretende alcançar?" aria-invalid={Boolean(errors.objetivo)} aria-describedby={errors.objetivo ? "erro-objetivo" : "ajuda-objetivo"} {...register("objetivo")} />
        <p id="ajuda-objetivo" className="text-xs text-muted-foreground">Este texto orienta a equipe e não será enviado ao cliente.</p>
        {errors.objetivo ? <p id="erro-objetivo" role="alert" className="text-sm text-destructive">{errors.objetivo.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="itemDeCatalogoId">Item do catálogo <span className="font-normal text-muted-foreground">(opcional)</span></Label>
        <Controller
          name="itemDeCatalogoId"
          control={control}
          render={({ field }) => (
            <Select value={field.value ?? "sem-item"} onValueChange={(valor) => field.onChange(valor === "sem-item" ? null : valor)}>
              <SelectTrigger id="itemDeCatalogoId" aria-invalid={Boolean(errors.itemDeCatalogoId)} aria-describedby={errors.itemDeCatalogoId ? "erro-item-catalogo" : undefined}>
                <SelectValue placeholder="Selecione um produto ou serviço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sem-item">Sem item de catálogo</SelectItem>
                {itensCatalogo.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.nome}{item.categoria ? ` · ${item.categoria}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <p className="text-xs text-muted-foreground">Escolha um item somente quando ele fizer parte da comunicação.</p>
        {errors.itemDeCatalogoId ? <p id="erro-item-catalogo" role="alert" className="text-sm text-destructive">{errors.itemDeCatalogoId.message}</p> : null}
      </div>

      <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
        <Button asChild type="button" variant="ghost"><Link href="/acoes-comerciais">Cancelar</Link></Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Criando rascunho..." : "Criar e escolher clientes"}
        </Button>
      </div>
    </form>
  );
}
