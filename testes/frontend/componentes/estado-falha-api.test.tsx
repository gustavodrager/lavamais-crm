import { render, screen } from "@testing-library/react";
import { EstadoFalhaApi } from "../../../src/web/src/components/estado-falha-api";

describe("EstadoFalhaApi", () => {
  it("explica a falta de autorização sem revelar dados", () => {
    render(<EstadoFalhaApi status={403} />);
    expect(screen.getByText("Acesso não autorizado")).toBeVisible();
    expect(screen.getByText(/papel ativo/)).toBeVisible();
  });
});
