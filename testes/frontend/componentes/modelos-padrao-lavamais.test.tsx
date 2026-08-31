import { fireEvent, render, screen } from "@testing-library/react";
import { BibliotecaMensagens } from "../../../src/web/src/app/(autenticado)/acoes-comerciais/biblioteca-mensagens";
import { modelosPadraoLavaMais } from "../../../src/web/src/conteudo/modelos-padrao-lavamais";

vi.mock("../../../src/web/src/app/(autenticado)/acoes-comerciais/acoes-mensagens", () => ({
  aprovarEDisponibilizarMensagem: vi.fn(),
}));

describe("biblioteca de mensagens da LavaMais", () => {
  it("mantém uma biblioteca enxuta com as variáveis comerciais permitidas", () => {
    expect(modelosPadraoLavaMais).toHaveLength(6);
    for (const modelo of modelosPadraoLavaMais) {
      expect(modelo.conteudoPreVisualizacao).toContain("{{nomeCliente}}");
      expect(modelo.conteudoPreVisualizacao).not.toContain("{{itemCatalogo}}");
    }
  });

  it("permite ao gestor revisar uma sugestão sem expor a chave técnica", () => {
    render(<BibliotecaMensagens modelos={[]} podeGerenciar />);

    fireEvent.click(screen.getByRole("button", { name: "Nova mensagem" }));
    fireEvent.click(screen.getByRole("button", { name: /Coleta e entrega LavaMais/ }));

    expect(screen.getByLabelText("Nome da mensagem")).toHaveValue("Coleta e entrega LavaMais");
    expect(screen.getByLabelText("Texto aprovado")).toHaveValue(modelosPadraoLavaMais[0].conteudoPreVisualizacao);
    expect(screen.queryByLabelText(/Chave técnica/)).not.toBeInTheDocument();
  });

  it("oferece ao gerente a mesma gestão da biblioteca disponível ao administrador", () => {
    render(<BibliotecaMensagens modelos={[{
      modeloId: "6d3d0d64-a111-4cff-8db8-111111111115",
      versaoId: "6d3d0d64-a111-4cff-8db8-111111111116",
      nome: "Oferta de serviço",
      numeroVersao: 2,
      canal: "Whatsapp",
      conteudoPreVisualizacao: "Olá, {{nomeCliente}}! Conheça {{itemCatalogo}}.",
      variaveis: ["nomeCliente", "itemCatalogo"],
    }]} podeGerenciar />);

    expect(screen.getByText("Oferta de serviço")).toBeInTheDocument();
    expect(screen.getByText("WhatsApp · versão 2")).toBeInTheDocument();
    expect(screen.getByText(/Olá, \[nome do cliente\]/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nova mensagem" })).toBeInTheDocument();
  });
});
