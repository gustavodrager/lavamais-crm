import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmarConclusao } from "../../../src/web/src/app/(autenticado)/meu-roteiro/confirmar-conclusao";
import { ConfirmarRemocao } from "../../../src/web/src/app/(autenticado)/roteiros/confirmar-remocao";
import { NavegacaoRoteiro } from "../../../src/web/src/app/(autenticado)/roteiros/navegacao-roteiro";

vi.mock("../../../src/web/src/app/(autenticado)/roteiros/acoes", () => ({ atualizarParada: vi.fn(), removerParada: vi.fn() }));

describe("fluxo de roteiro do operador", () => {
  it("deixa os modos de organização e execução explícitos", () => {
    render(<NavegacaoRoteiro modo="executar" data="2026-08-31" />);
    expect(screen.getByRole("tab", { name: "Organizar" })).toHaveAttribute("href", "/roteiros?data=2026-08-31");
    expect(screen.getByRole("tab", { name: "Executar" })).toHaveAttribute("href", "/meu-roteiro?data=2026-08-31");
    expect(screen.getByRole("tab", { name: "Executar" })).toHaveAttribute("aria-selected", "true");
  });

  it("confirma a conclusão antes de enviar o formulário", async () => {
    const usuario = userEvent.setup();
    render(<ConfirmarConclusao paradaId="6d3d0d64-a111-4cff-8db8-111111111118" data="2026-08-31" versao={7} nomeCliente="Ana Martins" />);
    await usuario.click(screen.getByRole("button", { name: "Concluir parada" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent("Concluir a parada de Ana Martins?");
    expect(screen.getByRole("button", { name: "Confirmar conclusão" })).toHaveAttribute("form", "concluir-parada-6d3d0d64-a111-4cff-8db8-111111111118");
  });

  it("confirma a remoção e explica que o cadastro será preservado", async () => {
    const usuario = userEvent.setup();
    render(<ConfirmarRemocao roteiroId="6d3d0d64-a111-4cff-8db8-111111111111" paradaId="6d3d0d64-a111-4cff-8db8-111111111118" data="2026-08-31" versao={7} nomeCliente="Ana Martins" />);
    await usuario.click(screen.getByRole("button", { name: "Remover parada de Ana Martins" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent("O cadastro da cliente não será excluído");
    expect(screen.getByRole("button", { name: "Remover parada" })).toHaveAttribute("form", "remover-parada-6d3d0d64-a111-4cff-8db8-111111111118");
  });
});
