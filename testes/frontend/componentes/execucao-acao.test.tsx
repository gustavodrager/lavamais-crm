import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExecucaoAcao } from "../../../src/web/src/app/(autenticado)/acoes-comerciais/[id]/execucao";
import { enviarMensagemIndividual, registrarResultado } from "../../../src/web/src/app/(autenticado)/acoes-comerciais/[id]/acoes";

vi.mock("../../../src/web/src/app/(autenticado)/acoes-comerciais/[id]/acoes", () => ({ enviarMensagemIndividual: vi.fn(), registrarResultado: vi.fn() }));

describe("ExecucaoAcao", () => {
  beforeEach(() => vi.clearAllMocks());

  it("exige seleção, prévia e confirmação para enviar somente um destinatário", async () => {
    const usuario = userEvent.setup();
    vi.mocked(enviarMensagemIndividual).mockResolvedValue({ sucesso: true });
    render(<ExecucaoAcao acaoId="6d3d0d64-a111-4cff-8db8-111111111111" situacao="Preparada" destinatarios={[{
      id: "6d3d0d64-a111-4cff-8db8-111111111118", clienteId: "6d3d0d64-a111-4cff-8db8-111111111113", nomeCliente: "Ana Martins", destino: "+5513999999999", conteudoPreVisualizacao: "Olá, Ana! Conheça a lavagem de edredom.", situacaoEnvio: "Pendente", resultadoComercial: "NaoInformado", valorConvertido: null, dataResultadoComercial: null, codigoFalha: null, versao: 1,
    }]} />);
    expect(screen.queryByRole("button", { name: /Iniciar processamento/ })).not.toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: /Ana Martins/ }));
    expect(screen.getByText("Olá, Ana! Conheça a lavagem de edredom.")).toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: "Enviar mensagem para Ana Martins" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent("Será solicitada somente esta mensagem");
    await usuario.click(screen.getByRole("button", { name: "Confirmar envio" }));
    await waitFor(() => expect(enviarMensagemIndividual).toHaveBeenCalledWith({ acaoId: "6d3d0d64-a111-4cff-8db8-111111111111", destinatarioId: "6d3d0d64-a111-4cff-8db8-111111111118", versao: 1 }));
    expect(screen.getByText(/encaminhada para processamento/)).toBeInTheDocument();
  });

  it("permite revisar sem oferecer envio quando o canal esta desabilitado", async () => {
    const usuario = userEvent.setup();
    render(<ExecucaoAcao acaoId="6d3d0d64-a111-4cff-8db8-111111111111" situacao="Preparada" envioHabilitado={false} destinatarios={[{
      id: "6d3d0d64-a111-4cff-8db8-111111111118", clienteId: "6d3d0d64-a111-4cff-8db8-111111111113", nomeCliente: "Ana Martins", destino: "+5513999999999", conteudoPreVisualizacao: "Olá, Ana! Conheça a lavagem de edredom.", situacaoEnvio: "Pendente", resultadoComercial: "NaoInformado", valorConvertido: null, dataResultadoComercial: null, codigoFalha: null, versao: 1,
    }]} />);

    expect(screen.getByText("Envio ainda não habilitado")).toBeInTheDocument();
    expect(screen.getByText(/canal de WhatsApp estiver configurado/)).toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: /Ana Martins/ }));
    expect(screen.getByText("Olá, Ana! Conheça a lavagem de edredom.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Enviar mensagem para Ana Martins" })).not.toBeInTheDocument();
    expect(enviarMensagemIndividual).not.toHaveBeenCalled();
  });

  it("abre automaticamente o primeiro destinatario pendente no modo operador", async () => {
    const usuario = userEvent.setup();
    vi.mocked(enviarMensagemIndividual).mockResolvedValue({ sucesso: true });
    render(<ExecucaoAcao acaoId="6d3d0d64-a111-4cff-8db8-111111111111" situacao="Preparada" modoOperador destinatarios={[{
      id: "6d3d0d64-a111-4cff-8db8-111111111118", clienteId: "6d3d0d64-a111-4cff-8db8-111111111113", nomeCliente: "Ana Martins", destino: "+5513999999999", conteudoPreVisualizacao: "Olá, Ana! Conheça a lavagem de edredom.", situacaoEnvio: "Pendente", resultadoComercial: "NaoInformado", valorConvertido: null, dataResultadoComercial: null, codigoFalha: null, versao: 1,
    }]} />);

    expect(screen.getByText("Fila de atendimento")).toBeInTheDocument();
    expect(screen.getByText("Olá, Ana! Conheça a lavagem de edredom.")).toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: "Enviar mensagem para Ana Martins" }));
    await usuario.click(screen.getByRole("button", { name: "Confirmar envio" }));
    await waitFor(() => expect(enviarMensagemIndividual).toHaveBeenCalledWith({ acaoId: "6d3d0d64-a111-4cff-8db8-111111111111", destinatarioId: "6d3d0d64-a111-4cff-8db8-111111111118", versao: 1 }));
    expect(screen.getByText("Mensagem solicitada")).toBeInTheDocument();
  });

  it("limpa o resultado escolhido ao trocar de destinatario", async () => {
    const usuario = userEvent.setup();
    vi.mocked(registrarResultado).mockResolvedValue({ sucesso: true });
    const base = { clienteId: "6d3d0d64-a111-4cff-8db8-111111111113", destino: "+5513999999999", situacaoEnvio: "Entregue" as const, resultadoComercial: "NaoInformado" as const, valorConvertido: null, dataResultadoComercial: null, codigoFalha: null, versao: 1 };
    render(<ExecucaoAcao acaoId="6d3d0d64-a111-4cff-8db8-111111111111" situacao="EmProcessamento" modoOperador destinatarios={[
      { ...base, id: "6d3d0d64-a111-4cff-8db8-111111111118", nomeCliente: "Ana Martins", conteudoPreVisualizacao: "Olá, Ana!" },
      { ...base, id: "6d3d0d64-a111-4cff-8db8-111111111119", clienteId: "6d3d0d64-a111-4cff-8db8-111111111114", nomeCliente: "Beatriz Lima", conteudoPreVisualizacao: "Olá, Beatriz!" },
    ]} />);

    const resultadoAna = screen.getByRole("combobox", { name: "Resultado de Ana Martins" });
    await usuario.click(resultadoAna);
    await usuario.click(screen.getByRole("option", { name: "Interessado" }));
    expect(resultadoAna).toHaveTextContent("Interessado");

    await usuario.click(screen.getByRole("button", { name: /Beatriz Lima/ }));
    expect(screen.getByRole("combobox", { name: "Resultado de Beatriz Lima" })).toHaveTextContent("Selecione o resultado");
  });
});
