import Link from "next/link";
import { Search } from "lucide-react";
import type { ResumoMovimentacaoComercial } from "@/contratos/apresentacao";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { EstadoFalhaApi } from "@/components/estado-falha-api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErroCrmApi } from "@/infraestrutura/crm-api-http";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";
import { obterPortaSessao } from "@/infraestrutura/obter-porta-sessao";
import { papelDaVisao } from "@/lib/sessao-apresentacao";
import { CancelarMovimentacao } from "./cancelar-movimentacao";
import { FormularioMovimentacao } from "./formulario-movimentacao";
import { SucessoAtendimento } from "./sucesso-atendimento";

type ParametrosAtendimentos = {
  busca?: string;
  clienteId?: string;
  erro?: string;
  sucesso?: string;
  movimentacaoId?: string;
  clienteConcluidoId?: string;
};

export default async function Movimentacoes({ searchParams }: { searchParams: Promise<ParametrosAtendimentos> }) {
  const parametros = await searchParams;
  const busca = parametros.busca?.trim() ?? "";
  const api = obterPortaCrmApi();
  let clientes: Awaited<ReturnType<typeof api.listarClientes>>;
  let ofertas: Awaited<ReturnType<typeof api.listarOfertasDoCatalogoDeLavanderia>>;
  let movimentacoes: Awaited<ReturnType<typeof api.listarMovimentacoes>>;
  let clientePorId: Awaited<ReturnType<typeof api.obterCliente>>;
  let sessao: Awaited<ReturnType<ReturnType<typeof obterPortaSessao>["obterSessao"]>>;

  try {
    [clientes, ofertas, movimentacoes, clientePorId, sessao] = await Promise.all([
      busca ? api.listarClientes(busca, 1, 10) : Promise.resolve({ itens: [], pagina: 1, tamanhoPagina: 10, total: 0 }),
      api.listarOfertasDoCatalogoDeLavanderia(),
      api.listarMovimentacoes(undefined, 30),
      parametros.clienteId ? api.obterCliente(parametros.clienteId) : Promise.resolve(null),
      obterPortaSessao().obterSessao(),
    ]);
  } catch (erro) {
    if (erro instanceof ErroCrmApi) return <EstadoFalhaApi status={erro.status} />;
    throw erro;
  }

  const clientesAtivos = clientes.itens.filter((cliente) => cliente.situacao === "Ativo");
  const clienteSelecionado = clientesAtivos.find((cliente) => cliente.id === parametros.clienteId)
    ?? (clientePorId?.situacao === "Ativo" ? clientePorId : undefined);
  const papelVisualizado = papelDaVisao(sessao);
  const modoOperador = papelVisualizado === "Operador";
  const podeCancelar = papelVisualizado === "Administrador" || papelVisualizado === "Gerente";
  const agoraLocal = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date()).replace(" ", "T");
  const movimentacaoConcluida = parametros.movimentacaoId
    ? movimentacoes.find((item) => item.id === parametros.movimentacaoId)
    : undefined;
  const clienteConcluidoId = parametros.clienteConcluidoId ?? movimentacaoConcluida?.clienteId;
  const recentes = movimentacoes.slice(0, 5);
  const anteriores = movimentacoes.slice(5);

  return (
    <>
      <CabecalhoPagina
        titulo="Atendimentos"
        descricao="Registre os itens e serviços combinados com cada cliente."
      />

      {parametros.erro ? (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Atendimento não registrado</AlertTitle>
          <AlertDescription>{parametros.erro}</AlertDescription>
        </Alert>
      ) : null}

      {parametros.sucesso === "1" && clienteConcluidoId ? (
        <SucessoAtendimento
          clienteId={clienteConcluidoId}
          nomeCliente={movimentacaoConcluida ? formatarNome(movimentacaoConcluida.nomeCliente) : undefined}
          valorTotal={movimentacaoConcluida?.valorTotal}
        />
      ) : null}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,620px)_minmax(340px,1fr)]">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>{clienteSelecionado ? "Montar atendimento" : "Novo atendimento"}</CardTitle>
          </CardHeader>
          <CardContent>
            {clienteSelecionado ? (
              <FormularioMovimentacao
                clienteId={clienteSelecionado.id}
                nomeCliente={formatarNome(clienteSelecionado.nome)}
                whatsappCliente={formatarWhatsapp(clienteSelecionado.whatsapp)}
                localidadeCliente={clienteSelecionado.localidade}
                ofertas={ofertas}
                agoraLocal={agoraLocal}
                busca={busca}
                modoOperador={modoOperador}
              />
            ) : (
              <div className="space-y-4">
                <form className="space-y-2" role="search">
                  <Label htmlFor="busca">Localizar cliente</Label>
                  <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                      <Input
                        id="busca"
                        name="busca"
                        defaultValue={busca}
                        placeholder="Nome, WhatsApp ou bairro"
                        className="pl-9"
                        autoFocus={parametros.sucesso === "1"}
                      />
                    </div>
                    <Button type="submit" variant="outline">Buscar</Button>
                  </div>
                </form>

                {busca ? (
                  <div className="space-y-2">
                    {clientesAtivos.length === 0 ? (
                      <div className="rounded-lg border border-dashed p-4">
                        <p className="text-sm text-muted-foreground">Nenhum cliente ativo encontrado.</p>
                        <Button asChild variant="outline" className="mt-3 w-full">
                          <Link href={`/clientes/novo?${new URLSearchParams({ retorno: `/movimentacoes?busca=${busca}` })}`}>
                            Cadastrar cliente e continuar
                          </Link>
                        </Button>
                      </div>
                    ) : clientesAtivos.map((cliente) => (
                      <div key={cliente.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{formatarNome(cliente.nome)}</p>
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {formatarWhatsapp(cliente.whatsapp)} · {cliente.localidade}
                          </p>
                        </div>
                        <Button asChild size="sm">
                          <Link href={`/movimentacoes?${new URLSearchParams({ busca, clienteId: cliente.id })}`}>Atender</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-lg bg-secondary/50 p-4 text-sm text-muted-foreground">
                    Busque um cliente ativo para iniciar o atendimento.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-lg xl:sticky xl:top-5">
          <CardHeader className="flex-row items-center justify-between gap-3">
            <CardTitle>Atendimentos recentes</CardTitle>
            {movimentacoes.length > 0 ? <Badge variant="secondary">{movimentacoes.length}</Badge> : null}
          </CardHeader>
          <CardContent className="p-0">
            {movimentacoes.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted-foreground">Nenhum atendimento registrado.</p>
            ) : (
              <>
                <div className="divide-y">
                  {recentes.map((item) => (
                    <AtendimentoRecente
                      key={item.id}
                      item={item}
                      podeCancelar={podeCancelar}
                      mostrarOrigem={!modoOperador}
                    />
                  ))}
                </div>
                {anteriores.length > 0 ? (
                  <details className="border-t">
                    <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-primary">
                      Ver mais atendimentos ({anteriores.length})
                    </summary>
                    <div className="divide-y border-t">
                      {anteriores.map((item) => (
                        <AtendimentoRecente
                          key={item.id}
                          item={item}
                          podeCancelar={podeCancelar}
                          mostrarOrigem={!modoOperador}
                        />
                      ))}
                    </div>
                  </details>
                ) : null}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function AtendimentoRecente({
  item,
  podeCancelar,
  mostrarOrigem,
}: {
  item: ResumoMovimentacaoComercial;
  podeCancelar: boolean;
  mostrarOrigem: boolean;
}) {
  const descricao = resumirLinhas(item.linhas);
  return (
    <article className="space-y-2 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/clientes/${item.clienteId}`}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {formatarNome(item.nomeCliente)}
          </Link>
          <p className="mt-0.5 text-xs text-muted-foreground">{formatarData(item.dataMovimentacao)}</p>
        </div>
        <Badge variant={item.situacao === "Cancelada" ? "destructive" : "outline"}>
          {item.situacao === "Cancelada" ? "Cancelado" : "Registrado"}
        </Badge>
      </div>
      <p className="line-clamp-2 text-sm leading-5">{descricao}</p>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <strong className="text-sm tabular-nums">{moeda.format(item.valorTotal)}</strong>
          {mostrarOrigem ? <p className="truncate text-xs text-muted-foreground">{rotuloOrigem(item.origem)}</p> : null}
        </div>
        {podeCancelar && item.situacao === "Registrada" ? (
          <CancelarMovimentacao
            id={item.id}
            versao={item.versao}
            nomeCliente={formatarNome(item.nomeCliente)}
            descricao={descricao}
          />
        ) : null}
      </div>
    </article>
  );
}

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const formatarData = (valor: string) => new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  dateStyle: "short",
  timeStyle: "short",
}).format(new Date(valor));

function formatarNome(valor: string) {
  return valor === valor.toLocaleUpperCase("pt-BR")
    ? valor.toLocaleLowerCase("pt-BR").replace(/(^|[\s'-])\p{L}/gu, (letra) => letra.toLocaleUpperCase("pt-BR"))
    : valor;
}

function formatarWhatsapp(valor: string) {
  const digitos = valor.replace(/\D/g, "");
  if (digitos.length === 13 && digitos.startsWith("55")) return `+55 (${digitos.slice(2, 4)}) ${digitos.slice(4, 9)}-${digitos.slice(9)}`;
  if (digitos.length === 12 && digitos.startsWith("55")) return `+55 (${digitos.slice(2, 4)}) ${digitos.slice(4, 8)}-${digitos.slice(8)}`;
  if (digitos.length === 11) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
  if (digitos.length === 10) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  return valor;
}

function resumirLinhas(linhas: ResumoMovimentacaoComercial["linhas"]) {
  if (!linhas.length) return "Atendimento anterior";
  const principais = linhas.slice(0, 2).map((linha) => `${linha.quantidade}× ${linha.nomeArtigo} · ${linha.nomeServico}`);
  const restantes = linhas.length - principais.length;
  return `${principais.join("; ")}${restantes > 0 ? `; +${restantes} ${restantes === 1 ? "item" : "itens"}` : ""}`;
}

function rotuloOrigem(origem: ResumoMovimentacaoComercial["origem"]) {
  if (origem === "Recepcao") return "Recepção";
  if (origem === "ImportacaoEssence") return "Importação Essence";
  return "Integração Essence";
}
