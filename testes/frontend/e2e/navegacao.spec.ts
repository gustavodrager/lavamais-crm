import { expect, test } from "../../../src/web/node_modules/@playwright/test";

test.beforeEach(async ({ context, page }) => {
  await context.addCookies([{ name: "lavamais-sessao-teste", value: "sessao-controlada-e2e", url: "http://127.0.0.1:3000", httpOnly: true, sameSite: "Lax" }]);
  await page.goto("/acoes-comerciais");
});

test("lista e abre uma Ação Comercial obtida da CRM API", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Ações Comerciais" })).toBeVisible();
  await page.getByRole("link", { name: "Ação integrada de edredons" }).click();
  await expect(page).toHaveURL(/\/acoes-comerciais\/6d3d0d64-a111-4cff-8db8-111111111111$/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Ação integrada de edredons" })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("progressbar", { name: "Progresso técnico: 83%" })).toBeVisible();
  await expect(page.getByText("R$ 150,00")).toBeVisible();
});

test("cria, simula e prepara uma ação com modelo publicado", async ({ page }) => {
  await page.goto("/acoes-comerciais/nova");
  await expect(page.getByLabel("Nome da ação")).toBeVisible();
  await page.getByLabel("Nome da ação").fill("Ação criada pelo frontend");
  await page.getByLabel("Objetivo").fill("Validar a criação integrada do rascunho");
  await page.getByRole("combobox", { name: "Item do catálogo" }).click();
  await page.getByRole("option", { name: "Lavagem de edredom · Casa" }).click();
  await page.getByRole("button", { name: "Criar e escolher clientes" }).click();
  await expect(page).toHaveURL(/\/acoes-comerciais\/7e4e1e75-b222-4cff-8db8-222222222222$/);
  await expect(page.getByRole("heading", { name: "Ação criada pelo frontend" })).toBeVisible();
  await page.getByRole("button", { name: /Trazer 10 clientes/ }).click();
  await expect(page.getByText("Sua lista está pronta")).toBeVisible();
  await page.getByRole("button", { name: "Escolher a mensagem" }).click();
  await page.getByRole("radio", { name: /Oferta de serviço/ }).click();
  await expect(page.getByText("Olá, Ana Martins! Conheça Lavagem de edredom.")).toBeVisible();
  await page.getByRole("button", { name: "Confirmar clientes e mensagem" }).click();
  await expect(page.getByRole("alertdialog")).toContainText("Esta ação ficará pronta com 1 cliente");
  await page.getByRole("button", { name: "Sim, começar os atendimentos" }).click();
  await expect(page.getByText("Preparada", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Ana Martins/ }).click();
  await expect(page.getByText("Olá, Ana Martins!")).toBeVisible();
  await page.getByRole("button", { name: "Enviar mensagem para Ana Martins" }).click();
  await expect(page.getByRole("alertdialog")).toContainText("Será solicitada somente esta mensagem");
  await page.getByRole("button", { name: "Confirmar envio" }).click();
  await expect(page.getByText("Em processamento", { exact: true })).toBeVisible();
  await expect(page.getByText("Mensagem solicitada", { exact: true })).toBeVisible();
});

test("oferece acesso às demais areas pelo menu principal", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "O menu compacto possui fluxo dedicado");
  await page.goto("/acoes-comerciais");
  await page.getByRole("link", { name: "Clientes" }).click();
  await expect(page.getByRole("heading", { name: "Clientes" })).toBeVisible();
  await page.getByRole("link", { name: "Importação" }).click();
  await expect(page.getByRole("heading", { name: "Importação de clientes" })).toBeVisible();
  await page.getByRole("link", { name: "Configurações" }).click();
  await expect(page.getByRole("heading", { name: "Configurações" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Canal de mensagens" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Catálogo" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Etiquetas" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Mensagens aprovadas" })).toHaveCount(0);
});

test("oferece ao gerente a mesma gestão de mensagens do administrador", async ({ page }) => {
  await page.goto("/acoes-comerciais?visao=mensagens");
  await expect(page.getByRole("heading", { name: "Ações Comerciais" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Mensagens aprovadas" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { name: "Mensagens aprovadas" })).toBeVisible();
  await expect(page.getByText("Oferta de serviço")).toBeVisible();
  await expect(page.getByText("WhatsApp · versão 1")).toBeVisible();
  await page.getByRole("button", { name: "Nova mensagem" }).click();
  await expect(page.getByRole("heading", { name: "Aprovar nova mensagem" })).toBeVisible();
  await page.getByRole("button", { name: /Coleta e entrega LavaMais/ }).click();
  await expect(page.getByLabel("Nome da mensagem")).toHaveValue("Coleta e entrega LavaMais");
  await expect(page.getByLabel("Texto aprovado")).toHaveValue(/{{nomeCliente}}/);
});

test("permite ao administrador iniciar a aprovação de uma mensagem", async ({ context, page }) => {
  await context.addCookies([{ name: "lavamais-sessao-teste", value: "sessao-controlada-admin-e2e", url: "http://127.0.0.1:3000", httpOnly: true, sameSite: "Lax" }]);
  await page.goto("/acoes-comerciais?visao=mensagens");
  await page.getByRole("button", { name: "Nova mensagem" }).click();
  await expect(page.getByRole("heading", { name: "Aprovar nova mensagem" })).toBeVisible();
  await page.getByRole("button", { name: /Coleta e entrega LavaMais/ }).click();
  await expect(page.getByLabel("Nome da mensagem")).toHaveValue("Coleta e entrega LavaMais");
  await expect(page.getByLabel("Texto aprovado")).toHaveValue(/{{nomeCliente}}/);
  await expect(page.getByLabel(/Chave técnica/)).toHaveCount(0);
});

test("resume pendências e resultados relevantes no painel gerencial", async ({ page }) => {
  await page.goto("/inicio");
  await expect(page.getByRole("heading", { name: "Olá! O que precisa ser feito agora?" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Falhas para revisar: 2" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Retornos para registrar: 4" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Resultados registrados: 6" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Valor convertido informado: R$ 150,00" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Operação de hoje" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Roteiro de hoje" })).toBeVisible();
  await expect(page.getByText("Motorista: Carlos")).toBeVisible();
  await expect(page.getByText("1 registro", { exact: true })).toBeVisible();
  await expect(page.getByText("1 registro cancelado", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Amanhã: Em preparação · 2 paradas" })).toBeVisible();
});

test("mostra o painel operacional para a recepção", async ({ context, page }) => {
  await context.addCookies([{ name: "lavamais-sessao-teste", value: "sessao-controlada-operador-e2e", url: "http://127.0.0.1:3000", httpOnly: true, sameSite: "Lax" }]);
  await page.goto("/inicio");
  await expect(page.getByRole("heading", { name: "Atendimento da recepção" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Importação" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Registrar movimentação" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Registrar retornos comerciais" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Buscar cliente" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Novo cliente" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Movimentação", exact: true })).toBeVisible();
  await expect(page.getByText("Movimentações registradas hoje")).toBeVisible();
  await expect(page.getByText("Valor informado")).toBeVisible();
  await expect(page.getByText("1 registro cancelado", { exact: true })).toBeVisible();
});

test("operador visualiza telefone e detalhes dos clientes", async ({ context, page }, testInfo) => {
  const telefone = "+55 (13) 99999-9999";
  await context.addCookies([{ name: "lavamais-sessao-teste", value: "sessao-controlada-operador-e2e", url: "http://127.0.0.1:3000", httpOnly: true, sameSite: "Lax" }]);
  await page.goto("/clientes");
  await expect(page.getByRole("heading", { name: "Clientes" })).toBeVisible();
  if (testInfo.project.name === "desktop") {
    const linhaCliente = page.getByRole("row").filter({ hasText: "Ana Martins" });
    await expect(linhaCliente.getByRole("cell", { name: telefone })).toBeVisible();
    await linhaCliente.getByRole("link", { name: /Ana Martins/ }).click();
  } else {
    const cartaoCliente = page.getByRole("link", { name: /Ana Martins/ }).first();
    await expect(cartaoCliente.getByText(telefone)).toBeVisible();
    await cartaoCliente.click();
  }
  await expect(page.getByRole("heading", { name: "Ana Martins" })).toBeVisible();
  const contato = page.getByRole("region", { name: "Contato" });
  await expect(contato.getByRole("link", { name: telefone })).toBeVisible();
  await expect(contato.getByRole("link", { name: "ana@example.com" })).toBeVisible();
  await expect(contato.getByText("Autorizado", { exact: true })).toBeVisible();

  const endereco = page.getByRole("region", { name: "Endereço completo" });
  await expect(endereco.getByText("Av. Presidente Kennedy", { exact: true })).toBeVisible();
  await expect(endereco.getByText("1240", { exact: true })).toBeVisible();
  await expect(endereco.getByText("Apto 42", { exact: true })).toBeVisible();
  await expect(endereco.getByText("Boqueirão", { exact: true })).toBeVisible();
  await expect(endereco.getByText("Praia Grande", { exact: true })).toBeVisible();
  await expect(endereco.getByText("SP", { exact: true })).toBeVisible();
  await expect(endereco.getByText("11700-000", { exact: true })).toBeVisible();

  const cadastro = page.getByRole("region", { name: "Cadastro" });
  await expect(cadastro.getByText("Ana Casa", { exact: true })).toBeVisible();
  await expect(cadastro.getByText("Residencial", { exact: true })).toBeVisible();
  await expect(cadastro.getByText("12/05/1988", { exact: true })).toBeVisible();
  await expect(cadastro.getByText("1001", { exact: true })).toBeVisible();
  await expect(cadastro.getByText("15/08/2026 às 10:30", { exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "Etiquetas" }).getByText("Cliente recorrente")).toBeVisible();
});

test("mostra ações comerciais como fila para o operador", async ({ context, page }) => {
  await context.addCookies([{ name: "lavamais-sessao-teste", value: "sessao-controlada-operador-e2e", url: "http://127.0.0.1:3000", httpOnly: true, sameSite: "Lax" }]);
  await page.goto("/acoes-comerciais?visao=mensagens");
  await expect(page).toHaveURL(/\/acoes-comerciais$/);
  await expect(page.getByRole("heading", { name: "Fila de mensagens" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Mensagens aprovadas" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Nova ação comercial" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Para enviar" })).toBeVisible();
  await page.getByRole("link", { name: /Abrir fila: Ação integrada de edredons/ }).click();
  await expect(page.getByText("Fila de atendimento")).toBeVisible();
  await expect(page.getByText("Olá, Cliente 1!")).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Resultado de Cliente 1" })).toBeVisible();
});

test("administrador alterna a visualizacao para conferir a experiencia do operador", async ({ context, page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "O seletor de visão fica no topo desktop");
  await context.addCookies([{ name: "lavamais-sessao-teste", value: "sessao-controlada-admin-operador-e2e", url: "http://127.0.0.1:3000", httpOnly: true, sameSite: "Lax" }]);
  await page.goto("/inicio");
  await expect(page.getByRole("combobox", { name: "Alterar visão do perfil" })).toBeVisible();
  await expect(page.getByText("Vendo como Operador")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Atendimento da recepção" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Importação" })).toHaveCount(0);
});

test("abre a navegacao em tela pequena", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Fluxo especifico da navegacao compacta");
  await page.goto("/clientes");
  await expect(page.getByRole("navigation", { name: "Navegação rápida" })).toBeVisible();
  await page.getByRole("button", { name: "Mais" }).click();
  await expect(page.getByRole("navigation", { name: "Navegação principal" })).toBeVisible();
});
