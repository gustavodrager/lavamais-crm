import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmarPublicacao } from "../../../src/web/src/app/(autenticado)/roteiros/confirmar-publicacao";

vi.mock("../../../src/web/src/app/(autenticado)/roteiros/acoes", () => ({ publicarRoteiro: vi.fn() }));

describe("ConfirmarPublicacao", () => {
  it("mantem o botao do dialogo vinculado ao formulario server-side", async () => {
    const usuario = userEvent.setup();
    render(<ConfirmarPublicacao roteiroId="6d3d0d64-a111-4cff-8db8-111111111111" data="2026-08-25" versao={4} quantidade={2} />);
    await usuario.click(screen.getByRole("button", { name: "Publicar para o motorista" }));
    const acao = screen.getByRole("button", { name: "Publicar roteiro" });
    expect(acao).toHaveAttribute("form", "publicar-roteiro-6d3d0d64-a111-4cff-8db8-111111111111");
    expect(screen.getByDisplayValue("4")).toHaveAttribute("name", "versao");
  });
});
