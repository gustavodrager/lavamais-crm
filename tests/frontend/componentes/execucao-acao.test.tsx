import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExecucaoAcao } from "../../../src/web/src/app/(autenticado)/acoes-comerciais/[id]/execucao";
import { enviarMensagemIndividual } from "../../../src/web/src/app/(autenticado)/acoes-comerciais/[id]/acoes";

vi.mock("../../../src/web/src/app/(autenticado)/acoes-comerciais/[id]/acoes", () => ({ enviarMensagemIndividual: vi.fn() }));

describe("ExecucaoAcao", () => {
  it("exige seleção, prévia e confirmação para enviar somente um destinatário", async () => {
    const usuario = userEvent.setup();
    vi.mocked(enviarMensagemIndividual).mockResolvedValue({ sucesso: true });
    render(<ExecucaoAcao acaoId="6d3d0d64-a111-4cff-8db8-111111111111" situacao="Preparada" destinatarios={[{
      id: "6d3d0d64-a111-4cff-8db8-111111111118", clienteId: "6d3d0d64-a111-4cff-8db8-111111111113", nomeCliente: "Ana Martins", destino: "+5513999999999", conteudoPreVisualizacao: "Olá, Ana! Conheça a lavagem de edredom.", situacaoEnvio: "Pendente", resultadoComercial: "NaoInformado", valorConvertido: null, dataResultadoComercial: null, codigoFalha: null, versao: 1,
    }]} />);
    expect(screen.queryByRole("button", { name: /Iniciar processamento/ })).not.toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: "Conferir mensagem" }));
    expect(screen.getByText("Olá, Ana! Conheça a lavagem de edredom.")).toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: "Enviar esta mensagem" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent("Será solicitada somente esta mensagem");
    await usuario.click(screen.getByRole("button", { name: "Confirmar envio" }));
    await waitFor(() => expect(enviarMensagemIndividual).toHaveBeenCalledWith({ acaoId: "6d3d0d64-a111-4cff-8db8-111111111111", destinatarioId: "6d3d0d64-a111-4cff-8db8-111111111118", versao: 1 }));
    expect(screen.getByText(/encaminhada para processamento/)).toBeInTheDocument();
  });
});
