import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { DefinicaoPublico } from "../../../src/web/src/app/(autenticado)/acoes-comerciais/[id]/definicao-publico";
import { alterarExclusaoDoPublico, buscarClientesParaLista, montarListaRapida, salvarListaManual } from "../../../src/web/src/app/(autenticado)/acoes-comerciais/[id]/acoes";
import type { SimulacaoDePublico } from "../../../src/web/src/contratos/apresentacao";

vi.mock("../../../src/web/src/app/(autenticado)/acoes-comerciais/[id]/acoes", () => ({ montarListaRapida: vi.fn(), buscarClientesParaLista: vi.fn(), salvarListaManual: vi.fn(), alterarExclusaoDoPublico: vi.fn() }));
const criterios = { versaoSchema: 2 as const, modo: "Filtros" as const, tipoCliente: null, cidades: null, bairros: null, etiquetaIds: null, cadastradoApartirDe: null, dataNascimentoDe: null, dataNascimentoAte: null, clienteIds: null, clienteIdsExcluidos: null };
const simulacao: SimulacaoDePublico = { quantidadeEncontrada: 2, quantidadeElegivel: 2, pagina: 1, tamanhoPagina: 10, clientes: [
  { clienteId: "6d3d0d64-a111-4cff-8db8-111111111113", nome: "Ana Martins", whatsapp: "+5513999999999", elegivel: true, motivoExclusao: null },
  { clienteId: "6d3d0d64-a111-4cff-8db8-111111111114", nome: "Patricia Souza", whatsapp: "+5513988888888", elegivel: true, motivoExclusao: null },
] };

function DefinicaoControlada() {
  const [publico, setPublico] = useState<SimulacaoDePublico | null>(null);
  return <DefinicaoPublico acaoId="6d3d0d64-a111-4cff-8db8-111111111111" criterios={criterios} simulacao={publico} aoSimular={setPublico} aoAlterarFiltros={() => setPublico(null)} />;
}

describe("DefinicaoPublico", () => {
  beforeEach(() => vi.clearAllMocks());

  it("monta uma lista curta sem abrir filtros de região", async () => {
    const usuario = userEvent.setup();
    vi.mocked(montarListaRapida).mockResolvedValue({ sucesso: true, simulacao });
    render(<DefinicaoControlada />);
    expect(screen.queryByRole("combobox", { name: "Cidade" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Escolher por região/ })).not.toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: /Trazer 10 clientes/ }));
    await waitFor(() => expect(screen.getByText("Sua lista está pronta")).toBeInTheDocument());
    expect(screen.getByText("Ana Martins")).toBeInTheDocument();
    expect(screen.getByText(/confirmará uma cliente por vez/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Trazer 10 clientes/ })).not.toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: "Alterar escolha" }));
    expect(screen.getByRole("button", { name: /Trazer 10 clientes/ })).toBeInTheDocument();
  });

  it("permite buscar e confirmar uma escolha manual", async () => {
    const usuario = userEvent.setup();
    vi.mocked(buscarClientesParaLista).mockResolvedValue({ sucesso: true, clientes: [{ id: "6d3d0d64-a111-4cff-8db8-111111111113", nome: "Ana Martins", whatsapp: "+5513999999999", localidade: "Praia Grande", quantidadeEtiquetas: 0, permiteWhatsapp: true, situacao: "Ativo", codigoExterno: null }] });
    vi.mocked(salvarListaManual).mockResolvedValue({ sucesso: true, simulacao: { ...simulacao, quantidadeEncontrada: 1, quantidadeElegivel: 1, clientes: [simulacao.clientes[0]] } });
    render(<DefinicaoControlada />);
    await usuario.click(screen.getByRole("button", { name: /Escolher pelo nome/ }));
    await usuario.type(screen.getByRole("textbox", { name: "Buscar cliente por nome ou WhatsApp" }), "Ana");
    await usuario.click(screen.getByRole("button", { name: "Buscar" }));
    await usuario.click(await screen.findByRole("button", { name: /Adicionar Ana Martins/ }));
    await usuario.click(screen.getByRole("button", { name: "Confirmar 1 cliente" }));
    await waitFor(() => expect(salvarListaManual).toHaveBeenCalledWith({ acaoId: "6d3d0d64-a111-4cff-8db8-111111111111", clienteIds: ["6d3d0d64-a111-4cff-8db8-111111111113"] }));
    expect(screen.getByRole("button", { name: "Alterar escolha" })).toBeInTheDocument();
  });

  it("permite retirar uma cliente da fila", async () => {
    const usuario = userEvent.setup();
    vi.mocked(montarListaRapida).mockResolvedValue({ sucesso: true, simulacao });
    vi.mocked(alterarExclusaoDoPublico).mockResolvedValue({ sucesso: true, simulacao: { ...simulacao, quantidadeElegivel: 1, clientes: [{ ...simulacao.clientes[0], elegivel: false, motivoExclusao: "ExcluidoManualmente" }, simulacao.clientes[1]] } });
    render(<DefinicaoControlada />);
    await usuario.click(screen.getByRole("button", { name: /Trazer 10 clientes/ }));
    await usuario.click(await screen.findByRole("button", { name: "Retirar Ana Martins da lista" }));
    await waitFor(() => expect(alterarExclusaoDoPublico).toHaveBeenCalledWith({ acaoId: "6d3d0d64-a111-4cff-8db8-111111111111", clienteId: "6d3d0d64-a111-4cff-8db8-111111111113", excluir: true }));
  });
});
