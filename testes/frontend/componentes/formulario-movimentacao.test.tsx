import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormularioMovimentacao } from "../../../src/web/src/app/(autenticado)/movimentacoes/formulario-movimentacao";

vi.mock("../../../src/web/src/app/(autenticado)/movimentacoes/acoes", () => ({
  registrarMovimentacao: vi.fn(),
}));

const ofertas = [
  { id: "1d3d0d64-a111-4cff-8db8-111111111112", artigoDeLavanderiaId: "2d3d0d64-a111-4cff-8db8-111111111112", nomeArtigo: "Camisa", categoria: "Vestuário", servicoDeLavanderiaId: "3d3d0d64-a111-4cff-8db8-111111111112", nomeServico: "Lavagem e passadoria", precoUnitario: 16.20 },
  { id: "4d3d0d64-a111-4cff-8db8-111111111112", artigoDeLavanderiaId: "5d3d0d64-a111-4cff-8db8-111111111112", nomeArtigo: "Terno", categoria: "Vestuário", servicoDeLavanderiaId: "6d3d0d64-a111-4cff-8db8-111111111112", nomeServico: "Lavagem a seco", precoUnitario: 79.20 },
];

describe("FormularioMovimentacao", () => {
  it("permite montar uma visita com várias linhas e calcula o total", async () => {
    const usuario = userEvent.setup();
    render(<FormularioMovimentacao clienteId="7d3d0d64-a111-4cff-8db8-111111111112" nomeCliente="Ana" ofertas={ofertas} agoraLocal="2026-08-25T17:00" />);
    expect(screen.getByRole("link", { name: "Abrir detalhes das movimentações de Ana" })).toHaveAttribute("href", "/clientes/7d3d0d64-a111-4cff-8db8-111111111112");

    await usuario.selectOptions(screen.getByLabelText("Artigo e serviço"), ofertas[0].id);
    await usuario.clear(screen.getByLabelText("Quantidade"));
    await usuario.type(screen.getByLabelText("Quantidade"), "2");
    expect(screen.getAllByText("R$ 32,40").length).toBeGreaterThanOrEqual(2);

    await usuario.click(screen.getByRole("button", { name: "Adicionar item" }));
    const seletores = screen.getAllByLabelText("Artigo e serviço");
    await usuario.selectOptions(seletores[1], ofertas[1].id);
    expect(screen.getByText("R$ 111,60")).toBeVisible();
    expect(screen.getAllByRole("option", { name: /Camisa/ })[1]).toBeDisabled();

    await usuario.click(screen.getByRole("button", { name: "Remover linha 2" }));
    expect(screen.getAllByLabelText("Artigo e serviço")).toHaveLength(1);
  });

  it("exige confirmação explícita antes de registrar", async () => {
    const usuario = userEvent.setup();
    render(<FormularioMovimentacao clienteId="7d3d0d64-a111-4cff-8db8-111111111112" nomeCliente="Ana" ofertas={ofertas} agoraLocal="2026-08-25T17:00" />);

    await usuario.selectOptions(screen.getByLabelText("Artigo e serviço"), ofertas[0].id);
    await usuario.click(screen.getByRole("button", { name: "Registrar atendimento" }));

    expect(screen.getByRole("alertdialog")).toHaveTextContent("Confirmar este atendimento?");
    expect(screen.getByRole("alertdialog")).toHaveTextContent("Ana");
    expect(screen.getByRole("alertdialog")).toHaveTextContent("R$ 16,20 por unidade");
    await usuario.click(screen.getByRole("button", { name: "Voltar e revisar" }));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });
});
