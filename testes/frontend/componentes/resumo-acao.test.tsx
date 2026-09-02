import { render, screen } from "@testing-library/react";
import { ResumoAcao } from "../../../src/web/src/app/(autenticado)/acoes-comerciais/[id]/resumo-acao";

describe("ResumoAcao", () => {
  it("consolida confirmações manuais, conversão e valor em formato brasileiro", () => {
    render(<ResumoAcao acao={{ id: "6d3d0d64-a111-4cff-8db8-111111111111", nome: "Ação", objetivo: null, itemDeCatalogoId: "6d3d0d64-a111-4cff-8db8-111111111112", versaoModeloId: null, criterios: { versaoSchema: 2, modo: "Filtros", tipoCliente: null, cidades: null, bairros: null, etiquetaIds: null, cadastradoApartirDe: null, dataNascimentoDe: null, dataNascimentoAte: null, clienteIds: null, clienteIdsExcluidos: null }, situacao: "EmProcessamento", totalDestinatarios: 10, mensagensParaEnviar: 3, retornosParaRegistrar: 4, resultadosRegistrados: 3, dataAtualizacao: "2026-08-20T12:00:00Z", versao: 2, totais: { destinatarios: 10, pendentes: 3, enviados: 7, naoInformados: 7, semRetorno: 1, responderam: 1, interessados: 1, convertidos: 2, semInteresse: 0, valorConvertido: 249.9 }, destinatarios: [] }} />);
    expect(screen.getByRole("progressbar", { name: "Envios confirmados: 70%" })).toHaveValue(70);
    expect(screen.getByText("Pendentes").nextElementSibling).toHaveTextContent("3");
    expect(screen.getByText("20% da audiência")).toBeInTheDocument();
    expect(screen.getByText(/249,90/)).toBeInTheDocument();
  });
});
