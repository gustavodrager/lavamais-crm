import { render, screen, within } from "@testing-library/react";
import { NavegacaoMobileInferior } from "../../../src/web/src/components/navegacao-mobile-inferior";

vi.mock("next/navigation", () => ({ usePathname: () => "/inicio" }));

describe("NavegacaoMobileInferior", () => {
  it("mantem os cinco destinos na mesma linha", () => {
    render(<NavegacaoMobileInferior papel="Gerente" />);

    const navegacao = screen.getByRole("navigation", { name: "Navegação rápida" });
    expect(navegacao).toHaveClass("grid-cols-5");
    expect(within(navegacao).getAllByRole("link")).toHaveLength(4);
    expect(within(navegacao).getByRole("button", { name: "Mais" })).toBeInTheDocument();
  });

  it("deixa as cinco tarefas principais diretas para o operador", () => {
    render(<NavegacaoMobileInferior papel="Operador" />);

    const navegacao = screen.getByRole("navigation", { name: "Navegação rápida" });
    expect(within(navegacao).getAllByRole("link")).toHaveLength(5);
    expect(within(navegacao).getByRole("link", { name: "Atender" })).toHaveAttribute("href", "/movimentacoes");
    expect(within(navegacao).getByRole("link", { name: "Mensagens" })).toHaveAttribute("href", "/acoes-comerciais");
    expect(within(navegacao).getByRole("link", { name: "Roteiro" })).toHaveAttribute("href", "/meu-roteiro");
    expect(within(navegacao).queryByRole("button", { name: "Mais" })).not.toBeInTheDocument();
  });
});
