import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormularioNovaAcao } from "../../../src/web/src/components/formulario-nova-acao";

const itemCatalogo = {
  id: "6d3d0d64-a111-4cff-8db8-111111111112",
  nome: "Lavagem de edredom",
  tipo: "Servico" as const,
  categoria: "Casa",
};

describe("FormularioNovaAcao", () => {
  it("informa os campos obrigatorios de forma acessivel", async () => {
    const usuario = userEvent.setup();
    render(<FormularioNovaAcao itensCatalogo={[itemCatalogo]} aoCriar={vi.fn()} />);
    await usuario.click(screen.getByRole("button", { name: "Criar e definir público" }));
    expect(await screen.findAllByRole("alert")).toHaveLength(2);
    expect(screen.getByLabelText("Nome da ação")).toHaveAttribute("aria-invalid", "true");
  });

  it("permite criar uma ação sem item de catálogo", async () => {
    const usuario = userEvent.setup();
    const aoCriar = vi.fn().mockResolvedValue({ sucesso: false, mensagem: "API indisponível para teste." });
    render(<FormularioNovaAcao itensCatalogo={[]} aoCriar={aoCriar} />);

    await usuario.type(screen.getByLabelText(/Nome da ação/), "Contato de relacionamento");
    await usuario.type(screen.getByLabelText("Objetivo"), "Conversar com os clientes selecionados");
    await usuario.click(screen.getByRole("button", { name: "Criar e definir público" }));

    expect(aoCriar).toHaveBeenCalledWith({
      nome: "Contato de relacionamento",
      objetivo: "Conversar com os clientes selecionados",
      itemDeCatalogoId: null,
    });
  });

  it("envia dados validos e apresenta uma falha controlada da API", async () => {
    const usuario = userEvent.setup();
    const aoCriar = vi.fn().mockResolvedValue({ sucesso: false, mensagem: "API indisponível para teste." });
    render(<FormularioNovaAcao itensCatalogo={[itemCatalogo]} aoCriar={aoCriar} />);

    await usuario.type(screen.getByLabelText("Nome da ação"), "Cuidados com edredons");
    await usuario.type(screen.getByLabelText("Objetivo"), "Apresentar o serviço aos clientes elegíveis");
    fireEvent.change(document.querySelector("select")!, { target: { value: itemCatalogo.id } });
    await usuario.click(screen.getByRole("button", { name: "Criar e definir público" }));

    expect(aoCriar).toHaveBeenCalledWith({
      nome: "Cuidados com edredons",
      objetivo: "Apresentar o serviço aos clientes elegíveis",
      itemDeCatalogoId: itemCatalogo.id,
    });
    expect(await screen.findByText("API indisponível para teste.")).toBeVisible();
  });
});
