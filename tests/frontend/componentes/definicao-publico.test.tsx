import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { DefinicaoPublico } from "../../../src/web/src/app/(autenticado)/acoes-comerciais/[id]/definicao-publico";
import { alterarExclusaoDoPublico, salvarESimularPublico } from "../../../src/web/src/app/(autenticado)/acoes-comerciais/[id]/acoes";

vi.mock("../../../src/web/src/app/(autenticado)/acoes-comerciais/[id]/acoes", () => ({ salvarESimularPublico: vi.fn(), alterarExclusaoDoPublico: vi.fn() }));
const criterios = { versaoSchema: 2 as const, modo: "Filtros" as const, tipoCliente: null, cidades: null, bairros: null, etiquetaIds: null, cadastradoApartirDe: null, dataNascimentoDe: null, dataNascimentoAte: null, clienteIds: null, clienteIdsExcluidos: null };

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

  it("permite excluir manualmente um cliente elegível", async () => {
    vi.mocked(salvarESimularPublico).mockResolvedValue({ sucesso: true, simulacao: { quantidadeEncontrada: 1, quantidadeElegivel: 1, pagina: 1, tamanhoPagina: 20, clientes: [{ clienteId: "6d3d0d64-a111-4cff-8db8-111111111113", nome: "Ana Martins", whatsapp: "+5513999999999", elegivel: true, motivoExclusao: null }] } });
    vi.mocked(alterarExclusaoDoPublico).mockResolvedValue({ sucesso: true, simulacao: { quantidadeEncontrada: 1, quantidadeElegivel: 0, pagina: 1, tamanhoPagina: 20, clientes: [{ clienteId: "6d3d0d64-a111-4cff-8db8-111111111113", nome: "Ana Martins", whatsapp: "+5513999999999", elegivel: false, motivoExclusao: "ExcluidoManualmente" }] } });
    render(<DefinicaoPublico acaoId="6d3d0d64-a111-4cff-8db8-111111111111" criterios={criterios} />);
    fireEvent.change(screen.getByLabelText("Cidades"), { target: { value: "Praia Grande" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar filtros e simular público" }));
    const botaoExcluir = await screen.findByRole("button", { name: "Excluir" });
    await waitFor(() => expect(botaoExcluir).toBeEnabled());
    fireEvent.click(botaoExcluir);
    await waitFor(() => expect(screen.getByText("Excluído manualmente")).toBeInTheDocument(), { timeout: 10_000 });
    expect(alterarExclusaoDoPublico).toHaveBeenCalledWith({ acaoId: "6d3d0d64-a111-4cff-8db8-111111111111", clienteId: "6d3d0d64-a111-4cff-8db8-111111111113", excluir: true });
  });
});
