import { fireEvent, render, screen, within } from "@testing-library/react";
import { FormulariosConfiguracao } from "../../../src/web/src/app/(autenticado)/configuracoes/formularios-configuracao";
import { modelosPadraoLavaMais } from "../../../src/web/src/conteudo/modelos-padrao-lavamais";

vi.mock("../../../src/web/src/app/(autenticado)/configuracoes/acoes", () => ({
  criarEtiqueta: vi.fn(),
  criarModelo: vi.fn(),
  criarServico: vi.fn(),
}));

describe("modelos padrão da LavaMais", () => {
  it("mantém uma biblioteca enxuta com as variáveis comerciais permitidas", () => {
    expect(modelosPadraoLavaMais).toHaveLength(6);
    for (const modelo of modelosPadraoLavaMais) {
      expect(modelo.conteudoPreVisualizacao).toContain("{{nomeCliente}}");
      expect(modelo.conteudoPreVisualizacao).toContain("{{itemCatalogo}}");
    }
  });

  it("preenche o formulário ao escolher uma sugestão", () => {
    render(<FormulariosConfiguracao itens={[]} etiquetas={[]} modelos={[]} />);
    const formularioModelos = screen.getByText("Modelos de mensagem").closest("[data-slot=card]");
    expect(formularioModelos).not.toBeNull();
    const escopo = within(formularioModelos as HTMLElement);

    fireEvent.click(escopo.getByRole("button", { name: /Coleta e entrega LavaMais/ }));

    expect(escopo.getByLabelText("Nome")).toHaveValue("Coleta e entrega LavaMais");
    expect(escopo.getByLabelText("Pré-visualização")).toHaveValue(modelosPadraoLavaMais[0].conteudoPreVisualizacao);
    expect(escopo.getByLabelText("Chave aprovada na Central de Notificação")).toHaveValue("");
  });
});
