import { render, screen } from "@testing-library/react";
import { DetalheAtendimento } from "../../../src/web/src/app/(autenticado)/clientes/[id]/atendimentos/[atendimentoId]/detalhe-atendimento";
import type { DetalheMovimentacaoComercial } from "../../../src/web/src/contratos/apresentacao";

const atendimento: DetalheMovimentacaoComercial = {
  id: "6d3d0d64-a111-4cff-8db8-111111111121", clienteId: "6d3d0d64-a111-4cff-8db8-111111111113", nomeCliente: "Ana",
  valorTotal: 100, dataMovimentacao: "2026-08-24T15:00:00Z", codigoExterno: "ESS-10", observacao: "Atendimento de teste",
  origem: "ImportacaoEssence", situacao: "Cancelada", dataCriacao: "2026-08-24T15:01:00Z", dataCancelamento: "2026-08-25T12:00:00Z", motivoCancelamento: "Registro duplicado", versao: 2,
  linhas: [{ id: "1d3d0d64-a111-4cff-8db8-111111111112", ofertaDeServicoId: "2d3d0d64-a111-4cff-8db8-111111111112", artigoDeLavanderiaId: "3d3d0d64-a111-4cff-8db8-111111111112", nomeArtigo: "Edredom casal", servicoDeLavanderiaId: "4d3d0d64-a111-4cff-8db8-111111111112", nomeServico: "Lavagem", quantidade: 1, precoTabela: 100, precoUnitario: 100, subtotal: 100 }],
};

describe("DetalheAtendimento", () => {
  it("mostra composicao, origem, observacao e motivo do cancelamento", () => {
    render(<DetalheAtendimento atendimento={atendimento} podeCancelar={true} />);
    expect(screen.getByText("Atendimento cancelado")).toBeInTheDocument();
    expect(screen.getByText("Registro duplicado")).toBeInTheDocument();
    expect(screen.getAllByText("Edredom casal").length).toBeGreaterThan(0);
    expect(screen.getByText("Importação Essence")).toBeInTheDocument();
    expect(screen.getByText("Atendimento de teste")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Cancelar atendimento/ })).not.toBeInTheDocument();
  });
});
