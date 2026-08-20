import { render, screen } from "@testing-library/react";
import { ExecucaoAcao } from "../../../src/web/src/app/(autenticado)/acoes-comerciais/[id]/execucao";

vi.mock("../../../src/web/src/app/(autenticado)/acoes-comerciais/[id]/acoes", () => ({ iniciarAcao: vi.fn() }));

describe("ExecucaoAcao", () => {
  it("apresenta destinatários, falhas técnicas e o comando de início", () => {
    render(<ExecucaoAcao acaoId="6d3d0d64-a111-4cff-8db8-111111111111" versao={2} situacao="Preparada" destinatarios={[{
      id: "6d3d0d64-a111-4cff-8db8-111111111118", clienteId: "6d3d0d64-a111-4cff-8db8-111111111113", nomeCliente: "Ana Martins", destino: "+5513999999999", conteudoPreVisualizacao: "Olá!", situacaoEnvio: "Falhou", resultadoComercial: "NaoInformado", valorConvertido: null, dataResultadoComercial: null, codigoFalha: "destino_invalido", versao: 1,
    }]} />);
    expect(screen.getByRole("button", { name: /Iniciar processamento/ })).toBeEnabled();
    expect(screen.getByText("Ana Martins")).toBeInTheDocument();
    expect(screen.getByText("Código: destino_invalido")).toBeInTheDocument();
  });
});
