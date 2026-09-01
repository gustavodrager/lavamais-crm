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
  beforeEach(() => window.sessionStorage.clear());

  it("permite montar uma visita com várias linhas e calcula o total", async () => {
    const usuario = userEvent.setup();
    render(<FormularioMovimentacao clienteId="7d3d0d64-a111-4cff-8db8-111111111112" nomeCliente="Ana" ofertas={ofertas} agoraLocal="2026-08-25T17:00" />);
    expect(screen.getByRole("link", { name: "Abrir histórico de atendimentos de Ana" })).toHaveAttribute("href", "/clientes/7d3d0d64-a111-4cff-8db8-111111111112");

    await usuario.click(screen.getByRole("button", { name: /Selecionar Camisa/ }));
    await usuario.clear(screen.getByLabelText("Quantidade"));
    await usuario.type(screen.getByLabelText("Quantidade"), "2");
    expect(screen.getAllByText("R$ 32,40").length).toBeGreaterThanOrEqual(2);

    await usuario.click(screen.getByRole("button", { name: "Adicionar item" }));
    expect(screen.getAllByRole("textbox", { name: "Localizar item ou serviço" })).toHaveLength(1);
    expect(screen.queryByRole("button", { name: /Selecionar Camisa/ })).not.toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: /Selecionar Terno/ }));
    expect(screen.getByText("R$ 111,60")).toBeVisible();

    await usuario.click(screen.getByRole("button", { name: "Remover item 2" }));
    expect(screen.queryByText("Terno")).not.toBeInTheDocument();
  });

  it("exige confirmação explícita antes de registrar", async () => {
    const usuario = userEvent.setup();
    render(<FormularioMovimentacao clienteId="7d3d0d64-a111-4cff-8db8-111111111112" nomeCliente="Ana" ofertas={ofertas} agoraLocal="2026-08-25T17:00" />);

    await usuario.click(screen.getByRole("button", { name: /Selecionar Camisa/ }));
    await usuario.click(screen.getByRole("button", { name: "Revisar atendimento" }));

    expect(screen.getByRole("alertdialog")).toHaveTextContent("Confirmar atendimento?");
    expect(screen.getByRole("alertdialog")).toHaveTextContent("Ana");
    expect(screen.getByRole("alertdialog")).toHaveTextContent("R$ 16,20 por unidade");
    await usuario.click(screen.getByRole("button", { name: "Voltar e revisar" }));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("não permite revisar quando o preço combinado é inválido", async () => {
    const usuario = userEvent.setup();
    render(<FormularioMovimentacao clienteId="7d3d0d64-a111-4cff-8db8-111111111112" nomeCliente="Ana" ofertas={ofertas} agoraLocal="2026-08-25T17:00" />);

    await usuario.click(screen.getByRole("button", { name: /Selecionar Camisa/ }));
    await usuario.click(screen.getByRole("button", { name: "Alterar preço" }));
    await usuario.type(screen.getByLabelText("Preço combinado"), "valor inválido");

    expect(screen.getByText("Informe um preço válido.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Revisar atendimento" })).toBeDisabled();
  });
});
