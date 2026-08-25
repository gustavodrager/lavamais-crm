import { render, screen } from "@testing-library/react";
import { SituacaoAcao } from "../../../src/web/src/components/situacao-acao";

describe("SituacaoAcao", () => {
  it("traduz o identificador tecnico para um rotulo legivel", () => {
    render(<SituacaoAcao situacao="ConcluidaComFalhas" />);
    expect(screen.getByText("Concluída com falhas")).toBeVisible();
  });
});
