"use client";

import { useActionState } from "react";
import { Pencil } from "lucide-react";
import type { DetalheCliente } from "@/contratos/apresentacao";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { atualizarCliente, type EstadoAtualizacaoCliente } from "./acoes";

const estadoInicial: EstadoAtualizacaoCliente = {};

export function EditarCliente({ cliente, retorno, abertoInicial = false }: { cliente: DetalheCliente; retorno?: string; abertoInicial?: boolean }) {
  const [estado, acao, pendente] = useActionState(atualizarCliente, estadoInicial);
  const exigeEndereco = retorno?.startsWith("/roteiros") ?? false;
  return <Sheet defaultOpen={abertoInicial}>
    <SheetTrigger asChild><Button variant="outline"><Pencil />Editar cadastro</Button></SheetTrigger>
    <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
      <SheetHeader className="border-b pr-14"><SheetTitle>Editar cliente</SheetTitle><SheetDescription>Atualize contato, autorização e endereço operacional.</SheetDescription></SheetHeader>
      <form action={acao} className="grid gap-4 px-4 pb-24 sm:grid-cols-2">
        <input type="hidden" name="clienteId" value={cliente.id} />
        {retorno ? <input type="hidden" name="retorno" value={retorno} /> : null}
        {estado.mensagem ? <Alert variant="destructive" className="sm:col-span-2"><AlertTitle>Cadastro não atualizado</AlertTitle><AlertDescription>{estado.mensagem}</AlertDescription></Alert> : null}
        <Campo id="editar-nome" rotulo="Nome"><Input id="editar-nome" name="nome" defaultValue={cliente.nome} required /></Campo>
        <Campo id="editar-whatsapp" rotulo="WhatsApp"><Input id="editar-whatsapp" name="whatsapp" inputMode="tel" defaultValue={cliente.whatsapp} required /></Campo>
        <label className="flex min-h-11 items-start gap-3 rounded-lg bg-secondary/45 p-3 text-sm sm:col-span-2"><input name="permiteMarketingWhatsapp" type="checkbox" className="mt-0.5 size-5 accent-primary" defaultChecked={cliente.permiteWhatsapp} /><span>Cliente autoriza receber mensagens comerciais pelo WhatsApp.</span></label>
        <div className="border-t pt-4 sm:col-span-2"><h3 className="font-medium">Endereço</h3><p className="mt-1 text-sm text-muted-foreground">{exigeEndereco ? "Complete os campos obrigatórios para voltar ao roteiro." : "Logradouro, número e cidade liberam o cliente para roteiros."}</p></div>
        <Campo id="editar-logradouro" rotulo={`Logradouro${exigeEndereco ? " *" : ""}`}><Input id="editar-logradouro" name="logradouro" defaultValue={cliente.endereco?.logradouro ?? ""} required={exigeEndereco} /></Campo>
        <Campo id="editar-numero" rotulo={`Número${exigeEndereco ? " *" : ""}`}><Input id="editar-numero" name="numero" defaultValue={cliente.endereco?.numero ?? ""} required={exigeEndereco} /></Campo>
        <Campo id="editar-complemento" rotulo="Complemento"><Input id="editar-complemento" name="complemento" defaultValue={cliente.endereco?.complemento ?? ""} /></Campo>
        <Campo id="editar-bairro" rotulo="Bairro"><Input id="editar-bairro" name="bairro" defaultValue={cliente.endereco?.bairro ?? ""} /></Campo>
        <Campo id="editar-cidade" rotulo={`Cidade${exigeEndereco ? " *" : ""}`}><Input id="editar-cidade" name="cidade" defaultValue={cliente.endereco?.cidade ?? ""} required={exigeEndereco} /></Campo>
        <div className="grid grid-cols-[1fr_5rem] gap-3"><Campo id="editar-cep" rotulo="CEP"><Input id="editar-cep" name="cep" inputMode="numeric" defaultValue={cliente.endereco?.cep ?? ""} /></Campo><Campo id="editar-estado" rotulo="UF"><Input id="editar-estado" name="estado" maxLength={2} defaultValue={cliente.endereco?.estado ?? "SP"} /></Campo></div>
        <details className="rounded-lg border p-4 sm:col-span-2"><summary className="cursor-pointer text-sm font-medium">Informações complementares</summary><div className="mt-4 grid gap-4 sm:grid-cols-2"><Campo id="editar-fantasia" rotulo="Nome fantasia"><Input id="editar-fantasia" name="nomeFantasia" defaultValue={cliente.nomeFantasia ?? ""} /></Campo><Campo id="editar-tipo" rotulo="Tipo de cliente"><Input id="editar-tipo" name="tipo" defaultValue={cliente.tipo ?? ""} /></Campo><Campo id="editar-email" rotulo="E-mail"><Input id="editar-email" name="email" type="email" defaultValue={cliente.email ?? ""} /></Campo><Campo id="editar-nascimento" rotulo="Data de nascimento"><Input id="editar-nascimento" name="dataNascimento" type="date" defaultValue={cliente.dataNascimento?.slice(0, 10) ?? ""} /></Campo><Campo id="editar-codigo" rotulo="Código externo"><Input id="editar-codigo" name="codigoExterno" defaultValue={cliente.codigoExterno ?? ""} /></Campo></div></details>
        <SheetFooter className="fixed inset-x-0 bottom-0 border-t bg-card sm:left-auto sm:w-[42rem]"><SheetClose asChild><Button type="button" variant="ghost">Cancelar</Button></SheetClose><Button type="submit" disabled={pendente}>{pendente ? "Salvando..." : "Salvar alterações"}</Button></SheetFooter>
      </form>
    </SheetContent>
  </Sheet>;
}

function Campo({ id, rotulo, children }: { id: string; rotulo: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label htmlFor={id}>{rotulo}</Label>{children}</div>;
}
