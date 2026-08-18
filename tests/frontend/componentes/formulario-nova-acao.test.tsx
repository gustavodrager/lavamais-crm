import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormularioNovaAcao } from "../../../src/web/src/components/formulario-nova-acao";

describe("FormularioNovaAcao", () => {
  it("informa os campos obrigatorios de forma acessivel", async () => {
    const usuario = userEvent.setup();
    render(<FormularioNovaAcao />);
    await usuario.click(screen.getByRole("button", { name: "Continuar para o público" }));
    expect(await screen.findAllByRole("alert")).toHaveLength(3);
    expect(screen.getByLabelText("Nome da ação")).toHaveAttribute("aria-invalid", "true");
  });

  it("apresenta sucesso demonstrativo com dados validos", async () => {
    const usuario = userEvent.setup();
    render(<FormularioNovaAcao />);
    await usuario.type(screen.getByLabelText("Nome da ação"), "Cuidados com edredons");
    await usuario.type(screen.getByLabelText("Objetivo"), "Apresentar o servico aos clientes elegiveis");
    await usuario.selectOptions(screen.getByLabelText("Item do catálogo"), "edredom");
    await usuario.click(screen.getByRole("button", { name: "Continuar para o público" }));
    expect(await screen.findByText("Rascunho validado")).toBeVisible();
  });
});
