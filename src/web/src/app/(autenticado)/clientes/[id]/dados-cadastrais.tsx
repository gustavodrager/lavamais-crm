import type { ReactNode } from "react";
import { ClipboardList, ContactRound, MapPin, Tags } from "lucide-react";
import type { DetalheCliente } from "@/contratos/apresentacao";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DadosCadastraisDoClienteProps {
  cliente: DetalheCliente;
  nomesEtiquetas: string[];
  modoOperador?: boolean;
}

export function DadosCadastraisDoCliente({ cliente, nomesEtiquetas, modoOperador = false }: DadosCadastraisDoClienteProps) {
  const enderecoCompleto = formatarEnderecoCompleto(cliente);
  const enderecoEstaCompleto = Boolean(
    cliente.endereco?.logradouro
      && cliente.endereco.numero
      && cliente.endereco.cidade,
  );
  const whatsappFormatado = formatarWhatsapp(cliente.whatsapp);
  const whatsappSomenteDigitos = cliente.whatsapp.replace(/\D/g, "");

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b p-5">
        <h2 className="font-heading text-lg font-semibold">Dados do cliente</h2>
        <p className="text-sm text-muted-foreground">Cadastro, contato e preferências.</p>
      </CardHeader>
      <CardContent className="space-y-6 p-5">
        <section aria-labelledby="contato-do-cliente">
          <TituloDaSecao id="contato-do-cliente" icone={ContactRound}>Contato</TituloDaSecao>
          <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            <CampoDoCliente
              rotulo="WhatsApp"
              valor={whatsappSomenteDigitos
                ? <a className="underline-offset-4 hover:underline" href={`https://wa.me/${whatsappSomenteDigitos}`} rel="noreferrer" target="_blank">{whatsappFormatado}</a>
                : whatsappFormatado}
            />
            <CampoDoCliente
              rotulo="E-mail"
              valor={cliente.email
                ? <a className="underline-offset-4 hover:underline" href={`mailto:${cliente.email}`}>{cliente.email}</a>
                : "Não informado"}
            />
            <CampoDoCliente
              rotulo="WhatsApp para marketing"
              valor={<Badge variant={cliente.permiteWhatsapp ? "secondary" : "outline"}>{cliente.permiteWhatsapp ? "Autorizado" : "Não autorizado"}</Badge>}
            />
          </dl>
        </section>

        <section className="border-t pt-6" aria-labelledby="endereco-do-cliente">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <TituloDaSecao id="endereco-do-cliente" icone={MapPin}>Endereço completo</TituloDaSecao>
            <Badge variant={enderecoEstaCompleto ? "secondary" : "outline"}>{enderecoEstaCompleto ? "Completo" : "Incompleto"}</Badge>
          </div>
          <p className="mt-4 break-words rounded-lg bg-muted/50 px-3 py-2.5 text-sm font-medium">{enderecoCompleto}</p>
          <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
            <CampoDoCliente className="lg:col-span-2" rotulo="Logradouro" valor={valorOuNaoInformado(cliente.endereco?.logradouro)} />
            <CampoDoCliente rotulo="Número" valor={valorOuNaoInformado(cliente.endereco?.numero)} />
            <CampoDoCliente rotulo="Complemento" valor={valorOuNaoInformado(cliente.endereco?.complemento)} />
            <CampoDoCliente rotulo="Bairro" valor={valorOuNaoInformado(cliente.endereco?.bairro)} />
            <CampoDoCliente rotulo="Cidade" valor={valorOuNaoInformado(cliente.endereco?.cidade)} />
            <CampoDoCliente rotulo="Estado" valor={valorOuNaoInformado(cliente.endereco?.estado)} />
            <CampoDoCliente rotulo="CEP" valor={formatarCep(cliente.endereco?.cep)} />
          </dl>
        </section>

        <section className="border-t pt-6" aria-labelledby="etiquetas-do-cliente">
          <div className="flex items-center gap-2">
            <TituloDaSecao id="etiquetas-do-cliente" icone={Tags}>Etiquetas</TituloDaSecao>
            <Badge variant="outline">{nomesEtiquetas.length}</Badge>
          </div>
          {nomesEtiquetas.length > 0
            ? <div className="mt-4 flex flex-wrap gap-2">{nomesEtiquetas.map((nome) => <Badge key={nome} variant="secondary">{nome}</Badge>)}</div>
            : <p className="mt-4 text-sm text-muted-foreground">Nenhuma etiqueta vinculada.</p>}
        </section>

        <details className="border-t pt-6">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold"><ClipboardList className="size-4 text-muted-foreground" aria-hidden="true" />Informações complementares</summary>
          <section aria-labelledby="cadastro-do-cliente">
            <h3 id="cadastro-do-cliente" className="sr-only">Cadastro</h3>
            <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
              <CampoDoCliente className="lg:col-span-2" rotulo="Nome" valor={cliente.nome} />
              <CampoDoCliente rotulo="Nome fantasia" valor={valorOuNaoInformado(cliente.nomeFantasia)} />
              <CampoDoCliente rotulo="Tipo de cliente" valor={valorOuNaoInformado(cliente.tipo)} />
              <CampoDoCliente rotulo="Data de nascimento" valor={formatarDataCivil(cliente.dataNascimento)} />
              <CampoDoCliente rotulo="Situação" valor={<Badge variant={cliente.situacao === "Ativo" ? "secondary" : "outline"}>{cliente.situacao}</Badge>} />
              <CampoDoCliente rotulo="Código externo" valor={valorOuNaoInformado(cliente.codigoExterno)} />
              {!modoOperador ? <><CampoDoCliente rotulo="Cadastro na origem" valor={formatarDataHora(cliente.dataCadastroOrigem)} /><CampoDoCliente rotulo="Criado no CRM" valor={formatarDataHora(cliente.dataCriacao)} /><CampoDoCliente rotulo="Última atualização" valor={formatarDataHora(cliente.dataAtualizacao)} /></> : null}
            </dl>
          </section>
        </details>
      </CardContent>
    </Card>
  );
}

function TituloDaSecao({ id, icone: Icone, children }: { id: string; icone: typeof ContactRound; children: ReactNode }) {
  return <div className="flex items-center gap-2"><Icone className="size-4 text-muted-foreground" aria-hidden="true" /><h3 id={id} className="text-sm font-semibold">{children}</h3></div>;
}

function CampoDoCliente({ rotulo, valor, className, valorClassName }: { rotulo: string; valor: ReactNode; className?: string; valorClassName?: string }) {
  return <div className={cn("min-w-0", className)}><dt className="text-xs font-medium text-muted-foreground">{rotulo}</dt><dd className={cn("mt-1 break-words text-sm font-medium", valorClassName)}>{valor}</dd></div>;
}

function valorOuNaoInformado(valor: string | null | undefined) {
  return valor?.trim() || "Não informado";
}

function formatarWhatsapp(valor: string) {
  const digitos = valor.replace(/\D/g, "");
  if (digitos.length === 13 && digitos.startsWith("55")) return `+55 (${digitos.slice(2, 4)}) ${digitos.slice(4, 9)}-${digitos.slice(9)}`;
  if (digitos.length === 12 && digitos.startsWith("55")) return `+55 (${digitos.slice(2, 4)}) ${digitos.slice(4, 8)}-${digitos.slice(8)}`;
  if (digitos.length === 11) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
  if (digitos.length === 10) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  return valor;
}

function formatarCep(valor: string | null | undefined) {
  const digitos = valor?.replace(/\D/g, "") ?? "";
  if (digitos.length === 8) return `${digitos.slice(0, 5)}-${digitos.slice(5)}`;
  return valorOuNaoInformado(valor);
}

function formatarDataCivil(valor: string | null) {
  if (!valor) return "Não informada";
  const correspondencia = /^(\d{4})-(\d{2})-(\d{2})/.exec(valor);
  return correspondencia ? `${correspondencia[3]}/${correspondencia[2]}/${correspondencia[1]}` : valor;
}

function formatarDataHora(valor: string | null) {
  if (!valor) return "Não informado";
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return valor;
  const partes = Object.fromEntries(new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "America/Sao_Paulo",
  }).formatToParts(data).map(({ type, value }) => [type, value]));
  return `${partes.day}/${partes.month}/${partes.year} às ${partes.hour}:${partes.minute}`;
}

function formatarEnderecoCompleto(cliente: DetalheCliente) {
  const endereco = cliente.endereco;
  if (!endereco) return "Não informado";
  const logradouroENumero = [endereco.logradouro, endereco.numero].filter(Boolean).join(", ");
  const localidade = [endereco.bairro, endereco.cidade, endereco.estado].filter(Boolean).join(" - ");
  return [logradouroENumero, endereco.complemento, localidade, formatarCep(endereco.cep)]
    .filter((parte) => parte && parte !== "Não informado")
    .join(" · ") || "Não informado";
}
