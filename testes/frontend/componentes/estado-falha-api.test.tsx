import { render, screen } from "@testing-library/react";
import { EstadoFalhaApi } from "../../../src/web/src/components/estado-falha-api";

describe("EstadoFalhaApi", () => {
  it("explica a falta de autorização sem revelar dados", () => {
    render(<EstadoFalhaApi status={403} />);
    expect(screen.getByText("Área restrita")).toBeVisible();
    expect(screen.getByText(/não possui permissão/)).toBeVisible();
  });
});
