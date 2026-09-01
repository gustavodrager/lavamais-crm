"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { PencilLine, Plus, Search, Trash2, UserRoundCheck } from "lucide-react";
import type { OfertaDoCatalogoDeLavanderia } from "@/contratos/apresentacao";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { registrarMovimentacao, type EstadoRegistroMovimentacao } from "./acoes";

const estadoInicial: EstadoRegistroMovimentacao = {};

type LinhaDoFormulario = {
  chave: string;
  ofertaDeServicoId: string;
  quantidade: number;
  precoUnitario: string;
  buscaOferta: string;
  alterandoPreco: boolean;
};

type RascunhoAtendimento = {
  linhas: Array<Pick<LinhaDoFormulario, "ofertaDeServicoId" | "quantidade" | "precoUnitario">>;
  dataMovimentacao: string;
  codigoExterno: string;
  observacao: string;
};

const novaLinha = (chave = crypto.randomUUID()): LinhaDoFormulario => ({
  chave,
  ofertaDeServicoId: "",
  quantidade: 1,
  precoUnitario: "",
  buscaOferta: "",
  alterandoPreco: false,
});

export function chaveRascunhoAtendimento(clienteId: string) {
  return `lavamais:rascunho-atendimento:v1:${clienteId}`;
}

type PropriedadesFormulario = {
  clienteId: string;
  nomeCliente: string;
  whatsappCliente?: string;
  localidadeCliente?: string;
  ofertas: OfertaDoCatalogoDeLavanderia[];
  agoraLocal: string;
  busca?: string;
  modoOperador?: boolean;
};

export function FormularioMovimentacao({
  clienteId,
  nomeCliente,
  whatsappCliente,
  localidadeCliente,
  ofertas,
  agoraLocal,
  busca = "",
  modoOperador = false,
}: PropriedadesFormulario) {
  const [estado, acao, pendente] = useActionState(registrarMovimentacao, estadoInicial);
  const [linhas, setLinhas] = useState<LinhaDoFormulario[]>(() => [novaLinha("linha-inicial")]);
  const [dataMovimentacao, setDataMovimentacao] = useState(agoraLocal);
  const [codigoExterno, setCodigoExterno] = useState("");
  const [observacao, setObservacao] = useState("");
  const [rascunhoCarregado, setRascunhoCarregado] = useState(false);
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);
  const formularioRef = useRef<HTMLFormElement>(null);
  const confirmouEnvio = useRef(false);
  const ofertasPorId = useMemo(() => new Map(ofertas.map((oferta) => [oferta.id, oferta])), [ofertas]);
  const ofertasSelecionadas = new Set(linhas.map((linha) => linha.ofertaDeServicoId).filter(Boolean));
  const linhasSerializadas = JSON.stringify(linhas.map((linha) => ({
    ofertaDeServicoId: linha.ofertaDeServicoId,
    quantidade: linha.quantidade,
    precoUnitario: linha.precoUnitario.trim() || null,
  })));
  const total = linhas.reduce((soma, linha) => soma + calcularSubtotal(linha, ofertasPorId), 0);
  const linhasValidas = linhas.every((linha) => {
    const precoInformado = linha.precoUnitario.trim();
    const preco = precoInformado ? converterPreco(precoInformado) : null;
    return ofertasPorId.has(linha.ofertaDeServicoId)
      && Number.isInteger(linha.quantidade)
      && linha.quantidade > 0
      && (!precoInformado || (preco !== null && preco >= 0));
  }) && ofertasSelecionadas.size === linhas.length;
  const retorno = `/movimentacoes?${new URLSearchParams({ clienteId, ...(busca ? { busca } : {}) })}`;
  const urlEntrada = `/entrar?${new URLSearchParams({ retorno })}`;

  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      try {
        const armazenado = window.sessionStorage.getItem(chaveRascunhoAtendimento(clienteId));
        if (armazenado) {
          const rascunho = JSON.parse(armazenado) as RascunhoAtendimento;
          if (Array.isArray(rascunho.linhas) && rascunho.linhas.length > 0) {
            setLinhas(rascunho.linhas.map((linha) => ({
              chave: crypto.randomUUID(),
              ofertaDeServicoId: typeof linha.ofertaDeServicoId === "string" ? linha.ofertaDeServicoId : "",
              quantidade: Number.isInteger(linha.quantidade) && linha.quantidade > 0 ? linha.quantidade : 1,
              precoUnitario: typeof linha.precoUnitario === "string" ? linha.precoUnitario : "",
              buscaOferta: "",
              alterandoPreco: Boolean(linha.precoUnitario),
            })));
          }
          if (typeof rascunho.dataMovimentacao === "string") setDataMovimentacao(rascunho.dataMovimentacao);
          if (!modoOperador && typeof rascunho.codigoExterno === "string") setCodigoExterno(rascunho.codigoExterno);
          if (typeof rascunho.observacao === "string") setObservacao(rascunho.observacao);
        }
      } catch {
        window.sessionStorage.removeItem(chaveRascunhoAtendimento(clienteId));
      } finally {
        setRascunhoCarregado(true);
      }
    }, 0);
    return () => window.clearTimeout(temporizador);
  }, [clienteId, modoOperador]);

  useEffect(() => {
    if (!rascunhoCarregado) return;
    const rascunho: RascunhoAtendimento = {
      linhas: linhas.map(({ ofertaDeServicoId, quantidade, precoUnitario }) => ({
        ofertaDeServicoId,
        quantidade,
        precoUnitario,
      })),
      dataMovimentacao,
      codigoExterno: modoOperador ? "" : codigoExterno,
      observacao,
    };
    try {
      window.sessionStorage.setItem(chaveRascunhoAtendimento(clienteId), JSON.stringify(rascunho));
    } catch {
      // O formulario continua utilizavel quando o armazenamento do navegador estiver indisponivel.
    }
  }, [clienteId, codigoExterno, dataMovimentacao, linhas, modoOperador, observacao, rascunhoCarregado]);

  function atualizarLinha(chave: string, alteracao: Partial<LinhaDoFormulario>) {
    setLinhas((atuais) => atuais.map((linha) => linha.chave === chave ? { ...linha, ...alteracao } : linha));
  }

  function selecionarOferta(chave: string, oferta: OfertaDoCatalogoDeLavanderia) {
    atualizarLinha(chave, {
      ofertaDeServicoId: oferta.id,
      buscaOferta: "",
      precoUnitario: "",
      alterandoPreco: false,
    });
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

  return (
    <>
      <form ref={formularioRef} action={acao} onSubmit={aoEnviar} className="space-y-5">
        {estado.mensagem ? (
          <Alert variant="destructive">
            <AlertTitle>Atendimento não registrado</AlertTitle>
            <AlertDescription>
              {estado.mensagem}
              {estado.requerLogin ? (
                <Button asChild variant="outline" className="mt-3">
                  <Link href={urlEntrada}>Entrar novamente</Link>
                </Button>
              ) : null}
            </AlertDescription>
          </Alert>
        ) : null}

        <input type="hidden" name="clienteId" value={clienteId} />
        <input type="hidden" name="linhas" value={linhasSerializadas} />
        <input type="hidden" name="busca" value={busca} />
        {modoOperador ? <input type="hidden" name="codigoExterno" value="" /> : null}

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-primary/5 p-3">
          <div className="flex min-w-0 items-start gap-3">
            <UserRoundCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <div className="min-w-0">
              <Link
                href={`/clientes/${clienteId}`}
                className="font-medium text-[var(--marca-azul-profundo)] underline-offset-4 hover:underline"
                aria-label={`Abrir histórico de atendimentos de ${nomeCliente}`}
              >
                {nomeCliente}
              </Link>
              {whatsappCliente || localidadeCliente ? (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {[whatsappCliente, localidadeCliente].filter(Boolean).join(" · ")}
                </p>
              ) : null}
            </div>
          </div>
          <Button asChild type="button" size="sm" variant="outline">
            <Link href="/movimentacoes">Trocar cliente</Link>
          </Button>
        </div>

        <fieldset className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <legend className="text-sm font-medium">Itens e serviços</legend>
              <p className="text-xs text-muted-foreground">Pesquise pelo artigo, serviço ou categoria.</p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!linhasValidas || linhas.length >= ofertas.length}
              onClick={() => setLinhas((atuais) => [...atuais, novaLinha()])}
            >
              <Plus aria-hidden="true" />
              Adicionar item
            </Button>
          </div>

          {ofertas.length === 0 ? (
            <Alert>
              <AlertTitle>Catálogo vazio</AlertTitle>
              <AlertDescription>Peça a um administrador para executar a carga inicial do catálogo.</AlertDescription>
            </Alert>
          ) : null}

          {linhas.map((linha, indice) => {
            const ofertaSelecionada = ofertasPorId.get(linha.ofertaDeServicoId);
            const precoInvalido = linha.precoUnitario.trim() !== "" && converterPreco(linha.precoUnitario) === null;
            const ofertasEncontradas = filtrarOfertas(ofertas, linha.buscaOferta)
              .filter((oferta) => !ofertasSelecionadas.has(oferta.id) || oferta.id === linha.ofertaDeServicoId);
            return (
              <div key={linha.chave} className="space-y-3 rounded-lg border p-3 sm:p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">Item {indice + 1}</span>
                  {linhas.length > 1 ? (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={`Remover item ${indice + 1}`}
                      onClick={() => setLinhas((atuais) => atuais.filter((item) => item.chave !== linha.chave))}
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                  ) : null}
                </div>

                {ofertaSelecionada ? (
                  <>
                    <div className="rounded-md bg-secondary/50 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium">{ofertaSelecionada.nomeArtigo}</p>
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            {ofertaSelecionada.nomeServico} · {ofertaSelecionada.categoria}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => atualizarLinha(linha.chave, { ofertaDeServicoId: "", buscaOferta: "", precoUnitario: "", alterandoPreco: false })}
                        >
                          Trocar
                        </Button>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3 border-t pt-3 text-sm">
                        <span className="text-muted-foreground">Preço de tabela</span>
                        <strong className="tabular-nums">{moeda.format(ofertaSelecionada.precoUnitario)}</strong>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
                      <div className="space-y-2">
                        <Label htmlFor={`quantidade-${linha.chave}`}>Quantidade</Label>
                        <Input
                          id={`quantidade-${linha.chave}`}
                          type="number"
                          min={1}
                          step={1}
                          required
                          aria-invalid={!Number.isInteger(linha.quantidade) || linha.quantidade <= 0}
                          value={linha.quantidade}
                          onChange={(evento) => atualizarLinha(linha.chave, { quantidade: Number(evento.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        {linha.alterandoPreco ? (
                          <>
                            <div className="flex items-center justify-between gap-3">
                              <Label htmlFor={`preco-${linha.chave}`}>Preço combinado</Label>
                              <Button
                                type="button"
                                size="xs"
                                variant="ghost"
                                onClick={() => atualizarLinha(linha.chave, { precoUnitario: "", alterandoPreco: false })}
                              >
                                Usar preço de tabela
                              </Button>
                            </div>
                            <Input
                              id={`preco-${linha.chave}`}
                              inputMode="decimal"
                              placeholder="0,00"
                              aria-invalid={precoInvalido}
                              value={linha.precoUnitario}
                              onChange={(evento) => atualizarLinha(linha.chave, { precoUnitario: evento.target.value })}
                            />
                            {precoInvalido ? <p className="text-xs text-destructive">Informe um preço válido.</p> : null}
                          </>
                        ) : (
                          <div className="flex h-full items-end">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => atualizarLinha(linha.chave, { alterandoPreco: true })}
                            >
                              <PencilLine aria-hidden="true" />
                              Alterar preço
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t pt-3 text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <strong className="tabular-nums">{moeda.format(calcularSubtotal(linha, ofertasPorId))}</strong>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor={`oferta-${linha.chave}`}>Localizar item ou serviço</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                      <Input
                        id={`oferta-${linha.chave}`}
                        value={linha.buscaOferta}
                        onChange={(evento) => atualizarLinha(linha.chave, { buscaOferta: evento.target.value })}
                        placeholder="Ex.: edredom, lavagem ou vestuário"
                        className="pl-9"
                        autoComplete="off"
                      />
                    </div>
                    <div className="max-h-56 divide-y overflow-y-auto rounded-md border" aria-label={`Resultados do catálogo para o item ${indice + 1}`}>
                      {ofertasEncontradas.length > 0 ? ofertasEncontradas.slice(0, 8).map((oferta) => (
                        <button
                          key={oferta.id}
                          type="button"
                          className="flex w-full items-center justify-between gap-3 p-3 text-left text-sm transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                          aria-label={`Selecionar ${oferta.nomeArtigo}, ${oferta.nomeServico}, ${moeda.format(oferta.precoUnitario)}`}
                          onClick={() => selecionarOferta(linha.chave, oferta)}
                        >
                          <span className="min-w-0">
                            <strong className="block truncate font-medium">{oferta.nomeArtigo}</strong>
                            <span className="block truncate text-xs text-muted-foreground">{oferta.nomeServico} · {oferta.categoria}</span>
                          </span>
                          <span className="shrink-0 font-medium tabular-nums">{moeda.format(oferta.precoUnitario)}</span>
                        </button>
                      )) : (
                        <p className="p-4 text-sm text-muted-foreground">Nenhuma oferta encontrada.</p>
                      )}
                    </div>
                    {ofertasEncontradas.length > 8 ? (
                      <p className="text-xs text-muted-foreground">Digite mais detalhes para filtrar as outras {ofertasEncontradas.length - 8} opções.</p>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </fieldset>

        <details className="rounded-lg border p-3">
          <summary className="cursor-pointer text-sm font-medium">Mais detalhes</summary>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="data">Data e hora do atendimento</Label>
              <Input id="data" name="dataMovimentacao" type="datetime-local" value={dataMovimentacao} onChange={(evento) => setDataMovimentacao(evento.target.value)} />
            </div>
            {!modoOperador ? (
              <div className="space-y-2">
                <Label htmlFor="codigo">Código externo <span className="font-normal text-muted-foreground">(opcional)</span></Label>
                <Input id="codigo" name="codigoExterno" value={codigoExterno} onChange={(evento) => setCodigoExterno(evento.target.value)} />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="observacao">Observação <span className="font-normal text-muted-foreground">(opcional)</span></Label>
              <Textarea id="observacao" name="observacao" maxLength={500} value={observacao} onChange={(evento) => setObservacao(evento.target.value)} />
            </div>
          </div>
        </details>

        <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 -mx-4 border-y bg-background/95 px-4 py-3 shadow-[0_-8px_20px_-16px_rgba(0,0,0,0.45)] backdrop-blur md:static md:mx-0 md:rounded-lg md:border md:shadow-none">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-xs text-muted-foreground">Total do atendimento</span>
              <p className="text-lg font-semibold tabular-nums">{moeda.format(total)}</p>
            </div>
            <Button type="submit" className="min-w-40" disabled={pendente || ofertas.length === 0 || !linhasValidas}>
              {pendente ? "Registrando..." : "Revisar atendimento"}
            </Button>
          </div>
          {!linhasValidas && ofertas.length > 0 ? (
            <p className="mt-2 text-xs text-muted-foreground">Selecione e revise todos os itens para continuar.</p>
          ) : null}
        </div>
      </form>

      <AlertDialog open={confirmacaoAberta} onOpenChange={setConfirmacaoAberta}>
        <AlertDialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar atendimento?</AlertDialogTitle>
            <AlertDialogDescription>Confira o cliente, os itens e o total antes de registrar.</AlertDialogDescription>
          </AlertDialogHeader>

          <dl className="grid gap-3 rounded-lg bg-secondary/50 p-3 text-sm sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Cliente</dt>
              <dd className="font-medium">{nomeCliente}</dd>
            </div>
            {dataMovimentacao && dataMovimentacao !== agoraLocal ? (
              <div>
                <dt className="text-muted-foreground">Data</dt>
                <dd className="font-medium">{formatarDataResumo(dataMovimentacao)}</dd>
              </div>
            ) : null}
            {!modoOperador && codigoExterno.trim() ? (
              <div>
                <dt className="text-muted-foreground">Código externo</dt>
                <dd className="font-medium">{codigoExterno.trim()}</dd>
              </div>
            ) : null}
            {observacao.trim() ? (
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Observação</dt>
                <dd className="whitespace-pre-wrap font-medium">{observacao.trim()}</dd>
              </div>
            ) : null}
          </dl>

          <div className="space-y-1" aria-label="Resumo dos itens">
            <h3 className="text-sm font-medium">Itens</h3>
            {linhas.map((linha, indice) => {
              const oferta = ofertasPorId.get(linha.ofertaDeServicoId);
              const preco = obterPrecoPraticado(linha, oferta?.precoUnitario ?? 0);
              return (
                <div key={linha.chave} className="flex items-start justify-between gap-3 border-b py-2 text-sm last:border-b-0">
                  <div>
                    <p className="font-medium">{linha.quantidade} × {oferta?.nomeArtigo ?? "Oferta não selecionada"}</p>
                    <p className="text-xs text-muted-foreground">{oferta?.nomeServico ?? ""} · {moeda.format(preco)} por unidade</p>
                  </div>
                  <strong className="shrink-0 tabular-nums">{moeda.format(preco * linha.quantidade)}</strong>
                  <span className="sr-only">Item {indice + 1}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t pt-3">
            <span className="font-medium">Total do atendimento</span>
            <strong className="text-lg tabular-nums">{moeda.format(total)}</strong>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Voltar e revisar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarEnvio} disabled={pendente}>Confirmar atendimento</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function normalizarBusca(valor: string) {
  return valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
}

function filtrarOfertas(ofertas: OfertaDoCatalogoDeLavanderia[], busca: string) {
  const termo = normalizarBusca(busca);
  if (!termo) return ofertas;
  return ofertas.filter((oferta) => normalizarBusca(`${oferta.nomeArtigo} ${oferta.nomeServico} ${oferta.categoria}`).includes(termo));
}

export function converterPreco(valor: string) {
  const limpo = valor.trim().replace(/R\$/gi, "").replace(/\s/g, "");
  if (!limpo) return null;
  const normalizado = limpo.includes(",") ? limpo.replace(/\./g, "").replace(",", ".") : limpo;
  const preco = Number(normalizado);
  return Number.isFinite(preco) ? preco : null;
}

function obterPrecoPraticado(linha: LinhaDoFormulario, precoTabela: number) {
  const precoInformado = converterPreco(linha.precoUnitario);
  return linha.precoUnitario.trim() && precoInformado !== null ? precoInformado : precoTabela;
}

function calcularSubtotal(linha: LinhaDoFormulario, ofertasPorId: Map<string, OfertaDoCatalogoDeLavanderia>) {
  const oferta = ofertasPorId.get(linha.ofertaDeServicoId);
  const quantidade = Number.isInteger(linha.quantidade) && linha.quantidade > 0 ? linha.quantidade : 0;
  return obterPrecoPraticado(linha, oferta?.precoUnitario ?? 0) * quantidade;
}

function formatarDataResumo(valor: string) {
  if (!valor) return "Agora";
  const data = new Date(`${valor}:00-03:00`);
  return Number.isNaN(data.getTime())
    ? valor
    : new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      dateStyle: "short",
      timeStyle: "short",
    }).format(data);
}
