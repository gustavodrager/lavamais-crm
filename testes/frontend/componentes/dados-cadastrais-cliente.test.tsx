import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DadosCadastraisDoCliente } from "../../../src/web/src/app/(autenticado)/clientes/[id]/dados-cadastrais";
import type { DetalheCliente } from "../../../src/web/src/contratos/apresentacao";

const cliente: DetalheCliente = {
  id: "6d3d0d64-a111-4cff-8db8-111111111113",
  nome: "Ana Martins",
  nomeFantasia: "Ana Casa",
  whatsapp: "5513999999999",
  email: "ana@example.com",
  dataNascimento: "1988-05-12",
  tipo: "Residencial",
  situacao: "Ativo",
  permiteWhatsapp: true,
  endereco: {
    logradouro: "Av. Presidente Kennedy",
    numero: "1240",
    complemento: "Apto 42",
    bairro: "Boqueirão",
    cidade: "Praia Grande",
    estado: "SP",
    cep: "11700000",
  },
  etiquetaIds: ["3bf773d6-f28c-4165-92b5-3b1b153a2c32"],
  codigoExterno: "1001",
  dataCadastroOrigem: "2024-02-10T12:00:00Z",
  dataCriacao: "2026-08-15T13:30:00Z",
  dataAtualizacao: "2026-08-29T11:57:16Z",
  localidade: "Boqueirão · Praia Grande",
  quantidadeEtiquetas: 1,
};

describe("DadosCadastraisDoCliente", () => {
  it("mostra contato, endereco completo, cadastro e etiquetas", async () => {
    const usuario = userEvent.setup();
    render(<DadosCadastraisDoCliente cliente={cliente} nomesEtiquetas={["Cliente recorrente"]} />);

    const contato = screen.getByRole("region", { name: "Contato" });
    expect(within(contato).getByRole("link", { name: "+55 (13) 99999-9999" })).toHaveAttribute("href", "https://wa.me/5513999999999");
    expect(within(contato).getByRole("link", { name: "ana@example.com" })).toHaveAttribute("href", "mailto:ana@example.com");
    expect(within(contato).getByText("Autorizado")).toBeVisible();

    const endereco = screen.getByRole("region", { name: "Endereço completo" });
    expect(within(endereco).getByText("Av. Presidente Kennedy, 1240 · Apto 42 · Boqueirão - Praia Grande - SP · 11700-000")).toBeVisible();
    for (const valor of ["Av. Presidente Kennedy", "1240", "Apto 42", "Boqueirão", "Praia Grande", "SP", "11700-000"]) {
      expect(within(endereco).getByText(valor, { exact: true })).toBeVisible();
    }

    await usuario.click(screen.getByText("Informações complementares"));
    const cadastro = screen.getByRole("region", { name: "Cadastro" });
    for (const valor of ["Ana Casa", "Residencial", "12/05/1988", "1001", "10/02/2024 às 09:00", "15/08/2026 às 10:30", "29/08/2026 às 08:57"]) {
      expect(within(cadastro).getByText(valor, { exact: true })).toBeVisible();
    }
    expect(within(screen.getByRole("region", { name: "Etiquetas" })).getByText("Cliente recorrente")).toBeVisible();
  });

  it("explicita quando dados opcionais nao foram informados", () => {
    render(<DadosCadastraisDoCliente cliente={{ ...cliente, nomeFantasia: null, email: null, dataNascimento: null, tipo: null, endereco: null, codigoExterno: null, dataCadastroOrigem: null, etiquetaIds: [], quantidadeEtiquetas: 0 }} nomesEtiquetas={[]} />);
    expect(screen.getByText("Nenhuma etiqueta vinculada.")).toBeVisible();
    expect(within(screen.getByRole("region", { name: "Endereço completo" })).getByText("Incompleto")).toBeVisible();
    expect(screen.getAllByText("Não informado").length).toBeGreaterThan(5);
  });
});
