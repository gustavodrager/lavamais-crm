import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ResultadoDestinatario } from "../../../src/web/src/app/(autenticado)/acoes-comerciais/[id]/resultado-destinatario";
import { registrarResultado } from "../../../src/web/src/app/(autenticado)/acoes-comerciais/[id]/acoes";

vi.mock("../../../src/web/src/app/(autenticado)/acoes-comerciais/[id]/acoes", () => ({ registrarResultado: vi.fn() }));
const destinatario = { id: "6d3d0d64-a111-4cff-8db8-111111111118", clienteId: "6d3d0d64-a111-4cff-8db8-111111111113", nomeCliente: "Ana Martins", destino: "+5513999999999", conteudoPreVisualizacao: "Olá!", situacaoEnvio: "Entregue" as const, resultadoComercial: "Convertido" as const, valorConvertido: null, dataResultadoComercial: null, codigoFalha: null, versao: 1 };

describe("ResultadoDestinatario", () => {
  it("solicita valor somente para conversão e confirma o salvamento", async () => {
    vi.mocked(registrarResultado).mockResolvedValue({ sucesso: true });
    render(<ResultadoDestinatario acaoId="6d3d0d64-a111-4cff-8db8-111111111111" destinatario={destinatario} />);
    expect(screen.getByLabelText("Valor convertido de Ana Martins")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Valor convertido de Ana Martins"), { target: { value: "149,90" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar resultado" }));
    await waitFor(() => expect(screen.getByText("Resultado salvo.")).toBeInTheDocument());
    expect(registrarResultado).toHaveBeenCalledWith(expect.objectContaining({ resultado: "Convertido", valorConvertido: "149,90" }));
  });
});
