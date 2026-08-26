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

  it("mostra o atalho de atendimento para o operador", () => {
    render(<NavegacaoMobileInferior papel="Operador" />);

    const navegacao = screen.getByRole("navigation", { name: "Navegação rápida" });
    expect(within(navegacao).getByRole("link", { name: "Atender" })).toBeInTheDocument();
    expect(within(navegacao).queryByRole("link", { name: "Ações" })).not.toBeInTheDocument();
  });
});
