import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { DefinicaoPublico } from "../../../src/web/src/app/(autenticado)/acoes-comerciais/[id]/definicao-publico";
import { alterarExclusaoDoPublico, salvarESimularPublico } from "../../../src/web/src/app/(autenticado)/acoes-comerciais/[id]/acoes";
import type { SimulacaoDePublico } from "../../../src/web/src/contratos/apresentacao";

vi.mock("../../../src/web/src/app/(autenticado)/acoes-comerciais/[id]/acoes", () => ({ salvarESimularPublico: vi.fn(), alterarExclusaoDoPublico: vi.fn() }));
const criterios = { versaoSchema: 2 as const, modo: "Filtros" as const, tipoCliente: null, cidades: null, bairros: null, etiquetaIds: null, cadastradoApartirDe: null, dataNascimentoDe: null, dataNascimentoAte: null, clienteIds: null, clienteIdsExcluidos: null };
function DefinicaoControlada({ criteriosIniciais = criterios }: { criteriosIniciais?: typeof criterios }) {
  const [simulacao, setSimulacao] = useState<SimulacaoDePublico | null>(null);
  return <DefinicaoPublico acaoId="6d3d0d64-a111-4cff-8db8-111111111111" criterios={criteriosIniciais} simulacao={simulacao} aoSimular={setSimulacao} aoAlterarFiltros={() => setSimulacao(null)} />;
}

describe("DefinicaoPublico", () => {
  it("apresenta um resumo simples e oculta exclusões automáticas", async () => {
    const usuario = userEvent.setup();
    vi.mocked(salvarESimularPublico).mockResolvedValue({ sucesso: true, simulacao: { quantidadeEncontrada: 2, quantidadeElegivel: 1, pagina: 1, tamanhoPagina: 20, clientes: [
      { clienteId: "6d3d0d64-a111-4cff-8db8-111111111113", nome: "Ana Martins", whatsapp: "+5513999999999", elegivel: true, motivoExclusao: null },
      { clienteId: "6d3d0d64-a111-4cff-8db8-111111111114", nome: "Patricia Souza", whatsapp: null, elegivel: false, motivoExclusao: "SemPermissao" },
    ] } });
    render(<DefinicaoControlada />);
    await usuario.click(screen.getByRole("combobox", { name: "Cidade" }));
    await usuario.click(screen.getByRole("option", { name: "Praia Grande" }));
    await usuario.click(screen.getByRole("button", { name: "Ver clientes" }));
    await waitFor(() => expect(screen.getByText("1")).toBeInTheDocument());
    expect(screen.getByText("cliente pode receber a mensagem")).toBeInTheDocument();
    expect(screen.queryByText("Sem permissão")).not.toBeInTheDocument();
  });

  it("permite excluir manualmente um cliente elegível", async () => {
    const usuario = userEvent.setup();
    vi.mocked(salvarESimularPublico).mockResolvedValue({ sucesso: true, simulacao: { quantidadeEncontrada: 1, quantidadeElegivel: 1, pagina: 1, tamanhoPagina: 20, clientes: [{ clienteId: "6d3d0d64-a111-4cff-8db8-111111111113", nome: "Ana Martins", whatsapp: "+5513999999999", elegivel: true, motivoExclusao: null }] } });
    vi.mocked(alterarExclusaoDoPublico).mockResolvedValue({ sucesso: true, simulacao: { quantidadeEncontrada: 1, quantidadeElegivel: 0, pagina: 1, tamanhoPagina: 20, clientes: [{ clienteId: "6d3d0d64-a111-4cff-8db8-111111111113", nome: "Ana Martins", whatsapp: "+5513999999999", elegivel: false, motivoExclusao: "ExcluidoManualmente" }] } });
    render(<DefinicaoControlada criteriosIniciais={{ ...criterios, cidades: ["Praia Grande"] }} />);
    await usuario.click(screen.getByRole("button", { name: "Ver clientes" }));
    await usuario.click(await screen.findByText("Conferir alguns clientes"));
    const botaoExcluir = await screen.findByRole("button", { name: "Não enviar" });
    await waitFor(() => expect(botaoExcluir).toBeEnabled());
    await usuario.click(botaoExcluir);
    await waitFor(() => expect(alterarExclusaoDoPublico).toHaveBeenCalledWith({ acaoId: "6d3d0d64-a111-4cff-8db8-111111111111", clienteId: "6d3d0d64-a111-4cff-8db8-111111111113", excluir: true }));
  });
});
