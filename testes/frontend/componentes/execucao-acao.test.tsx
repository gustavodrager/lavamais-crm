import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExecucaoAcaoWhatsappWeb } from "../../../src/web/src/app/(autenticado)/acoes-comerciais/[id]/execucao-whatsapp-web";
import {
  confirmarEnvioWhatsapp,
  registrarAberturaWhatsapp,
  registrarResultado,
} from "../../../src/web/src/app/(autenticado)/acoes-comerciais/[id]/acoes";
import type { DestinatarioDaAcao } from "../../../src/web/src/contratos/apresentacao";

vi.mock("../../../src/web/src/app/(autenticado)/acoes-comerciais/[id]/acoes", () => ({
  confirmarEnvioWhatsapp: vi.fn(),
  registrarAberturaWhatsapp: vi.fn(),
  registrarResultado: vi.fn(),
}));

describe("ExecucaoAcaoWhatsappWeb", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(registrarAberturaWhatsapp).mockResolvedValue({ sucesso: true });
    vi.mocked(confirmarEnvioWhatsapp).mockResolvedValue({ sucesso: true });
  });

  afterEach(() => vi.restoreAllMocks());

  it("abre a mensagem pronta no WhatsApp oficial sem marcar o envio automaticamente", async () => {
    const usuario = userEvent.setup();
    const janela = criarJanelaAuxiliar();
    const abrir = vi.spyOn(window, "open").mockReturnValue(janela as unknown as Window);
    render(<ExecucaoAcaoWhatsappWeb acaoId={acaoId} situacao="Preparada" destinatarios={[criarDestinatario()]} />);

    await usuario.click(screen.getByRole("button", { name: /Ana Martins/ }));
    await usuario.click(screen.getByRole("button", { name: "Abrir WhatsApp para Ana Martins" }));

    expect(abrir).toHaveBeenCalledWith("", "lavamais-whatsapp-web", expect.stringContaining("popup=yes"));
    expect(janela.location.href).toBe("https://wa.me/5513999999999?text=Ol%C3%A1%2C%20Ana!%20Conhe%C3%A7a%20a%20lavagem%20de%20edredom.");
    await waitFor(() => expect(registrarAberturaWhatsapp).toHaveBeenCalledWith({ acaoId, destinatarioId, versao: 1 }));
    expect(confirmarEnvioWhatsapp).not.toHaveBeenCalled();
    expect(screen.getByText("Conversa aberta")).toBeInTheDocument();
  });

  it("só confirma o envio depois da declaração explícita da pessoa operadora", async () => {
    const usuario = userEvent.setup();
    vi.spyOn(window, "open").mockReturnValue(criarJanelaAuxiliar() as unknown as Window);
    render(<ExecucaoAcaoWhatsappWeb acaoId={acaoId} situacao="Preparada" modoOperador destinatarios={[criarDestinatario()]} />);

    await usuario.click(screen.getByRole("button", { name: "Abrir WhatsApp para Ana Martins" }));
    await usuario.click(screen.getByRole("button", { name: "Confirmar que enviei" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent("O CRM não consegue verificar o clique no WhatsApp");
    expect(confirmarEnvioWhatsapp).not.toHaveBeenCalled();

    await usuario.click(screen.getByRole("button", { name: "Sim, eu enviei" }));
    await waitFor(() => expect(confirmarEnvioWhatsapp).toHaveBeenCalledWith({ acaoId, destinatarioId, versao: 1 }));
    expect(screen.getByText("Envio confirmado")).toBeInTheDocument();
  });

  it("oferece uma nova aba quando o navegador bloqueia a janela auxiliar", async () => {
    const usuario = userEvent.setup();
    vi.spyOn(window, "open").mockReturnValue(null);
    render(<ExecucaoAcaoWhatsappWeb acaoId={acaoId} situacao="Preparada" destinatarios={[criarDestinatario()]} />);

    await usuario.click(screen.getByRole("button", { name: /Ana Martins/ }));
    await usuario.click(screen.getByRole("button", { name: "Abrir WhatsApp para Ana Martins" }));

    const alternativa = screen.getByRole("link", { name: "Abrir WhatsApp em nova aba" });
    expect(alternativa).toHaveAttribute("href", expect.stringMatching(/^https:\/\/wa\.me\/5513999999999\?text=/));
    expect(alternativa).toHaveAttribute("target", "_blank");
    expect(registrarAberturaWhatsapp).not.toHaveBeenCalled();
  });

  it("oferece o resultado comercial somente depois do envio confirmado", () => {
    const { rerender } = render(<ExecucaoAcaoWhatsappWeb acaoId={acaoId} situacao="EmProcessamento" modoOperador destinatarios={[criarDestinatario()]} />);
    expect(screen.queryByRole("combobox", { name: "Resultado de Ana Martins" })).not.toBeInTheDocument();

    rerender(<ExecucaoAcaoWhatsappWeb acaoId={acaoId} situacao="Concluida" modoOperador destinatarios={[criarDestinatario({ situacaoEnvio: "Enviado", dataEnvioConfirmado: "2026-09-02T17:00:00Z" })]} />);
    expect(screen.getByRole("combobox", { name: "Resultado de Ana Martins" })).toBeInTheDocument();
    expect(screen.getByText(/Envio confirmado manualmente/)).toBeVisible();
  });

  it("distingue um envio migrado do historico de uma confirmacao manual", () => {
    render(<ExecucaoAcaoWhatsappWeb acaoId={acaoId} situacao="Concluida" modoOperador destinatarios={[criarDestinatario({ situacaoEnvio: "Enviado", dataEnvioConfirmado: null })]} />);

    expect(screen.getByText("Envio anterior preservado no histórico, sem confirmação manual deste fluxo.")).toBeVisible();
  });

  it("limpa o resultado escolhido ao trocar de destinatário", async () => {
    const usuario = userEvent.setup();
    vi.mocked(registrarResultado).mockResolvedValue({ sucesso: true });
    render(<ExecucaoAcaoWhatsappWeb acaoId={acaoId} situacao="Concluida" modoOperador destinatarios={[
      criarDestinatario({ situacaoEnvio: "Enviado", dataEnvioConfirmado: "2026-09-02T17:00:00Z" }),
      criarDestinatario({
        id: "6d3d0d64-a111-4cff-8db8-111111111119",
        clienteId: "6d3d0d64-a111-4cff-8db8-111111111114",
        nomeCliente: "Beatriz Lima",
        conteudoPreVisualizacao: "Olá, Beatriz!",
        situacaoEnvio: "Enviado",
        dataEnvioConfirmado: "2026-09-02T17:01:00Z",
      }),
    ]} />);

    const resultadoAna = screen.getByRole("combobox", { name: "Resultado de Ana Martins" });
    await usuario.click(resultadoAna);
    await usuario.click(screen.getByRole("option", { name: "Interessado" }));
    expect(resultadoAna).toHaveTextContent("Interessado");

    await usuario.click(screen.getByRole("button", { name: /Beatriz Lima/ }));
    expect(screen.getByRole("combobox", { name: "Resultado de Beatriz Lima" })).toHaveTextContent("Selecione o resultado");
  });
});

const acaoId = "6d3d0d64-a111-4cff-8db8-111111111111";
const destinatarioId = "6d3d0d64-a111-4cff-8db8-111111111118";

function criarDestinatario(sobrescritas: Partial<DestinatarioDaAcao> = {}): DestinatarioDaAcao {
  return {
    id: destinatarioId,
    clienteId: "6d3d0d64-a111-4cff-8db8-111111111113",
    nomeCliente: "Ana Martins",
    destino: "+55 (13) 99999-9999",
    conteudoPreVisualizacao: "Olá, Ana! Conheça a lavagem de edredom.",
    situacaoEnvio: "Pendente",
    dataEnvioConfirmado: null,
    resultadoComercial: "NaoInformado",
    valorConvertido: null,
    dataResultadoComercial: null,
    versao: 1,
    ...sobrescritas,
  };
}

function criarJanelaAuxiliar() {
  return {
    opener: {} as Window | null,
    location: { href: "" },
    focus: vi.fn(),
  };
}
