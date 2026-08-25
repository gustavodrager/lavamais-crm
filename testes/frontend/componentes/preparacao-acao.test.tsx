import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { PreparacaoAcao } from "../../../src/web/src/app/(autenticado)/acoes-comerciais/[id]/preparacao";
import { prepararAcao } from "../../../src/web/src/app/(autenticado)/acoes-comerciais/[id]/acoes";

vi.mock("../../../src/web/src/app/(autenticado)/acoes-comerciais/[id]/acoes", () => ({ prepararAcao: vi.fn() }));

function PreparacaoControlada() {
  const [modelo, setModelo] = useState("");
  return <PreparacaoAcao acaoId="6d3d0d64-a111-4cff-8db8-111111111111" modelos={[{ modeloId: "6d3d0d64-a111-4cff-8db8-111111111115", versaoId: "6d3d0d64-a111-4cff-8db8-111111111116", nome: "Oferta de serviço", numeroVersao: 1, canal: "Whatsapp", conteudoPreVisualizacao: "Olá, {{nomeCliente}}! Conheça {{itemCatalogo}}.", variaveis: ["nomeCliente", "itemCatalogo"] }]} versaoModeloId={modelo} aoSelecionarModelo={setModelo} nomeItemCatalogo="Lavagem de edredom" simulacao={{ quantidadeEncontrada: 1, quantidadeElegivel: 1, pagina: 1, tamanhoPagina: 10, clientes: [{ clienteId: "6d3d0d64-a111-4cff-8db8-111111111113", nome: "Ana Martins", whatsapp: "+5513999999999", elegivel: true, motivoExclusao: null }] }} />;
}

describe("PreparacaoAcao", () => {
  it("apresenta e permite preparar somente um modelo publicado", async () => {
    const usuario = userEvent.setup();
    vi.mocked(prepararAcao).mockResolvedValue({ sucesso: false, mensagem: "falha controlada" });
    render(<PreparacaoControlada />);

    await usuario.click(screen.getByRole("radio", { name: /Oferta de serviço/ }));
    expect(screen.getByText(/Olá, Ana Martins! Conheça Lavagem de edredom/)).toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: "Confirmar clientes e mensagem" }));
    await usuario.click(screen.getByRole("button", { name: "Sim, começar os atendimentos" }));

    await waitFor(() => expect(prepararAcao).toHaveBeenCalledWith({ acaoId: "6d3d0d64-a111-4cff-8db8-111111111111", versaoModeloId: "6d3d0d64-a111-4cff-8db8-111111111116" }));
  });
});
