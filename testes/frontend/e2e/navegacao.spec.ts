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
  await expect(page.getByRole("progressbar", { name: "Progresso técnico: 100%" })).toBeVisible();
  await expect(page.getByText("R$ 150,00")).toBeVisible();
});

test("cria, simula e prepara uma ação com modelo publicado", async ({ page }) => {
  await page.getByRole("link", { name: "Nova ação comercial" }).click();
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
});

test("mostra o painel operacional para a recepção", async ({ context, page }) => {
  await context.addCookies([{ name: "lavamais-sessao-teste", value: "sessao-controlada-operador-e2e", url: "http://127.0.0.1:3000", httpOnly: true, sameSite: "Lax" }]);
  await page.goto("/inicio");
  await expect(page.getByRole("heading", { name: "Atendimento de hoje" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Importação" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Registrar movimentação" }).first()).toBeVisible();
});

test("abre a navegacao em tela pequena", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Fluxo especifico da navegacao compacta");
  await page.goto("/clientes");
  await expect(page.getByRole("navigation", { name: "Navegação rápida" })).toBeVisible();
  await page.getByRole("button", { name: "Mais" }).click();
  await expect(page.getByRole("navigation", { name: "Navegação principal" })).toBeVisible();
});
