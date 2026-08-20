import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { DefinicaoPublico } from "../../../src/web/src/app/(autenticado)/acoes-comerciais/[id]/definicao-publico";
import { salvarESimularPublico } from "../../../src/web/src/app/(autenticado)/acoes-comerciais/[id]/acoes";

vi.mock("../../../src/web/src/app/(autenticado)/acoes-comerciais/[id]/acoes", () => ({ salvarESimularPublico: vi.fn() }));
const criterios = { versaoSchema: 1 as const, modo: "Filtros" as const, tipoCliente: null, cidades: null, bairros: null, etiquetaIds: null, cadastradoApartirDe: null, dataNascimentoDe: null, dataNascimentoAte: null, clienteIds: null };

describe("DefinicaoPublico", () => {
  it("apresenta o resumo e os motivos de exclusão após a simulação", async () => {
    vi.mocked(salvarESimularPublico).mockResolvedValue({ sucesso: true, simulacao: { quantidadeEncontrada: 2, quantidadeElegivel: 1, pagina: 1, tamanhoPagina: 20, clientes: [
      { clienteId: "6d3d0d64-a111-4cff-8db8-111111111113", nome: "Ana Martins", whatsapp: "+5513999999999", elegivel: true, motivoExclusao: null },
      { clienteId: "6d3d0d64-a111-4cff-8db8-111111111114", nome: "Patricia Souza", whatsapp: null, elegivel: false, motivoExclusao: "SemPermissao" },
    ] } });
    render(<DefinicaoPublico acaoId="6d3d0d64-a111-4cff-8db8-111111111111" criterios={criterios} />);
    fireEvent.change(screen.getByLabelText("Cidades"), { target: { value: "Praia Grande" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar filtros e simular público" }));
    await waitFor(() => expect(screen.getByText("1 elegíveis")).toBeInTheDocument());
    expect(screen.getByText("Sem permissão")).toBeInTheDocument();
  });
});
