import { render, screen, within } from "@testing-library/react";
import { HistoricoComercial } from "../../../src/web/src/app/(autenticado)/clientes/[id]/historico-comercial";
import type { ResumoMovimentacaoComercial } from "../../../src/web/src/contratos/apresentacao";

const base: ResumoMovimentacaoComercial = {
  id: "6d3d0d64-a111-4cff-8db8-111111111121", clienteId: "6d3d0d64-a111-4cff-8db8-111111111113", nomeCliente: "Ana",
  valorTotal: 100,
  dataMovimentacao: "2026-08-24T15:00:00Z", codigoExterno: null, observacao: null, origem: "Recepcao", situacao: "Registrada", versao: 1,
  linhas: [{ id: "1d3d0d64-a111-4cff-8db8-111111111112", ofertaDeServicoId: "2d3d0d64-a111-4cff-8db8-111111111112", artigoDeLavanderiaId: "3d3d0d64-a111-4cff-8db8-111111111112", nomeArtigo: "Edredom casal", servicoDeLavanderiaId: "4d3d0d64-a111-4cff-8db8-111111111112", nomeServico: "Lavagem", quantidade: 1, precoTabela: 100, precoUnitario: 100, subtotal: 100 }],
};

describe("HistoricoComercial", () => {
  it("calcula os indicadores somente com atendimentos registrados", () => {
    const movimentacoes: ResumoMovimentacaoComercial[] = [
      base,
      { ...base, id: "6d3d0d64-a111-4cff-8db8-111111111122", valorTotal: 50, dataMovimentacao: "2026-08-25T12:00:00Z" },
      { ...base, id: "6d3d0d64-a111-4cff-8db8-111111111123", valorTotal: 900, situacao: "Cancelada" },
    ];
    render(<HistoricoComercial movimentacoes={movimentacoes} podeCancelar={false} />);
    expect(screen.getByText("Total informado").parentElement).toHaveTextContent("150,00");
    expect(screen.getByText("Atendimentos").parentElement).toHaveTextContent("2");
    expect(screen.getByText("Média informada").parentElement).toHaveTextContent("75,00");
    expect(within(screen.getByRole("table")).getAllByText("Cancelado")).toHaveLength(1);
  });
});
